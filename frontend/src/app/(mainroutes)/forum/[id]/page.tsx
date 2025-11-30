"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import RedditCommentSection from "@/components/forum/RedditCommentSection";
import LoadingSpinner from "@/components/main/LoadingSpinner";
import "@/styles/forum-thread.css";

interface ForumTopic {
	id: string;
	title: string;
	content: string;
	userId: string;
	username: string;
	userImage: string | null;
	createdAt: string;
	updatedAt: string;
	deleted: boolean;
	pinned: boolean;
	locked: boolean;
	likeCount: number;
	userHasLiked: boolean;
}

export default function ForumTopicPage(): React.ReactElement {
	const router = useRouter();
	const params = useParams();
	const topicId = params.id as string;
	const { data: session } = authClient.useSession();

	const [topic, setTopic] = useState<ForumTopic | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		if (topicId) {
			fetchTopic();
		}
	}, [topicId]);

	const fetchTopic = async () => {
		try {
			setLoading(true);
			setError("");

			const response = await fetch(`/api/forum/topics/${topicId}`);
			
			if (!response.ok) {
				if (response.status === 404) {
					setError("Topic not found");
				} else {
					throw new Error("Failed to fetch topic");
				}
				return;
			}

			const data: ForumTopic = await response.json();
			setTopic(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	const handleLikeToggle = async () => {
		if (!session?.user || !topic) return;

		try {
			const response = await fetch("/api/forum/topics/like", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ topicId: topic.id }),
			});

			if (response.ok) {
				const result = await response.json();
				setTopic((prevTopic) =>
					prevTopic
						? {
								...prevTopic,
								userHasLiked: result.liked,
								likeCount: prevTopic.likeCount + (result.liked ? 1 : -1),
						  }
						: null
				);
			}
		} catch (err) {
			console.error("Error toggling like:", err);
		}
	};

	const handleDeleteTopic = async () => {
		if (!session?.user || !topic || isDeleting) return;
		
		const confirmDelete = window.confirm(
			"Are you sure you want to delete this topic? This action cannot be undone."
		);
		
		if (!confirmDelete) return;

		try {
			setIsDeleting(true);
			
			const response = await fetch(`/api/forum/topics/${topic.id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (response.ok) {
				// Refresh the topic to show deleted state
				await fetchTopic();
			} else {
				const errorData = await response.json();
				alert(errorData.error || "Failed to delete topic");
			}
		} catch (err) {
			console.error("Error deleting topic:", err);
			alert("Failed to delete topic. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	};

	const formatDate = (dateString: string) => {
		try {
			return formatDistanceToNow(new Date(dateString), { addSuffix: true });
		} catch {
			return "Recently";
		}
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

	const isTopicDeleted = (topic: ForumTopic) => {
		return topic.deleted || topic.title === "[DELETED]" || topic.content.includes("[This topic has been deleted");
	};

	if (loading) {
		return (
			<div className="forum-thread-page forum-page">
				<div className="forum-thread-container">
					<div className="forum-loading">
						<LoadingSpinner />
						<p style={{ marginTop: "1rem", color: "rgba(255, 255, 255, 0.7)" }}>
							Loading topic...
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (error || !topic) {
		return (
			<div className="forum-thread-page forum-page">
				<div className="forum-thread-container">
					<button
						className="back-to-forum"
						onClick={() => router.push("/forum")}
					>
						← Back to Forum
					</button>
					<div className="forum-empty">
						<h3>
							{error || "Topic not found"}
						</h3>
						<p>
							{error === "Topic not found" 
								? "This topic may have been deleted or moved."
								: "Something went wrong while loading the topic."
							}
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="forum-thread-page forum-page">
			<div className="forum-thread-container">
				{/* Back to forum button */}
				<button
					className="back-to-forum"
					onClick={() => router.push("/forum")}
				>
					← Back to Forum
				</button>

				{/* Topic post - Reddit style */}
				<div className={`topic-post ${isTopicDeleted(topic) ? 'topic-deleted' : ''}`}>
					<div className="topic-post-content">
						{isTopicDeleted(topic) ? (
							// Deleted topic view
							<>
								<div className="topic-post-header">
									<div className="user-info">
										<div className="user-avatar" style={{ backgroundColor: "#666" }}>
											❌
										</div>
										<span className="username" style={{ color: "#666" }}>[deleted]</span>
									</div>
									<span>•</span>
									<span>{formatDate(topic.createdAt)}</span>
									<div className="topic-status">
										<span className="status-badge" style={{ backgroundColor: "rgba(220, 53, 69, 0.2)", color: "#dc3545" }}>
											🗑️ Deleted
										</span>
									</div>
								</div>
								<h1 className="topic-post-title" style={{ color: "#666" }}>
									[Deleted Topic]
								</h1>
								<div className="topic-post-body" style={{ 
									color: "#666", 
									fontStyle: "italic",
									backgroundColor: "rgba(255, 255, 255, 0.02)",
									padding: "1rem",
									borderRadius: "8px",
									border: "1px solid rgba(255, 255, 255, 0.1)"
								}}>
									This topic has been deleted and is no longer available.
								</div>
							</>
						) : (
							// Normal topic view
							<>
								{/* Topic header with user info and timestamps */}
								<div className="topic-post-header">
									<div className="user-info">
										{topic.userImage ? (
											<Image
												src={topic.userImage}
												alt={topic.username}
												width={24}
												height={24}
												className="user-avatar"
												style={{ borderRadius: "50%" }}
											/>
										) : (
											<div className="user-avatar">
												{getUserInitials(topic.username)}
											</div>
										)}
										<span className="username">{topic.username}</span>
									</div>
									<span>{formatDate(topic.createdAt)}</span>
									{topic.updatedAt !== topic.createdAt && (
										<>
											<span>•</span>
											<span>edited {formatDate(topic.updatedAt)}</span>
										</>
									)}
									{/* Status badges */}
									<div className="topic-status">
										{topic.pinned && (
											<span className="status-badge pinned">📌 Pinned</span>
										)}
										{topic.locked && (
											<span className="status-badge locked">🔒 Locked</span>
										)}
									</div>
								</div>

								{/* Topic title */}
								<h1 className="topic-post-title">
									{topic.title}
								</h1>

								{/* Topic content */}
								<div className="topic-post-body">
									{topic.content}
								</div>

								{/* Topic footer with voting and actions */}
								<div className="topic-post-footer">
									<div className="topic-vote-section">
										<button
											className={`topic-like-btn ${topic.userHasLiked ? "liked" : ""}`}
											onClick={handleLikeToggle}
											disabled={!session?.user || isTopicDeleted(topic)}
											title={
												isTopicDeleted(topic) 
													? "Cannot like deleted topics"
													: session?.user 
													? "Like this topic" 
													: "Sign in to like"
											}
										>
											<span>{topic.userHasLiked ? "❤️" : "🤍"}</span>
											<span>{topic.likeCount}</span>
										</button>
									</div>
									
									{/* Topic actions for author */}
									{session?.user?.id === topic.userId && !isTopicDeleted(topic) && (
										<div className="topic-actions">
											<button
												className="topic-delete-btn"
												onClick={handleDeleteTopic}
												disabled={isDeleting}
												title="Delete this topic"
											>
												{isDeleting ? "🔄" : "🗑️"} {isDeleting ? "Deleting..." : "Delete"}
											</button>
										</div>
									)}
								</div>
							</>
						)}
					</div>
				</div>

				{/* Comments section */}
				<div className="thread-comments">
					{isTopicDeleted(topic) ? (
						<div className="topic-locked">
							<h3>💬 Comments unavailable</h3>
							<p>Comments are not available for deleted topics.</p>
						</div>
					) : !topic.locked ? (
						<RedditCommentSection 
							contentId={topicId} 
							contentType="forum" 
						/>
					) : (
						<div className="topic-locked">
							<h3>🔒 This topic is locked</h3>
							<p>Comments have been disabled for this topic.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
