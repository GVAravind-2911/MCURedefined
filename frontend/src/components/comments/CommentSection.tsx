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
		<div className="mt-12 sm:mt-16 md:mt-20 pt-8 sm:pt-10 md:pt-12 border-t border-white/10">
			<div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-10">
				<div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#ec1d24]/10 border border-[#ec1d24]/20">
					<svg
						className="w-5 h-5 sm:w-6 sm:h-6 text-[#ec1d24]"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
						/>
					</svg>
				</div>
				<div>
					<h2 className="font-[BentonSansBold] text-xl sm:text-2xl text-white">
						Comments
					</h2>
					<p className="text-sm text-white/40 font-[BentonSansRegular]">
						Join the discussion
					</p>
				</div>
			</div>

			{session?.user ? (
				<CommentForm
					contentId={contentId}
					contentType={contentType}
					apiPath={apiPath}
					onCommentAdded={handleAddComment}
				/>
			) : (
				<div className="bg-white/3 backdrop-blur-sm p-5 sm:p-6 text-center rounded-xl mb-8 border border-white/5">
					<p className="text-white/70 text-sm sm:text-base font-[BentonSansRegular]">
						Please{" "}
						<a
							href="/auth"
							className="text-[#ec1d24] no-underline font-[BentonSansBold] transition-all duration-200 hover:text-[#ff3d44] hover:underline underline-offset-2"
						>
							sign in
						</a>{" "}
						to join the conversation
					</p>
				</div>
			)}

			{loading ? (
				<div className="flex items-center justify-center gap-3 p-8 text-white/50">
					<div className="w-5 h-5 border-2 border-white/20 border-t-[#ec1d24] rounded-full animate-spin" />
					<span className="font-[BentonSansRegular] text-sm">
						Loading comments...
					</span>
				</div>
			) : error ? (
				<div className="text-center p-8 text-red-400/80 font-[BentonSansRegular] text-sm bg-red-500/5 rounded-xl border border-red-500/10">
					{error}
				</div>
			) : rootComments.length === 0 ? (
				<div className="text-center p-10 sm:p-12 bg-white/2 rounded-xl border border-white/5">
					<div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
						<svg
							className="w-7 h-7 text-white/30"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
							/>
						</svg>
					</div>
					<p className="text-white/50 font-[BentonSansRegular] text-sm sm:text-base">
						Be the first to share your thoughts!
					</p>
				</div>
			) : (
				<div className="flex flex-col gap-5 sm:gap-6">
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
