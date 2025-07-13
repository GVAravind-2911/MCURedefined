"use client";

import React, { useState } from "react";
import axios from "axios";
import { formatRelativeTime } from "@/lib/dateUtils";
import Image from "next/image";
import SpoilerRevealModal from "./SpoilerRevealModal";

interface RedditCommentProps {
	comment: any;
	replies: any[];
	allReplies: Record<string, any[]>;
	currentUser: any;
	onCommentAdded: (comment: any) => void;
	contentId: number | string;
	contentType: "blog" | "review" | "forum";
	apiPath: string;
	refreshComments: () => void;
	depth?: number;
}

const RedditComment: React.FC<RedditCommentProps> = ({
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
	const [collapsed, setCollapsed] = useState(false);
	const [replyContent, setReplyContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [spoilerRevealed, setSpoilerRevealed] = useState(false);
	const [showSpoilerModal, setShowSpoilerModal] = useState(false);
	const [replyIsSpoiler, setReplyIsSpoiler] = useState(false);
	const [replySpoilerFor, setReplySpoilerFor] = useState("");
	const [replySpoilerDuration, setReplySpoilerDuration] = useState(30);

	const isAuthor = currentUser?.id === comment.userId;
	const isAdmin = currentUser?.role === "admin";
	const canDelete = isAuthor || isAdmin;
	const maxDepth = 5;
	const isDeleted = comment.content === "[deleted]";

	// Check if spoiler has expired
	const isSpoilerActive = comment.isSpoiler && comment.spoilerExpiresAt && new Date(comment.spoilerExpiresAt) > new Date();

	const formatDate = (dateString: string) => {
		return formatRelativeTime(dateString);
	};

	const getUserInitials = (username: string) => {
		return username
			? username
					.split(" ")
					.map((n) => n[0])
					.join("")
					.toUpperCase()
					.slice(0, 2)
			: "?";
	};

	const handleLike = async () => {
		if (!currentUser || isLiking) return;

		try {
			setIsLiking(true);
			
			// Use the standard like endpoint pattern for all content types
			await axios.post(`${apiPath}/${comment.id}/like`);
			
			refreshComments();
		} catch (err) {
			console.error("Error liking comment:", err);
		} finally {
			setIsLiking(false);
		}
	};

	const handleDelete = async () => {
		if (!canDelete || isDeleting) return;

		if (!confirm("Are you sure you want to delete this comment?")) return;

		try {
			setIsDeleting(true);
			
			// For forum comments, use the specific delete endpoint
			if (contentType === "forum") {
				await axios.delete(`/api/forum/comments/${comment.id}`);
			} else {
				// For blog and review comments, use the old pattern
				await axios.delete(`${apiPath}/${comment.id}`);
			}
			
			refreshComments();
		} catch (err) {
			console.error("Error deleting comment:", err);
			alert("Failed to delete comment. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleReplySubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!replyContent.trim() || isSubmitting || !currentUser) return;

		try {
			setIsSubmitting(true);

			const paramName = 
				contentType === "blog" 
					? "blogId" 
					: contentType === "review" 
					? "reviewId" 
					: "topicId";

			const requestBody: Record<string, any> = {
				[paramName]: contentId,
				content: replyContent.trim(),
				parentId: comment.id,
			};

			// Add spoiler fields for forum comments
			if (contentType === "forum") {
				requestBody.isSpoiler = replyIsSpoiler;
				requestBody.spoilerFor = replyIsSpoiler ? replySpoilerFor : null;
				requestBody.spoilerDuration = replyIsSpoiler ? replySpoilerDuration : null;
			}

			const response = await axios.post(apiPath, requestBody);
			onCommentAdded(response.data);
			setReplyContent("");
			setShowReplyForm(false);
			setReplyIsSpoiler(false);
			setReplySpoilerFor("");
			setReplySpoilerDuration(30);
		} catch (err) {
			console.error("Error posting reply:", err);
			alert("Failed to post reply. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSpoilerReveal = () => {
		setShowSpoilerModal(true);
	};

	const handleSpoilerConfirm = () => {
		setSpoilerRevealed(true);
	};

	return (
		<div className={`thread-comment comment-depth-${Math.min(depth, 5)}`}>
			<div className="comment-content">
				<div className="comment-header">
					<button
						className="thread-collapse-btn"
						onClick={() => setCollapsed(!collapsed)}
						title={collapsed ? "Expand thread" : "Collapse thread"}
					>
						{collapsed ? "+" : "−"}
					</button>
					
					<div className="user-info">
						{isDeleted ? (
							<>
								<div className="user-avatar" style={{ width: "20px", height: "20px", fontSize: "0.7rem", backgroundColor: "#666" }}>
									❌
								</div>
								<span className="username" style={{ color: "#666" }}>[deleted]</span>
							</>
						) : (
							<>
								{comment.userImage ? (
									<Image
										src={comment.userImage}
										alt={comment.username}
										width={20}
										height={20}
										className="user-avatar"
										style={{ borderRadius: "50%" }}
									/>
								) : (
									<div className="user-avatar" style={{ width: "20px", height: "20px", fontSize: "0.7rem" }}>
										{getUserInitials(comment.username)}
									</div>
								)}
								<span className="username">{comment.username}</span>
								{isAuthor && <span className="author-badge">OP</span>}
							</>
						)}
					</div>
					<span>{formatDate(comment.createdAt)}</span>
					{comment.updatedAt !== comment.createdAt && (
						<>
							<span>edited</span>
						</>
					)}
				</div>

				{!collapsed && (
					<>
						<div className="comment-body">
							{isDeleted ? (
								<div className="deleted-comment">
									[This comment has been deleted]
								</div>
							) : isSpoilerActive && !spoilerRevealed ? (
								<div className="spoiler-warning">
									<div className="spoiler-content">
										<span className="spoiler-badge">⚠️ SPOILER</span>
										<p>This comment contains spoilers for: <strong>{comment.spoilerFor}</strong></p>
										<button className="spoiler-reveal-btn" onClick={handleSpoilerReveal}>
											Click to reveal spoiler
										</button>
									</div>
								</div>
							) : (
								<div className={`comment-text ${spoilerRevealed ? 'spoiler-revealed' : ''}`}>
									{comment.isSpoiler && (
										<span className="spoiler-badge-inline">🔍 Spoiler</span>
									)}
									{comment.content}
								</div>
							)}
						</div>

						<div className="comment-footer">
							<div className="comment-actions">
								{!isDeleted && (
									<>
										<button
											className={`comment-btn ${comment.userHasLiked ? "liked" : ""}`}
											onClick={handleLike}
											disabled={!currentUser || isLiking}
										>
											<span>{comment.userHasLiked ? "❤️" : "🤍"}</span>
											<span>{comment.likeCount || 0}</span>
										</button>
										
										{currentUser && depth < maxDepth && (
											<button
												className="comment-btn"
												onClick={() => setShowReplyForm(!showReplyForm)}
											>
												Reply
											</button>
										)}

										{canDelete && (
											<button
												className="comment-btn"
												onClick={handleDelete}
												disabled={isDeleting}
												style={{ color: "#dc3545" }}
											>
												{isDeleting ? "Deleting..." : "Delete"}
											</button>
										)}
									</>
								)}
							</div>
						</div>

						{showReplyForm && currentUser && (
							<form className="comment-form-reddit" onSubmit={handleReplySubmit}>
								<textarea
									className="comment-textarea-reddit"
									value={replyContent}
									onChange={(e) => setReplyContent(e.target.value)}
									placeholder="Write a reply..."
									disabled={isSubmitting}
									maxLength={2000}
								/>
								
								{/* Spoiler fields for forum reply comments */}
								{contentType === "forum" && (
									<div className="spoiler-form-section">
										<label className="spoiler-checkbox-label">
											<input
												type="checkbox"
												checked={replyIsSpoiler}
												onChange={(e) => setReplyIsSpoiler(e.target.checked)}
												className="spoiler-checkbox"
											/>
											<span className="spoiler-checkbox-text">Mark as spoiler</span>
										</label>
										
										{replyIsSpoiler && (
											<div className="spoiler-details">
												<div className="spoiler-field">
													<label className="spoiler-label">
														What is this a spoiler for?
														<input
															type="text"
															value={replySpoilerFor}
															onChange={(e) => setReplySpoilerFor(e.target.value)}
															placeholder="e.g., Spider-Man: No Way Home"
															className="spoiler-input"
															required
														/>
													</label>
												</div>
												<div className="spoiler-field">
													<label className="spoiler-label">
														Spoiler expires after (days)
														<input
															type="number"
															value={replySpoilerDuration}
															onChange={(e) => setReplySpoilerDuration(Number(e.target.value))}
															min="1"
															max="365"
															className="spoiler-input"
														/>
													</label>
												</div>
											</div>
										)}
									</div>
								)}
								
								<div className="comment-form-actions-reddit">
									<button
										type="button"
										className="comment-cancel-reddit"
										onClick={() => {
											setShowReplyForm(false);
											setReplyContent("");
											setReplyIsSpoiler(false);
											setReplySpoilerFor("");
											setReplySpoilerDuration(30);
										}}
										disabled={isSubmitting}
									>
										Cancel
									</button>
									<button
										type="submit"
										className="comment-submit-reddit"
										disabled={!replyContent.trim() || isSubmitting || (replyIsSpoiler && !replySpoilerFor.trim())}
									>
										{isSubmitting ? "Posting..." : "Reply"}
									</button>
								</div>
							</form>
						)}
					</>
				)}
			</div>

			{/* Nested replies */}
			{!collapsed && replies.length > 0 && (
				<div className="comment-replies">
					{replies.map((reply) => (
						<RedditComment
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
							depth={depth + 1}
						/>
					))}
				</div>
			)}

			<SpoilerRevealModal
				isOpen={showSpoilerModal}
				onClose={() => setShowSpoilerModal(false)}
				onConfirm={handleSpoilerConfirm}
				spoilerFor={comment.spoilerFor || "Unknown Content"}
			/>
		</div>
	);
};

export default RedditComment;
