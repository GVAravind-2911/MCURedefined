'use client'

import type React from "react";
import type { TextBlockProps, FormatType } from "@/types/BlockTypes";
import { useState, useRef, useEffect } from "react";

const TextBlock: React.FC<TextBlockProps> = ({ content, onChange, onDelete }) => {
  const [showLinkPopup, setShowLinkPopup] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [text, setText] = useState<string>(content);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textareaId, setTextareaId] = useState<string>('initial-textarea');

  useEffect(() => {
    setTextareaId(`textarea-${Math.random().toString(36).substring(2)}`);
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [text]);

  const handleFormat = (tag: FormatType): void => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.slice(start, end);

    let newText: string;
    if (tag === "highlight") {
      newText = [
        textarea.value.slice(0, start),
        `<b><i style='color: #ec1d24'>${selectedText}</i></b>`,
        textarea.value.slice(end),
      ].join("");
    } else {
      newText = [
        textarea.value.slice(0, start),
        `<${tag}>${selectedText}</${tag}>`,
        textarea.value.slice(end),
      ].join("");
    }

    setText(newText);
    onChange(newText);
  };

  const adjustTextareaHeight = (): void => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleLink = (): void => {
    setShowLinkPopup(true);
  };

  const insertLink = (): void => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.slice(start, end);

    const newText = [
      textarea.value.slice(0, start),
      `<a href="${linkUrl}">${selectedText}</a>`,
      textarea.value.slice(end),
    ].join("");

    setText(newText);
    onChange(newText);
    setShowLinkPopup(false);
    setLinkUrl("");
  };

  return (
    <div className="content-block">
      <div className="block-type">Text</div>
      <div className={`block-actions ${isFocused ? "focused" : ""}`}>
        <button
          type="button"
          onClick={() => handleFormat("b")}
          className="format-button"
          aria-label="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => handleFormat("i")}
          className="format-button"
          aria-label="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => handleFormat("highlight")}
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
        id={textareaId}
        ref={textareaRef}
        value={text}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          setText(e.target.value);
          onChange(e.target.value);
          adjustTextareaHeight();
        }}
        className="content-text"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {showLinkPopup && (
        <div className="link-popup">
          <input
            type="text"
            placeholder="URL"
            value={linkUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLinkUrl(e.target.value)}
          />
          <button type="button" onClick={insertLink}>
            Insert Link
          </button>
          <button type="button" onClick={() => setShowLinkPopup(false)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default TextBlock;