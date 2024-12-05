import { useState, useRef, useEffect } from "react";

const TextBlock = ({ content, onChange, onDelete }) => {
    const [showLinkPopup, setShowLinkPopup] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [text, setText] = useState(content);
    const [isFocused, setIsFocused] = useState(false);
    const textareaId = `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const textareaRef = useRef(null);

    useEffect(() => {
        adjustTextareaHeight();
    }, [text]);

    const handleFormat = (tag) => {
        const textarea = document.getElementById(textareaId);
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.slice(start, end);

        let newText;
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
        onChange(newText); // Pass the updated text to the parent component
    };

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    const handleLink = () => {
        setShowLinkPopup(true);
    };

    const insertLink = () => {
        const textarea = document.getElementById(textareaId);
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.slice(start, end);

        const newText = [
            textarea.value.slice(0, start),
            `<a href="${linkUrl}">${selectedText}</a>`,
            textarea.value.slice(end),
        ].join("");

        setText(newText);
        onChange(newText); // Pass the updated text to the parent component
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
                >
                    B
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat("i")}
                    className="format-button"
                >
                    I
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat("highlight")}
                    className="format-button"
                >
                    Highlight
                </button>
                <button type="button" onClick={handleLink} className="format-button">
                    Link
                </button>
                <button type="button" onClick={onDelete} className="delete-button">
                    🗑️
                </button>
            </div>
            <textarea
                id={textareaId}
                ref={textareaRef}
                value={text}
                onChange={(e) => {
                    setText(e.target.value);
                    onChange(e.target.value); // Pass the updated text to the parent component
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
                        onChange={(e) => setLinkUrl(e.target.value)}
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