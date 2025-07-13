"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { authClient } from "@/lib/auth/auth-client";

interface CommentFormProps {
	contentId: number;
	contentType: "blog" | "review" | "forum";
	parentId?: string;
	apiPath: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	onCommentAdded: (comment: any) => void;
	placeholder?: string;
	autoFocus?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
	contentId,
	contentType,
	parentId,
	apiPath,
	onCommentAdded,
	placeholder = "Add a comment...",
	autoFocus = false,
}) => {
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const { data: session } = authClient.useSession();

	useEffect(() => {
		if (autoFocus && textareaRef.current) {
			textareaRef.current.focus();
		}
	}, [autoFocus]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!content.trim() || isSubmitting || !session?.user) return;

		try {
			setIsSubmitting(true);

			// Get parameter name based on content type
			const paramName = 
				contentType === "blog" 
					? "blogId" 
					: contentType === "review" 
					? "reviewId" 
					: "topicId";

			// Prepare request body
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const requestBody: Record<string, any> = {
				[paramName]: contentId,
				content: content.trim(),
				parentId: parentId || null,
			};

			const response = await axios.post(apiPath, requestBody);

			onCommentAdded(response.data);
			setContent("");
		} catch (err) {
			console.error("Error posting comment:", err);
			alert("Failed to post comment. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Auto-resize textarea
	const handleInput = () => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto";
			textarea.style.height = `${textarea.scrollHeight}px`;
		}
	};

	return (
		<form className="comment-form" onSubmit={handleSubmit}>
			<textarea
				ref={textareaRef}
				value={content}
				onChange={(e) => setContent(e.target.value)}
				onInput={handleInput}
				placeholder={placeholder}
				className="comment-textarea"
				rows={1}
				disabled={isSubmitting}
				maxLength={2000}
			/>
			<div className="comment-form-actions">
				<button
					type="button"
					className="comment-cancel"
					onClick={() => setContent("")}
					disabled={!content.trim() || isSubmitting}
				>
					Cancel
				</button>
				<button
					type="submit"
					className="comment-submit"
					disabled={!content.trim() || isSubmitting}
				>
					{isSubmitting ? "Posting..." : "Post"}
				</button>
			</div>
		</form>
	);
};

export default CommentForm;
