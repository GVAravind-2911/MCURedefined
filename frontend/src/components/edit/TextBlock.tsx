"use client";

import type React from "react";
import type { TextBlockProps, FormatType } from "@/types/BlockTypes";
import { useState, useRef, useEffect, useCallback, memo } from "react";

// Extracted LinkPopup component to prevent unnecessary re-renders
const LinkPopup = memo(({ 
  linkUrl, 
  setLinkUrl, 
  insertLink, 
  onClose 
}: { 
  linkUrl: string; 
  setLinkUrl: (url: string) => void; 
  insertLink: () => void; 
  onClose: () => void; 
}) => (
  <div className="link-popup">
    <input
      type="text"
      placeholder="URL"
      value={linkUrl}
      onChange={(e) => setLinkUrl(e.target.value)}
    />
    <button type="button" onClick={insertLink}>
      Insert Link
    </button>
    <button type="button" onClick={onClose}>
      Cancel
    </button>
  </div>
));

LinkPopup.displayName = "LinkPopup";

// Main component memoized to prevent unnecessary re-renders
const TextBlock: React.FC<TextBlockProps> = memo(({
  content,
  onChange,
  onDelete,
}) => {
  const [showLinkPopup, setShowLinkPopup] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [text, setText] = useState<string>(content);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // Optimized debounce with cleanup
  const debouncedOnChange = useCallback(
    (() => {
      let timeout: NodeJS.Timeout | null = null;
      return (value: string) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          onChange(value);
        }, 150); // Increased to 150ms for better performance
      };
    })(),
    [onChange]
  );

  // Optimized text formatting
  const handleFormat = useCallback((tag: FormatType): void => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // No selection, do nothing
    if (start === end) return;
    
    const selectedText = textarea.value.slice(start, end);
    const beforeText = textarea.value.slice(0, start);
    const afterText = textarea.value.slice(end);

    let taggedText: string;
    if (tag === "highlight") {
      taggedText = `<b><i style='color: #ec1d24'>${selectedText}</i></b>`;
    } else {
      taggedText = `<${tag}>${selectedText}</${tag}>`;
    }

    const newText = beforeText + taggedText + afterText;

    // Batch state updates
    setText(newText);
    debouncedOnChange(newText);
    
    // More efficient cursor position maintenance
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start + tag.length + 2, 
          start + tag.length + 2 + selectedText.length
        );
      }
    });
  }, [debouncedOnChange]);

  const handleLink = useCallback((): void => {
    setShowLinkPopup(true);
  }, []);

  const closePopup = useCallback((): void => {
    setShowLinkPopup(false);
    setLinkUrl("");
  }, []);

  const insertLink = useCallback((): void => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // No selection, do nothing
    if (start === end) {
      closePopup();
      return;
    }
    
    const selectedText = textarea.value.slice(start, end);
    const beforeText = textarea.value.slice(0, start);
    const afterText = textarea.value.slice(end);
    
    const taggedText = `<a href="${linkUrl}">${selectedText}</a>`;
    const newText = beforeText + taggedText + afterText;

    // Batch state updates
    setText(newText);
    debouncedOnChange(newText);
    
    // Close popup
    closePopup();
    
    // Handle cursor position
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start, 
          start + taggedText.length
        );
      }
    });
  }, [linkUrl, debouncedOnChange, closePopup]);

  // Optimized text change handler
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setText(newValue);
    debouncedOnChange(newValue);
  }, [debouncedOnChange]);

  // Memoized format button handlers
  const handleBold = useCallback(() => handleFormat("b"), [handleFormat]);
  const handleItalic = useCallback(() => handleFormat("i"), [handleFormat]);
  const handleHighlight = useCallback(() => handleFormat("highlight"), [handleFormat]);
  
  // Memoized focus handlers
  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  return (
    <div className="content-block">
      <div className="block-type">Text</div>
      <div className={`block-actions ${isFocused ? "focused" : ""}`}>
        <button
          type="button"
          onClick={handleBold}
          className="format-button"
          aria-label="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="format-button"
          aria-label="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={handleHighlight}
          className="format-button"
          aria-label="Highlight"
        >
          Highlight
        </button>
        <button
          type="button"
          onClick={handleLink}
          className="format-button"
          aria-label="Add Link"
        >
          Link
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="delete-button"
          aria-label="Delete block"
        >
          🗑️
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        className="content-text"
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {showLinkPopup && (
        <LinkPopup
          linkUrl={linkUrl}
          setLinkUrl={setLinkUrl}
          insertLink={insertLink}
          onClose={closePopup}
        />
      )}
    </div>
  );
});

TextBlock.displayName = "TextBlock";

export default TextBlock;