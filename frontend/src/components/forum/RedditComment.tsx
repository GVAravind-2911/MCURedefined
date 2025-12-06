"use client";

import { useState, memo, useCallback } from "react";
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
	disabled?: boolean;
	hideDeletedWithoutReplies?: boolean;
}

const RedditComment = memo(function RedditComment({
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
	disabled = false,
	hideDeletedWithoutReplies = false,
}: RedditCommentProps) {
	// Determine if this deleted comment should start collapsed
	const isDeletedContent = comment.deleted || comment.content === "[deleted]";
	const hasNoReplies = replies.length === 0;
	const shouldStartCollapsed =
		hideDeletedWithoutReplies && isDeletedContent && hasNoReplies;

	const [showReplyForm, setShowReplyForm] = useState(false);
	const [isLiking, setIsLiking] = useState(false);
	const [collapsed, setCollapsed] = useState(shouldStartCollapsed);

	// Local state for optimistic updates
	const [localLikeCount, setLocalLikeCount] = useState(comment.likeCount || 0);
	const [localUserHasLiked, setLocalUserHasLiked] = useState(
		comment.userHasLiked || false,
	);
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
	const isDeleted =
		comment.deleted ||
		comment.content === "[deleted]" ||
		localContent === "[deleted]";

	// Check if spoiler has expired
	const isSpoilerActive =
		comment.isSpoiler &&
		comment.spoilerExpiresAt &&
		new Date(comment.spoilerExpiresAt) > new Date();

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

		if (editContent.trim() === localContent.trim()) {
			setEditError("No changes to save");
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
				requestBody.spoilerDuration = replyIsSpoiler
					? replySpoilerDuration
					: null;
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
		<div
			className={`relative border-l-2 ${depth === 0 ? "border-l-[#ec1d24]/30" : depth === 1 ? "border-l-[#7289da]/30" : depth === 2 ? "border-l-[#43b581]/30" : depth === 3 ? "border-l-[#faa61a]/30" : depth === 4 ? "border-l-[#f47fff]/30" : "border-l-white/20"} ${depth > 0 ? "ml-4" : ""} py-2`}
		>
			<div className="pl-3">
				<div className="flex items-center gap-2 text-xs text-white/60">
					<button
						className="w-5 h-5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded border-none bg-transparent cursor-pointer transition-all duration-200 text-sm font-[BentonSansBold]"
						onClick={() => setCollapsed(!collapsed)}
						title={collapsed ? "Expand thread" : "Collapse thread"}
					>
						{collapsed ? "+" : "−"}
					</button>

					<div className="flex items-center gap-1.5">
						{isDeleted ? (
							<>
								<div className="w-5 h-5 rounded-full bg-[#666] flex items-center justify-center text-[0.7rem]">
									❌
								</div>
								<span className="font-[BentonSansBook] text-[#666]">
									[deleted]
								</span>
							</>
						) : (
							<>
								{comment.userImage ? (
									<Image
										src={comment.userImage}
										alt={comment.username}
										width={20}
										height={20}
										className="rounded-full"
									/>
								) : (
									<div className="w-5 h-5 rounded-full bg-[#ec1d24] flex items-center justify-center text-[0.7rem] text-white font-[BentonSansBold]">
										{getUserInitials(comment.username)}
									</div>
								)}
								<span className="font-[BentonSansBook] text-white/90">
									{comment.username}
								</span>
								{isAuthor && (
									<span className="bg-[#ec1d24] text-white text-[0.65rem] px-1.5 py-0.5 rounded font-[BentonSansBold]">
										OP
									</span>
								)}
							</>
						)}
					</div>
					<span>{formatDate(comment.createdAt)}</span>
					{comment.updatedAt !== comment.createdAt && (
						<>
							<span>edited</span>
							{localEditCount > 0 && contentType === "forum" && (
								<button
									className="text-white/50 hover:text-white/80 bg-transparent border-none cursor-pointer text-xs underline transition-colors duration-200"
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
						<div className="mt-2 text-white/90 text-[0.95rem] leading-relaxed font-[BentonSansRegular]">
							{isEditing ? (
								<div className="flex flex-col gap-2">
									<textarea
										className="w-full min-h-20 p-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm font-[BentonSansRegular] resize-y transition-all duration-200 focus:outline-none focus:border-[#ec1d24]"
										value={editContent}
										onChange={(e) => setEditContent(e.target.value)}
										placeholder="Edit your comment..."
										maxLength={2000}
									/>
									{editError && (
										<div className="text-[#dc3545] text-xs">{editError}</div>
									)}
									<div className="flex items-center gap-2">
										<button
											className="py-1.5 px-3 bg-[#ec1d24] text-white text-xs font-[BentonSansBold] rounded cursor-pointer transition-all duration-200 border-none disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[#d01c22]"
											onClick={handleSaveEdit}
											disabled={
												isSavingEdit ||
												!editContent.trim() ||
												editContent.trim() === localContent.trim()
											}
											title={
												editContent.trim() === localContent.trim()
													? "No changes to save"
													: ""
											}
										>
											{isSavingEdit ? "Saving..." : "Save"}
										</button>
										<button
											className="py-1.5 px-3 bg-transparent text-white/60 text-xs font-[BentonSansRegular] rounded cursor-pointer transition-all duration-200 border border-white/20 disabled:opacity-50 hover:not-disabled:text-white hover:not-disabled:border-white/40"
											onClick={handleCancelEdit}
											disabled={isSavingEdit}
										>
											Cancel
										</button>
										<span className="text-white/40 text-xs ml-auto">
											{5 - localEditCount} edits left
										</span>
									</div>
								</div>
							) : isDeleted ? (
								<div className="text-white/40 italic">
									[This comment has been deleted]
								</div>
							) : isSpoilerActive && !spoilerRevealed ? (
								<div className="bg-[rgba(255,165,0,0.1)] border border-[rgba(255,165,0,0.3)] rounded-lg p-4 text-center">
									<div className="flex flex-col items-center gap-2">
										<span className="bg-[#ffa500] text-black text-xs px-2 py-1 rounded font-[BentonSansBold]">
											⚠️ SPOILER
										</span>
										<p className="text-white/80 text-sm m-0">
											This comment contains spoilers for:{" "}
											<strong>{comment.spoilerFor}</strong>
										</p>
										<button
											className="bg-[rgba(255,165,0,0.2)] text-[#ffa500] border border-[rgba(255,165,0,0.4)] py-2 px-4 rounded-lg text-sm cursor-pointer transition-all duration-200 hover:bg-[rgba(255,165,0,0.3)]"
											onClick={handleSpoilerReveal}
										>
											Click to reveal spoiler
										</button>
									</div>
								</div>
							) : (
								<div
									className={`${spoilerRevealed ? "bg-[rgba(255,165,0,0.05)] border border-[rgba(255,165,0,0.2)] rounded-lg p-3" : ""}`}
								>
									{comment.isSpoiler && (
										<span className="text-[#ffa500] text-xs mr-2">
											🔍 Spoiler
										</span>
									)}
									{localContent}
								</div>
							)}
						</div>

						<div className="mt-2">
							<div className="flex items-center gap-1">
								{!isDeleted && !isEditing && (
									<>
										<button
											className={`flex items-center gap-1 py-1 px-2 bg-transparent border-none text-white/60 text-xs cursor-pointer transition-all duration-200 rounded hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed ${localUserHasLiked ? "text-[#ec1d24]" : ""}`}
											onClick={handleLike}
											disabled={!currentUser || isLiking}
										>
											<span>{localUserHasLiked ? "❤️" : "🤍"}</span>
											<span>{localLikeCount}</span>
										</button>{" "}
										{currentUser && depth < maxDepth && !disabled && (
											<button
												className="flex items-center gap-1 py-1 px-2 bg-transparent border-none text-white/60 text-xs cursor-pointer transition-all duration-200 rounded hover:bg-white/10 hover:text-white"
												onClick={() => setShowReplyForm(!showReplyForm)}
											>
												Reply
											</button>
										)}
										{canEdit && (
											<button
												className="flex items-center gap-1 py-1 px-2 bg-transparent border-none text-white/60 text-xs cursor-pointer transition-all duration-200 rounded hover:bg-white/10 hover:text-white"
												onClick={handleEditClick}
											>
												Edit
											</button>
										)}
										{canDelete && (
											<button
												className="flex items-center gap-1 py-1 px-2 bg-transparent border-none text-[#dc3545] text-xs cursor-pointer transition-all duration-200 rounded hover:bg-[rgba(220,53,69,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
												onClick={handleDelete}
												disabled={isDeleting}
											>
												{isDeleting ? "Deleting..." : "Delete"}
											</button>
										)}
									</>
								)}
							</div>
						</div>

						{showReplyForm && currentUser && (
							<form
								className="bg-white/5 rounded-lg p-3 mt-3 border border-white/10"
								onSubmit={handleReplySubmit}
							>
								<textarea
									className="w-full min-h-20 p-3 bg-white/5 border border-white/20 rounded-lg text-white font-[BentonSansRegular] text-sm resize-y transition-all duration-300 ease-in-out focus:outline-none focus:border-[#ec1d24] focus:bg-white/10"
									value={replyContent}
									onChange={(e) => setReplyContent(e.target.value)}
									placeholder="Write a reply..."
									disabled={isSubmitting}
									maxLength={2000}
								/>

								{/* Spoiler fields for forum reply comments */}
								{contentType === "forum" && (
									<div className="mt-3 p-3 bg-[rgba(255,165,0,0.05)] border border-[rgba(255,165,0,0.2)] rounded-lg">
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												checked={replyIsSpoiler}
												onChange={(e) => setReplyIsSpoiler(e.target.checked)}
												className="accent-[#ffa500] scale-[1.2] cursor-pointer"
											/>
											<span className="text-white/80 text-sm font-[BentonSansBook]">
												Mark as spoiler
											</span>
										</label>

										{replyIsSpoiler && (
											<div className="mt-3 flex flex-col gap-3 pl-6 border-l-2 border-[rgba(255,165,0,0.3)]">
												<div className="flex flex-col gap-1.5">
													<label className="text-sm text-white/70">
														What is this a spoiler for?
														<input
															type="text"
															value={replySpoilerFor}
															onChange={(e) =>
																setReplySpoilerFor(e.target.value)
															}
															placeholder="e.g., Spider-Man: No Way Home"
															className="mt-1.5 w-full py-2 px-3 bg-white/5 border border-[rgba(255,165,0,0.2)] rounded-lg text-white text-sm font-[BentonSansRegular] transition-all duration-300 ease-in-out focus:outline-none focus:border-[#ffa500] focus:bg-[rgba(255,165,0,0.05)]"
															required
														/>
													</label>
												</div>
												<div className="flex flex-col gap-1.5">
													<label className="text-sm text-white/70">
														Spoiler expires after (days)
														<input
															type="number"
															value={replySpoilerDuration}
															onChange={(e) =>
																setReplySpoilerDuration(Number(e.target.value))
															}
															min="1"
															max="365"
															className="mt-1.5 w-full py-2 px-3 bg-white/5 border border-[rgba(255,165,0,0.2)] rounded-lg text-white text-sm font-[BentonSansRegular] transition-all duration-300 ease-in-out focus:outline-none focus:border-[#ffa500] focus:bg-[rgba(255,165,0,0.05)]"
														/>
													</label>
												</div>
											</div>
										)}
									</div>
								)}

								<div className="flex justify-end gap-2 mt-3">
									<button
										type="button"
										className="py-2 px-4 bg-transparent border-none text-white/60 text-sm cursor-pointer transition-all duration-200 ease-in-out disabled:opacity-30 hover:not-disabled:text-white/80"
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
										className="py-2 px-5 bg-[#ec1d24] border-none rounded-full text-white text-sm font-[BentonSansBold] cursor-pointer transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[#d01c22]"
										disabled={
											!replyContent.trim() ||
											isSubmitting ||
											(replyIsSpoiler && !replySpoilerFor.trim())
										}
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
				<div className="mt-1">
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
							disabled={disabled}
							hideDeletedWithoutReplies={hideDeletedWithoutReplies}
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
});

RedditComment.displayName = "RedditComment";

export default RedditComment;
