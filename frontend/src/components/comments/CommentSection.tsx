"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth/auth-client";
import axios from "axios";
import CommentForm from "./CommentForm";
import Comment from "./Comment";

interface CommentSectionProps {
	contentId: number;
	contentType: "blog" | "review" | "forum";
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
		<div className="mt-8 pt-8 border-t border-white/10">
			<h2 className="font-['BentonSansBold'] relative flex items-center mb-8">
				<span className="text-white text-3xl mr-4">Comments</span>
				<div className="grow h-0.5 bg-[#ec1d24] opacity-80" />
			</h2>

			{session?.user ? (
				<CommentForm
					contentId={contentId}
					contentType={contentType}
					apiPath={apiPath}
					onCommentAdded={handleAddComment}
				/>
			) : (
				<div className="bg-[rgba(40,40,40,0.3)] p-6 text-center rounded-lg mb-8 text-white/80">
					<p>
						Please <a href="/auth" className="text-[#ec1d24] no-underline font-bold transition-all duration-300 hover:underline">sign in</a> to join the conversation
					</p>
				</div>
			)}

			{loading ? (
				<div className="text-center p-8 text-white/70 font-['BentonSansRegular']">Loading comments...</div>
			) : error ? (
				<div className="text-center p-8 text-red-400 font-['BentonSansRegular']">{error}</div>
			) : rootComments.length === 0 ? (
				<div className="text-center p-8 text-white/70 font-['BentonSansRegular']">
					<p>Be the first to share your thoughts!</p>
				</div>
			) : (
				<div className="flex flex-col gap-6">
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
