"use client";

import type React from "react";
import { useState } from "react";
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

const Comment: React.FC<CommentProps> = ({
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
}) => {
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
			<div className={`comment-replies ${currentDepth > 0 ? "nested" : ""}`}>
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

	return (
		<div className={`comment-container ${depth > 0 ? `depth-${depth}` : ""}`}>
			<div className={`comment ${comment.deleted ? "comment-deleted" : ""}`}>
				<div className="comment-header">
					<div className="comment-user">
						{comment.userImage ? (
							<Image
								src={comment.userImage}
								alt={comment.username || "User"}
								width={32}
								height={32}
								className="comment-avatar"
							/>
						) : (
							<div className="comment-avatar-placeholder">
								{comment.username ? comment.username[0].toUpperCase() : "?"}
							</div>
						)}
						<span className="comment-username">
							{comment.username || "[deleted]"}
						</span>
						<span className="comment-date">
							{moment(comment.createdAt).fromNow()}
						</span>
					</div>

					{canDelete && !comment.deleted && (
						<button
							className="comment-delete-button"
							onClick={handleDelete}
							disabled={isDeleting}
							type="button"
						>
							Delete
						</button>
					)}
				</div>

				<div className="comment-content">{comment.content}</div>

				<div className="comment-actions">
					{currentUser && !comment.deleted && (
						// Update the like button in Comment.tsx
						<button
							className={`comment-like-button ${comment.userHasLiked ? "liked" : ""}`}
							onClick={handleLike}
							disabled={isLiking}
							type="button"
						>
							<svg
								className="heart-icon"
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
							>
								<title>Like</title>
								<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
							</svg>
							{comment.likes > 0 && comment.likes}
						</button>
					)}

					{currentUser && !comment.deleted && (
						<button
							className="comment-reply-button"
							type="button"
							onClick={() => setShowReplyForm(!showReplyForm)}
						>
							Reply
						</button>
					)}

					{replies && replies.length > 0 && (
						<button
							className="comment-toggle-replies"
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
};

export default Comment;
