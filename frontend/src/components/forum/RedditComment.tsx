"use client";

import React, { useState } from "react";
import axios from "axios";
import { formatRelativeTime } from "@/lib/dateUtils";
import Image from "next/image";
import SpoilerRevealModal from "./SpoilerRevealModal";
import EditHistoryModal from "./EditHistoryModal";

interface RedditCommentProps {
	comment: any;
	replies: any[];
	allReplies: Record<string, any[]>;
	currentUser: any;
	onCommentAdded: (comment: any) => void;
	onCommentLikeToggle: (commentId: string, liked: boolean) => void;
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
	onCommentLikeToggle,
	contentId,
	contentType,
	apiPath,
	refreshComments,
	depth = 0,
}) => {
	const [showReplyForm, setShowReplyForm] = useState(false);
	const [isLiking, setIsLiking] = useState(false);
	const [collapsed, setCollapsed] = useState(false);
	
	// Local state for optimistic updates
	const [localLikeCount, setLocalLikeCount] = useState(comment.likeCount || 0);
	const [localUserHasLiked, setLocalUserHasLiked] = useState(comment.userHasLiked || false);
	const [replyContent, setReplyContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [spoilerRevealed, setSpoilerRevealed] = useState(false);
	const [showSpoilerModal, setShowSpoilerModal] = useState(false);
	const [replyIsSpoiler, setReplyIsSpoiler] = useState(false);
	const [replySpoilerFor, setReplySpoilerFor] = useState("");
	const [replySpoilerDuration, setReplySpoilerDuration] = useState(30);

	// Edit state
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState("");
	const [editError, setEditError] = useState("");
	const [isSavingEdit, setIsSavingEdit] = useState(false);
	const [localEditCount, setLocalEditCount] = useState(comment.editCount || 0);
	const [localContent, setLocalContent] = useState(comment.content);
	const [showEditHistory, setShowEditHistory] = useState(false);

	const isAuthor = currentUser?.id === comment.userId;
	const isAdmin = currentUser?.role === "admin";
	const canDelete = isAuthor || isAdmin;
	const canEdit = comment.canEdit && isAuthor && contentType === "forum";
	const maxDepth = 5;
	const isDeleted = comment.content === "[deleted]" || localContent === "[deleted]";

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

		// Optimistic update
		const wasLiked = localUserHasLiked;
		const previousCount = localLikeCount;
		
		setLocalUserHasLiked(!wasLiked);
		setLocalLikeCount(wasLiked ? previousCount - 1 : previousCount + 1);
		setIsLiking(true);

		try {
			// Use the standard like endpoint pattern for all content types
			const response = await axios.post(`${apiPath}/${comment.id}/like`);
			
			// Update parent state to keep it in sync
			onCommentLikeToggle(comment.id, response.data.liked);
		} catch (err) {
			// Revert optimistic update on error
			console.error("Error liking comment:", err);
			setLocalUserHasLiked(wasLiked);
			setLocalLikeCount(previousCount);
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

	const handleEditClick = () => {
		setEditContent(localContent);
		setEditError("");
		setIsEditing(true);
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
		setEditContent("");
		setEditError("");
	};

	const handleSaveEdit = async () => {
		if (isSavingEdit) return;

		if (!editContent.trim()) {
			setEditError("Content is required");
			return;
		}

		try {
			setIsSavingEdit(true);
			setEditError("");

			const response = await axios.put(`/api/forum/comments/${comment.id}`, {
				content: editContent.trim(),
			});

			// Update local state
			setLocalContent(response.data.content);
			setLocalEditCount(response.data.editCount);
			setIsEditing(false);
		} catch (err: any) {
			console.error("Error saving comment:", err);
			setEditError(err.response?.data?.error || "Failed to save changes");
		} finally {
			setIsSavingEdit(false);
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
							{localEditCount > 0 && contentType === "forum" && (
								<button
									className="comment-edit-history-btn"
									onClick={() => setShowEditHistory(true)}
									title="View edit history"
								>
									({localEditCount})
								</button>
							)}
						</>
					)}
				</div>

				{!collapsed && (
					<>
						<div className="comment-body">
							{isEditing ? (
								<div className="comment-edit-form">
									<textarea
										className="comment-edit-textarea"
										value={editContent}
										onChange={(e) => setEditContent(e.target.value)}
										placeholder="Edit your comment..."
										maxLength={2000}
									/>
									{editError && (
										<div className="comment-edit-error">{editError}</div>
									)}
									<div className="comment-edit-actions">
										<button
											className="comment-edit-save-btn"
											onClick={handleSaveEdit}
											disabled={isSavingEdit}
										>
											{isSavingEdit ? "Saving..." : "Save"}
										</button>
										<button
											className="comment-edit-cancel-btn"
											onClick={handleCancelEdit}
											disabled={isSavingEdit}
										>
											Cancel
										</button>
										<span className="comment-edit-remaining">
											{5 - localEditCount} edits left
										</span>
									</div>
								</div>
							) : isDeleted ? (
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
									{localContent}
								</div>
							)}
						</div>

						<div className="comment-footer">
							<div className="comment-actions">
								{!isDeleted && !isEditing && (
									<>
								<button
									className={`comment-btn ${localUserHasLiked ? "liked" : ""}`}
									onClick={handleLike}
									disabled={!currentUser || isLiking}
								>
									<span>{localUserHasLiked ? "❤️" : "🤍"}</span>
									<span>{localLikeCount}</span>
								</button>										{currentUser && depth < maxDepth && (
											<button
												className="comment-btn"
												onClick={() => setShowReplyForm(!showReplyForm)}
											>
												Reply
											</button>
										)}

										{canEdit && (
											<button
												className="comment-btn"
												onClick={handleEditClick}
											>
												Edit
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
							onCommentLikeToggle={onCommentLikeToggle}
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

			{showEditHistory && contentType === "forum" && (
				<EditHistoryModal
					contentId={comment.id}
					contentType="comment"
					onClose={() => setShowEditHistory(false)}
				/>
			)}
		</div>
	);
};

export default RedditComment;
