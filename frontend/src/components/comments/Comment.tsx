"use client";

import type React from "react";
import { useState, memo, useCallback } from "react";
import axios from "axios";
import moment from "moment";
import Image from "next/image";
import CommentForm from "./CommentForm";

interface CommentProps {
	comment: any;
	replies: any[];
	allReplies: Record<string, any[]>;
	currentUser: any;
	onCommentAdded: (comment: any) => void;
	contentId: number;
	contentType: "blog" | "review" | "forum";
	apiPath: string;
	refreshComments: () => void;
	depth?: number;
}

const Comment = memo(function Comment({
	comment,
	replies,
	allReplies,
	currentUser,
	onCommentAdded,
	contentId,
	contentType,
	apiPath,
	refreshComments,
	depth = 0,
}: CommentProps) {
	const [showReplyForm, setShowReplyForm] = useState(false);
	const [isLiking, setIsLiking] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showReplies, setShowReplies] = useState(depth < 2); // Auto-expand first 2 levels

	const isAuthor = currentUser?.id === comment.userId;
	const isAdmin = currentUser?.role === "admin";
	const canDelete = isAuthor || isAdmin;
	const maxDepth = 5; // Limit nesting depth for readability

	const handleLike = async () => {
		if (!currentUser || isLiking) return;

		try {
			setIsLiking(true);
			const response = await axios.post(`${apiPath}/${comment.id}/like`);
			// Optimistic update
			comment.likes = response.data.likes;
			comment.userHasLiked = response.data.liked;
			setIsLiking(false);
		} catch (err) {
			console.error("Error liking comment:", err);
			setIsLiking(false);
			refreshComments(); // Refresh on error
		}
	};

	const handleDelete = async () => {
		if (!canDelete || isDeleting) return;

		if (!confirm("Are you sure you want to delete this comment?")) return;

		try {
			setIsDeleting(true);
			await axios.delete(`${apiPath}/${comment.id}`);
			refreshComments();
		} catch (err) {
			console.error("Error deleting comment:", err);
			setIsDeleting(false);
		}
	};

	// Recursively render all nested replies
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const renderReplies = (replyItems: any[], currentDepth: number) => {
		if (!replyItems || replyItems.length === 0) return null;

		return (
			<div className={`mt-2.5 ml-4 pl-3 border-l-2 border-[rgba(236,29,36,0.5)] ${currentDepth > 0 ? "nested" : ""}`}>
				{replyItems.map((reply) => (
					<Comment
						key={reply.id}
						comment={reply}
						replies={allReplies[reply.id] || []}
						allReplies={allReplies}
						currentUser={currentUser}
						onCommentAdded={onCommentAdded}
						contentId={contentId}
						contentType={contentType}
						apiPath={apiPath}
						refreshComments={refreshComments}
						depth={currentDepth + 1}
					/>
				))}
			</div>
		);
	};

	// Don't render if deleted and no replies
	if (comment.deleted && (!replies || replies.length === 0)) {
		return null;
	}

	// Calculate background opacity based on depth
	const getDepthBgClass = () => {
		if (depth === 0) return "bg-[rgba(40,40,40,0.3)]";
		if (depth === 1) return "bg-[rgba(45,45,45,0.4)]";
		if (depth === 2) return "bg-[rgba(50,50,50,0.5)]";
		return "bg-[rgba(55,55,55,0.6)]";
	};

	return (
		<div className="relative">
			<div className={`${getDepthBgClass()} rounded-lg p-4 transition-all duration-300 mb-1 hover:bg-[rgba(50,50,50,0.4)] ${comment.deleted ? "comment-deleted" : ""}`}>
				<div className="flex justify-between items-center mb-3 flex-wrap gap-2 md:items-start">
					<div className="flex items-center gap-2 flex-wrap md:w-full">
						{comment.userImage ? (
							<Image
								src={comment.userImage}
								alt={comment.username || "User"}
								width={32}
								height={32}
								className="w-8 h-8 rounded-full object-cover"
							/>
						) : (
							<div className="w-8 h-8 rounded-full bg-[#ec1d24] text-white flex items-center justify-center font-['BentonSansBold'] text-base">
								{comment.username ? comment.username[0].toUpperCase() : "?"}
							</div>
						)}
						<span className="text-white font-['BentonSansBold'] text-[0.95rem]">
							{comment.username || "[deleted]"}
						</span>
						<span className="text-white/50 text-[0.8rem] font-['BentonSansRegular']">
							{moment(comment.createdAt).fromNow()}
						</span>
					</div>

					{canDelete && !comment.deleted && (
						<button
							className="bg-transparent border-none text-red-400/70 text-[0.85rem] font-['BentonSansRegular'] cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-1.5 py-1.5 px-3.5 rounded whitespace-nowrap h-8 shrink-0 hover:text-red-500 hover:bg-red-500/10"
							onClick={handleDelete}
							disabled={isDeleting}
							type="button"
						>
							Delete
						</button>
					)}
				</div>

				<div className={`text-white font-['BentonSansRegular'] leading-relaxed mb-4 wrap-break-word whitespace-pre-wrap ${comment.deleted ? "text-white/50 italic" : ""}`}>
					{comment.content}
				</div>

				<div className="flex items-center gap-3 mt-3 flex-nowrap overflow-x-auto pb-1 scrollbar-hide">
					{currentUser && !comment.deleted && (
						<button
							className={`bg-transparent border-none text-white/70 text-[0.85rem] font-['BentonSansRegular'] cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-1.5 py-1.5 px-3.5 rounded whitespace-nowrap h-8 shrink-0 hover:text-white hover:bg-white/10 ${comment.userHasLiked ? "text-[#ec1d24]" : ""}`}
							onClick={handleLike}
							disabled={isLiking}
							type="button"
						>
							<svg
								className={`transition-all duration-300 ${comment.userHasLiked ? "fill-[#ec1d24] stroke-[#ec1d24] animate-[pulse_0.4s]" : "fill-none stroke-current"}`}
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								strokeWidth="2"
							>
								<title>Like</title>
								<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
							</svg>
							{comment.likes > 0 && <span className="inline m-0 text-[0.85rem]">{comment.likes}</span>}
						</button>
					)}

					{currentUser && !comment.deleted && (
						<button
							className="bg-transparent border-none text-white/70 text-[0.85rem] font-['BentonSansRegular'] cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-1.5 py-1.5 px-3.5 rounded whitespace-nowrap h-8 shrink-0 hover:text-white hover:bg-white/10"
							type="button"
							onClick={() => setShowReplyForm(!showReplyForm)}
						>
							Reply
						</button>
					)}

					{replies && replies.length > 0 && (
						<button
							className="bg-transparent border-none text-white/70 text-[0.85rem] font-['BentonSansRegular'] cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-1.5 py-1.5 px-3.5 rounded whitespace-nowrap h-8 shrink-0 hover:text-white hover:bg-white/10"
							onClick={() => setShowReplies(!showReplies)}
							type="button"
						>
							{showReplies ? "Hide" : "Show"} {replies.length}{" "}
							{replies.length === 1 ? "reply" : "replies"}
						</button>
					)}
				</div>

				{showReplyForm && (
					<CommentForm
						contentId={contentId}
						contentType={contentType}
						parentId={comment.id}
						apiPath={apiPath}
						onCommentAdded={(newComment) => {
							onCommentAdded(newComment);
							setShowReplyForm(false);
							setShowReplies(true);
						}}
						placeholder={`Reply to ${comment.username}...`}
						autoFocus
					/>
				)}
			</div>

			{showReplies && depth < maxDepth && renderReplies(replies, depth)}
		</div>
	);
});

Comment.displayName = "Comment";

export default Comment;
