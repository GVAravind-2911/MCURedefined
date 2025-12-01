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
}

const RedditCommentSection = memo(function RedditCommentSection({
	contentId,
	contentType,
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
					setComments(prev => [...prev, ...data.comments]);
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
			}
			)
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
		<div className="reddit-comments-section">
			{/* Comment form for new top-level comments */}
			{session?.user ? (
				<form className="comment-form-reddit" onSubmit={handleSubmitComment}>
					<textarea
						className="comment-textarea-reddit"
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						placeholder="What are your thoughts?"
						disabled={isSubmitting}
						maxLength={2000}
					/>
					
					{/* Spoiler fields for forum comments */}
					{contentType === "forum" && (
						<div className="spoiler-form-section">
							<label className="spoiler-checkbox-label">
								<input
									type="checkbox"
									checked={isSpoiler}
									onChange={(e) => setIsSpoiler(e.target.checked)}
									className="spoiler-checkbox"
								/>
								<span className="spoiler-checkbox-text">Mark as spoiler</span>
							</label>
							
							{isSpoiler && (
								<div className="spoiler-details">
									<div className="spoiler-field">
										<label className="spoiler-label">
											What is this a spoiler for?
											<input
												type="text"
												value={spoilerFor}
												onChange={(e) => setSpoilerFor(e.target.value)}
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
												value={spoilerDuration}
												onChange={(e) => setSpoilerDuration(Number(e.target.value))}
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
							className="comment-submit-reddit"
							disabled={!newComment.trim() || isSubmitting || (isSpoiler && !spoilerFor.trim())}
						>
							{isSubmitting ? "Posting..." : "Comment"}
						</button>
					</div>
				</form>
			) : (
				<div className="topic-locked" style={{ padding: "1rem", margin: "1rem 0" }}>
					<p style={{ margin: 0, fontSize: "0.9rem" }}>
						Please <a href="/auth" style={{ color: "#ec1d24" }}>sign in</a> to join the conversation
					</p>
				</div>
			)}

			{/* Comments list */}
			{loading ? (
				<div style={{ padding: "2rem", textAlign: "center", color: "rgba(255, 255, 255, 0.6)" }}>
					Loading comments...
				</div>
			) : error ? (
				<div style={{ padding: "2rem", textAlign: "center", color: "#dc3545" }}>
					{error}
				</div>
			) : rootComments.length === 0 ? (
				<div style={{ padding: "2rem", textAlign: "center", color: "rgba(255, 255, 255, 0.6)" }}>
					<p>No comments yet. Be the first to share your thoughts!</p>
				</div>
			) : (
				<>
					<div className="comments-list">
						{rootComments.map((comment) => (
							<RedditComment
								key={comment.id}
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
							/>
						))}
					</div>
					
					{/* Load More button for forum comments */}
					{contentType === "forum" && hasMore && (
						<div style={{ 
							display: "flex", 
							justifyContent: "center", 
							padding: "2rem 0",
							borderTop: "1px solid rgba(255, 255, 255, 0.1)",
							marginTop: "1rem"
						}}>
							<button
								onClick={loadMoreComments}
								disabled={loadingMore}
								className={`load-more-comments-btn${loadingMore ? " loading" : ""}`}
							>
								{loadingMore ? "Loading more comments..." : "Load More Comments"}
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
});

export default RedditCommentSection;

/* Add this CSS to your global stylesheet or a CSS module:
.load-more-comments-btn {
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.2);
	color: white;
	padding: 0.75rem 1.5rem;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s ease;
	font-size: 0.9rem;
	font-family: BentonSansRegular, sans-serif;
}
.load-more-comments-btn.loading {
	cursor: not-allowed;
}
.load-more-comments-btn:not(.loading):hover {
	background: rgba(255, 255, 255, 0.1);
	border-color: #ec1d24;
}
*/
