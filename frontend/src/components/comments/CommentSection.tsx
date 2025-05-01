"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth/auth-client";
import axios from "axios";
import CommentForm from "./CommentForm";
import Comment from "./Comment";
import "@/styles/comments.css";

interface CommentSectionProps {
	contentId: number;
	contentType: "blog" | "review";
}

interface CommentData {
	id: string;
	content: string;
	userId: string;
	username: string;
	userImage: string | null;
	parentId: string | null;
	likes: number;
	userHasLiked: boolean;
	createdAt: string;
	updatedAt: string | null;
	deleted: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({
	contentId,
	contentType,
}) => {
	const session = authClient.useSession().data;
	const [comments, setComments] = useState<CommentData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Determine API paths based on content type
	const apiPath =
		contentType === "blog" ? "/api/blog/comments" : "/api/review/comments";

	// Function to get the parameter name based on content type
	const getParamName = () => (contentType === "blog" ? "blogId" : "reviewId");

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		fetchComments();
	}, [contentId, contentType]);

	const fetchComments = async () => {
		try {
			setLoading(true);
			const paramName = getParamName();
			const response = await axios.get(`${apiPath}?${paramName}=${contentId}`);
			setComments(response.data);
			setLoading(false);
		} catch (err) {
			console.error("Error fetching comments:", err);
			setError("Failed to load comments. Please try again later.");
			setLoading(false);
		}
	};

	const handleAddComment = (newComment: CommentData) => {
		setComments((prevComments) => [newComment, ...prevComments]);
	};

	// Group comments into threads
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
		<div className="comments-section">
			<h2 className="section-title">
				<span className="title-text">Comments</span>
				<div className="title-line" />
			</h2>

			{session?.user ? (
				<CommentForm
					contentId={contentId}
					contentType={contentType}
					apiPath={apiPath}
					onCommentAdded={handleAddComment}
				/>
			) : (
				<div className="login-to-comment">
					<p>
						Please <a href="/auth">sign in</a> to join the conversation
					</p>
				</div>
			)}

			{loading ? (
				<div className="comments-loading">Loading comments...</div>
			) : error ? (
				<div className="comments-error">{error}</div>
			) : rootComments.length === 0 ? (
				<div className="no-comments">
					<p>Be the first to share your thoughts!</p>
				</div>
			) : (
				<div className="comments-list">
					{rootComments.map((comment) => (
						<Comment
							key={comment.id}
							comment={comment}
							replies={commentsByParentId[comment.id] || []}
							allReplies={commentsByParentId}
							currentUser={session?.user}
							onCommentAdded={handleAddComment}
							contentId={contentId}
							contentType={contentType}
							apiPath={apiPath}
							refreshComments={fetchComments}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default CommentSection;
