"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { authClient } from "@/lib/auth/auth-client";
import axios from "axios";
import RedditComment from "./RedditComment";

interface CommentData {
	id: string;
	content: string;
	userId: string;
	username: string;
	userImage: string | null;
	createdAt: string;
	updatedAt: string;
	parentId: string | null;
	likeCount: number;
	userHasLiked: boolean;
}

interface CommentsResponse {
	comments: CommentData[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		hasMore: boolean;
	};
}

interface RedditCommentSectionProps {
	contentId: number | string;
	contentType: "blog" | "review" | "forum";
	disabled?: boolean;
}

const RedditCommentSection = memo(function RedditCommentSection({
	contentId,
	contentType,
	disabled = false,
}: RedditCommentSectionProps) {
	const [comments, setComments] = useState<CommentData[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState("");
	const [newComment, setNewComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);
	const [isSpoiler, setIsSpoiler] = useState(false);
	const [spoilerFor, setSpoilerFor] = useState("");
	const [spoilerDuration, setSpoilerDuration] = useState(30); // 30 days default
	const [hideDeletedWithoutReplies, setHideDeletedWithoutReplies] =
		useState(false);
	const { data: session } = authClient.useSession();

	// Determine API paths based on content type
	const apiPath =
		contentType === "blog"
			? "/api/blog/comments"
			: contentType === "review"
				? "/api/review/comments"
				: "/api/forum/comments";

	// Function to get the parameter name based on content type
	const getParamName = () =>
		contentType === "blog"
			? "blogId"
			: contentType === "review"
				? "reviewId"
				: "topicId";

	useEffect(() => {
		fetchComments(1, false);
	}, [contentId, contentType]);

	const fetchComments = async (page = 1, append = false) => {
		try {
			if (append) {
				setLoadingMore(true);
			} else {
				setLoading(true);
				setComments([]);
				setCurrentPage(1);
			}
			setError("");

			const paramName = getParamName();

			// For forum comments, use pagination
			if (contentType === "forum") {
				const response = await axios.get(
					`${apiPath}?${paramName}=${contentId}&page=${page}&limit=20`,
				);

				const data: CommentsResponse = response.data;

				if (append) {
					setComments((prev) => [...prev, ...data.comments]);
				} else {
					setComments(data.comments);
				}

				setCurrentPage(page);
				setHasMore(data.pagination.hasMore);
			} else {
				// For blog and review comments, keep the old behavior
				const response = await axios.get(
					`${apiPath}?${paramName}=${contentId}`,
				);
				setComments(response.data);
				setHasMore(false);
			}
		} catch (err) {
			console.error("Error fetching comments:", err);
			setError("Failed to load comments");
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	};

	const loadMoreComments = () => {
		if (!loadingMore && hasMore) {
			fetchComments(currentPage + 1, true);
		}
	};

	const refreshComments = () => {
		fetchComments(1, false);
	};

	const handleAddComment = (newCommentData: CommentData) => {
		setComments((prevComments) => [newCommentData, ...prevComments]);
	};

	// Handle like toggle for optimistic updates - keeps parent state in sync
	const handleCommentLikeToggle = (commentId: string, liked: boolean) => {
		setComments((prevComments) =>
			prevComments.map((comment) => {
				if (comment.id !== commentId) return comment;

				// Calculate the change based on the previous state
				const wasLiked = comment.userHasLiked;
				let newCount = comment.likeCount || 0;

				// Only adjust count if the liked state actually changed
				if (liked && !wasLiked) {
					newCount += 1;
				} else if (!liked && wasLiked) {
					newCount = Math.max(0, newCount - 1);
				}

				return {
					...comment,
					userHasLiked: liked,
					likeCount: newCount,
				};
			}),
		);
	};

	const handleSubmitComment = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!newComment.trim() || isSubmitting || !session?.user) return;

		try {
			setIsSubmitting(true);

			const paramName = getParamName();
			const requestBody: Record<string, any> = {
				[paramName]: contentId,
				content: newComment.trim(),
				parentId: null,
			};

			// Add spoiler fields for forum comments
			if (contentType === "forum") {
				requestBody.isSpoiler = isSpoiler;
				requestBody.spoilerFor = isSpoiler ? spoilerFor : null;
				requestBody.spoilerDuration = isSpoiler ? spoilerDuration : null;
			}

			const response = await axios.post(apiPath, requestBody);
			handleAddComment(response.data);
			setNewComment("");
			setIsSpoiler(false);
			setSpoilerFor("");
			setSpoilerDuration(30);
		} catch (err) {
			console.error("Error posting comment:", err);
			alert("Failed to post comment. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Separate root comments from replies
	const rootComments = comments.filter((comment) => !comment.parentId);
	const commentsByParentId = comments.reduce(
		(acc, comment) => {
			if (comment.parentId) {
				if (!acc[comment.parentId]) {
					acc[comment.parentId] = [];
				}
				acc[comment.parentId].push(comment);
			}
			return acc;
		},
		{} as Record<string, CommentData[]>,
	);

	return (
		<div className="mt-8">
			{/* Comment form for new top-level comments */}
			{disabled ? (
				<div className="p-4 my-4 bg-white/5 rounded-lg">
					<p className="m-0 text-[0.9rem] text-white/60">
						💬 New comments are disabled for this topic
					</p>
				</div>
			) : session?.user ? (
				<form
					className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10"
					onSubmit={handleSubmitComment}
				>
					<textarea
						className="w-full min-h-[100px] p-3 bg-white/5 border border-white/20 rounded-lg text-white font-[BentonSansRegular] text-[0.95rem] resize-y transition-all duration-300 ease-in-out focus:outline-none focus:border-[#ec1d24] focus:bg-white/10"
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						placeholder="What are your thoughts?"
						disabled={isSubmitting}
						maxLength={2000}
					/>

					{/* Spoiler fields for forum comments */}
					{contentType === "forum" && (
						<div className="mt-3 p-3 bg-[rgba(255,165,0,0.05)] border border-[rgba(255,165,0,0.2)] rounded-lg">
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									checked={isSpoiler}
									onChange={(e) => setIsSpoiler(e.target.checked)}
									className="accent-[#ffa500] scale-[1.2] cursor-pointer"
								/>
								<span className="text-white/80 text-sm font-[BentonSansBook]">
									Mark as spoiler
								</span>
							</label>

							{isSpoiler && (
								<div className="mt-3 flex flex-col gap-3 pl-6 border-l-2 border-[rgba(255,165,0,0.3)]">
									<div className="flex flex-col gap-1.5">
										<label className="text-sm text-white/70">
											What is this a spoiler for?
											<input
												type="text"
												value={spoilerFor}
												onChange={(e) => setSpoilerFor(e.target.value)}
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
												value={spoilerDuration}
												onChange={(e) =>
													setSpoilerDuration(Number(e.target.value))
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
							className="py-2 px-4 bg-transparent border-none text-white/60 text-sm cursor-pointer transition-all duration-200 ease-in-out disabled:opacity-30 disabled:cursor-not-allowed hover:not-disabled:text-white/80"
							onClick={() => {
								setNewComment("");
								setIsSpoiler(false);
								setSpoilerFor("");
								setSpoilerDuration(30);
							}}
							disabled={!newComment.trim() || isSubmitting}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="py-2 px-5 bg-[#ec1d24] border-none rounded-full text-white text-sm font-[BentonSansBold] cursor-pointer transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[#d01c22]"
							disabled={
								!newComment.trim() ||
								isSubmitting ||
								(isSpoiler && !spoilerFor.trim())
							}
						>
							{isSubmitting ? "Posting..." : "Comment"}
						</button>
					</div>
				</form>
			) : (
				<div className="p-4 my-4 bg-white/5 rounded-lg">
					<p className="m-0 text-[0.9rem] text-white/70">
						Please{" "}
						<a href="/auth" className="text-[#ec1d24] hover:underline">
							sign in
						</a>{" "}
						to join the conversation
					</p>
				</div>
			)}

			{/* Filter options */}
			{contentType === "forum" && !loading && rootComments.length > 0 && (
				<div className="flex items-center gap-4 py-3 px-4 bg-white/3 rounded-lg mb-4 text-[0.85rem]">
					<label className="flex items-center gap-2 cursor-pointer text-white/70">
						<input
							type="checkbox"
							checked={hideDeletedWithoutReplies}
							onChange={(e) => setHideDeletedWithoutReplies(e.target.checked)}
							className="cursor-pointer"
						/>
						<span>Collapse deleted comments without replies</span>
					</label>
				</div>
			)}

			{/* Comments list */}
			{loading ? (
				<div className="py-8 text-center text-white/60">
					Loading comments...
				</div>
			) : error ? (
				<div className="py-8 text-center text-[#dc3545]">{error}</div>
			) : rootComments.length === 0 ? (
				<div className="py-8 text-center text-white/60">
					<p>No comments yet. Be the first to share your thoughts!</p>
				</div>
			) : (
				<>
					<div className="flex flex-col gap-0">
						{rootComments.map((comment) => (
							<RedditComment
								key={`${comment.id}-${hideDeletedWithoutReplies}`}
								comment={comment}
								replies={commentsByParentId[comment.id] || []}
								allReplies={commentsByParentId}
								currentUser={session?.user}
								onCommentAdded={handleAddComment}
								onCommentLikeToggle={handleCommentLikeToggle}
								contentId={contentId}
								contentType={contentType}
								apiPath={apiPath}
								refreshComments={refreshComments}
								disabled={disabled}
								hideDeletedWithoutReplies={hideDeletedWithoutReplies}
							/>
						))}
					</div>

					{/* Load More button for forum comments */}
					{contentType === "forum" && hasMore && (
						<div className="flex justify-center py-8 border-t border-white/10 mt-4">
							<button
								onClick={loadMoreComments}
								disabled={loadingMore}
								className={`bg-white/5 border border-white/20 text-white py-3 px-6 rounded-md cursor-pointer transition-all duration-200 ease-in-out text-[0.9rem] font-[BentonSansRegular] ${loadingMore ? "cursor-not-allowed opacity-60" : "hover:bg-white/10 hover:border-[#ec1d24]"}`}
							>
								{loadingMore
									? "Loading more comments..."
									: "Load More Comments"}
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
});

export default RedditCommentSection;
