"use client";

import type React from "react";
import type { TextBlockProps, FormatType } from "@/types/BlockTypes";
import { useState, useRef, useEffect, useCallback, memo } from "react";
import parse from "html-react-parser";
import { useTextUndoRedo } from "@/hooks/useUndoRedo";

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
  <div className="absolute top-full left-1/2 -translate-x-1/2 bg-linear-to-br from-[rgba(50,50,50,0.98)] to-[rgba(30,30,30,0.98)] border border-white/20 rounded-lg p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-[10px] z-100 mt-2 min-w-[280px]">
    <input
      type="text"
      placeholder="https://..."
      value={linkUrl}
      onChange={(e) => setLinkUrl(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          insertLink();
        } else if (e.key === "Escape") {
          onClose();
        }
      }}
      className="w-full py-3 px-3 mb-3 bg-[rgba(30,30,30,0.8)] border border-white/10 rounded-md text-white/90 outline-none transition-all duration-300 focus:border-[#ec1d24]"
      autoFocus
    />
    <div className="flex gap-2">
      <button 
        type="button" 
        onClick={insertLink}
        className="py-2 px-4 bg-[#ec1d24] border border-[#ec1d24] rounded-md text-white cursor-pointer transition-all duration-300 hover:opacity-85 flex-1"
      >
        Insert Link
      </button>
      <button 
        type="button" 
        onClick={onClose}
        className="py-2 px-4 bg-white/5 border border-white/10 rounded-md text-white/70 cursor-pointer transition-all duration-300 hover:opacity-85"
      >
        Cancel
      </button>
    </div>
  </div>
));

LinkPopup.displayName = "LinkPopup";

// Check if content has any HTML formatting
const hasFormatting = (text: string): boolean => {
  return /<[^>]+>/.test(text);
};

// Word count helper
const getWordCount = (text: string): number => {
  const stripped = text.replace(/<[^>]*>/g, "").trim();
  if (!stripped) return 0;
  return stripped.split(/\s+/).length;
};

// Format button component
const FormatButton = memo(({ 
  onClick, 
  label, 
  icon, 
  shortcut,
  isActive = false 
}: { 
  onClick: () => void; 
  label: string; 
  icon: React.ReactNode;
  shortcut?: string;
  isActive?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`py-1.5 px-2 md:px-3 border rounded text-sm cursor-pointer transition-all duration-300 flex items-center gap-1 group relative ${
      isActive 
        ? "bg-[rgba(236,29,36,0.2)] border-[#ec1d24] text-white" 
        : "border-white/10 bg-white/5 text-white/70 hover:bg-[rgba(236,29,36,0.15)] hover:border-[#ec1d24] hover:text-white"
    } focus-visible:outline-2 focus-visible:outline-[#ec1d24] focus-visible:outline-offset-2`}
    aria-label={label}
    title={shortcut ? `${label} (${shortcut})` : label}
  >
    {icon}
    {shortcut && (
      <span className="hidden lg:inline text-[10px] text-white/40 ml-1">{shortcut}</span>
    )}
  </button>
));

FormatButton.displayName = "FormatButton";

// Main component memoized to prevent unnecessary re-renders
const TextBlock: React.FC<TextBlockProps> = memo(({
  content,
  onChange,
  onDelete,
}) => {
  const [showLinkPopup, setShowLinkPopup] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Use undo/redo hook for text management
  const {
    state: text,
    setState: setText,
    undo,
    redo,
    canUndo,
    canRedo,
    syncExternal,
  } = useTextUndoRedo(content, onChange, { maxHistory: 100, debounceMs: 500 });
  
  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Sync external content changes
  useEffect(() => {
    syncExternal(content);
  }, [content, syncExternal]);

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

    // Update text with history
    setText(newText);
    
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
  }, [setText]);

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

    // Update text with history
    setText(newText);
    
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
  }, [linkUrl, setText, closePopup]);

  // Optimized text change handler
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setText(newValue);
  }, [setText]);

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          handleFormat('b');
          break;
        case 'i':
          e.preventDefault();
          handleFormat('i');
          break;
        case 'k':
          e.preventDefault();
          handleLink();
          break;
        case 'h':
          e.preventDefault();
          handleFormat('highlight');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
        case 'y':
          e.preventDefault();
          redo();
          break;
      }
    }
  }, [handleFormat, handleLink, undo, redo]);

  // Memoized format button handlers
  const handleBold = useCallback(() => handleFormat("b"), [handleFormat]);
  const handleItalic = useCallback(() => handleFormat("i"), [handleFormat]);
  const handleHighlight = useCallback(() => handleFormat("highlight"), [handleFormat]);
  
  // Memoized focus handlers
  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  const wordCount = getWordCount(text);

  return (
    <div className="relative bg-[rgba(40,40,40,0.4)] border border-white/10 rounded-xl overflow-visible transition-all duration-300 animate-[fadeInBlock_0.3s_ease-out] hover:border-white/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      <div className="absolute top-0 left-0 bg-linear-to-br from-[rgba(60,60,60,0.95)] to-[rgba(40,40,40,0.95)] py-1.5 px-4 rounded-tl-xl rounded-br-lg text-xs text-white/70 uppercase tracking-wider border-b border-r border-white/10 z-5">Text</div>
      
      {/* Toolbar */}
      <div className={`absolute top-0 right-0 flex flex-wrap gap-1 p-1.5 bg-linear-to-br from-[rgba(60,60,60,0.95)] to-[rgba(40,40,40,0.95)] rounded-tr-xl rounded-bl-lg border-b border-l border-white/10 z-5 transition-all duration-300 ${isFocused ? "opacity-100" : "opacity-70"} hover:opacity-100`}>
        {/* Undo/Redo */}
        <FormatButton
          onClick={undo}
          label="Undo"
          icon={<span className="text-base">↩</span>}
          shortcut="Ctrl+Z"
          isActive={false}
        />
        <FormatButton
          onClick={redo}
          label="Redo"
          icon={<span className="text-base">↪</span>}
          shortcut="Ctrl+Y"
          isActive={false}
        />
        <div className="w-px bg-white/20 mx-1" />
        {/* Formatting */}
        <FormatButton
          onClick={handleBold}
          label="Bold"
          icon={<span className="font-bold">B</span>}
          shortcut="Ctrl+B"
        />
        <FormatButton
          onClick={handleItalic}
          label="Italic"
          icon={<span className="italic">I</span>}
          shortcut="Ctrl+I"
        />
        <FormatButton
          onClick={handleHighlight}
          label="Highlight"
          icon={<span className="text-[#ec1d24]">H</span>}
          shortcut="Ctrl+H"
        />
        <FormatButton
          onClick={handleLink}
          label="Add Link"
          icon={<span>🔗</span>}
          shortcut="Ctrl+K"
        />
        <div className="w-px bg-white/20 mx-1" />
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`py-1.5 px-2 md:px-3 border rounded text-sm cursor-pointer transition-all duration-300 ${
            showPreview 
              ? "bg-[rgba(236,29,36,0.2)] border-[#ec1d24] text-white" 
              : "border-white/10 bg-white/5 text-white/70 hover:bg-[rgba(236,29,36,0.15)] hover:border-[#ec1d24] hover:text-white"
          }`}
          title="Toggle Preview"
        >
          👁️
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="py-1.5 px-2 border border-[rgba(220,53,69,0.3)] rounded bg-[rgba(220,53,69,0.2)] text-[#ff6b6b] text-sm cursor-pointer transition-all duration-300 hover:bg-[rgba(220,53,69,0.4)] hover:border-[#dc3545] focus-visible:outline-2 focus-visible:outline-[#ec1d24] focus-visible:outline-offset-2"
          aria-label="Delete block"
        >
          🗑️
        </button>
      </div>

      <div className="flex flex-col">
        {/* Editor / Preview Toggle */}
        {showPreview ? (
          <div className="pt-14 px-4 md:px-6 pb-6 min-h-[150px]">
            <div className="text-white/90 font-[BentonSansRegular] text-base leading-relaxed whitespace-pre-wrap [&_b]:font-bold [&_i]:italic [&_a]:text-[#ec1d24] [&_a]:underline">
              {text ? parse(text) : <span className="text-white/50 italic">Nothing to preview yet...</span>}
            </div>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            className="w-full min-h-[150px] pt-14 px-4 md:px-6 pb-6 bg-transparent border-none text-white/90 font-[BentonSansRegular] text-base leading-relaxed resize-y outline-none placeholder:text-white/50 focus:bg-white/2 field-sizing-content"
            placeholder="Start typing your content... (Select text and use toolbar or Ctrl+B for bold, Ctrl+I for italic)"
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        )}
        
        {/* Footer with word count and live preview hint */}
        <div className="flex items-center justify-between px-4 md:px-6 py-2 border-t border-white/5 bg-white/2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40">{wordCount} words</span>
            {(canUndo || canRedo) && (
              <span className="text-xs text-white/30">
                {canUndo && "Ctrl+Z to undo"}
                {canUndo && canRedo && " • "}
                {canRedo && "Ctrl+Y to redo"}
              </span>
            )}
          </div>
          {hasFormatting(text) && !showPreview && (
            <span className="text-xs text-white/40">Click 👁️ to preview formatting</span>
          )}
        </div>
      </div>
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