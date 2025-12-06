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
		<form
			className="mb-8 bg-[rgba(40,40,40,0.3)] p-4 rounded-lg transition-all duration-300 focus-within:bg-[rgba(50,50,50,0.5)]"
			onSubmit={handleSubmit}
		>
			<textarea
				ref={textareaRef}
				value={content}
				onChange={(e) => setContent(e.target.value)}
				onInput={handleInput}
				placeholder={placeholder}
				className="w-full min-h-20 py-3 px-3 border border-white/20 rounded-md bg-[rgba(30,30,30,0.5)] text-white font-['BentonSansRegular'] resize-none transition-all duration-300 mb-2 text-base overflow-hidden focus:outline-none focus:border-[rgba(236,29,36,0.6)] focus:bg-[rgba(40,40,40,0.7)] placeholder:text-white/50"
				rows={1}
				disabled={isSubmitting}
				maxLength={2000}
			/>
			<div className="flex justify-end gap-3">
				<button
					type="button"
					className="py-2 px-4 rounded-full border border-white/30 bg-transparent text-white/70 font-['BentonSansRegular'] text-sm cursor-pointer transition-all duration-300 hover:text-white hover:border-white disabled:opacity-50 disabled:cursor-not-allowed"
					onClick={() => setContent("")}
					disabled={!content.trim() || isSubmitting}
				>
					Cancel
				</button>
				<button
					type="submit"
					className="py-2 px-4 rounded-full border-none bg-[rgba(236,29,36,0.8)] text-white font-['BentonSansRegular'] text-sm cursor-pointer transition-all duration-300 hover:bg-[#ec1d24] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={!content.trim() || isSubmitting}
				>
					{isSubmitting ? "Posting..." : "Post"}
				</button>
			</div>
		</form>
	);
};

export default CommentForm;
