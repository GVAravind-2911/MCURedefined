"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { authClient } from "@/lib/auth/auth-client";
import LoadingSpinner from "@/components/main/LoadingSpinner";
import TopicPost, { isTopicDeleted } from "@/components/forum/TopicPost";
import TopicComments from "@/components/forum/TopicComments";

const EditHistoryModal = dynamic(
	() => import("@/components/forum/EditHistoryModal"),
	{ ssr: false }
);

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
	editCount?: number;
	canEdit?: boolean;
	imageUrl?: string | null;
	imageKey?: string | null;
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
	const [isEditing, setIsEditing] = useState(false);
	const [editTitle, setEditTitle] = useState("");
	const [editContent, setEditContent] = useState("");
	const [editError, setEditError] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [showEditHistory, setShowEditHistory] = useState(false);

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

	const handleEditClick = () => {
		if (!topic) return;
		setEditTitle(topic.title);
		setEditContent(topic.content);
		setEditError("");
		setIsEditing(true);
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
		setEditTitle("");
		setEditContent("");
		setEditError("");
	};

	const handleSaveEdit = async () => {
		if (!topic || isSaving) return;

		if (!editTitle.trim() || !editContent.trim()) {
			setEditError("Title and content are required");
			return;
		}

		try {
			setIsSaving(true);
			setEditError("");

			const response = await fetch(`/api/forum/topics/${topic.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: editTitle.trim(),
					content: editContent.trim(),
				}),
			});

			if (response.ok) {
				const updatedTopic = await response.json();
				setTopic((prev) => prev ? { ...prev, ...updatedTopic } : null);
				setIsEditing(false);
			} else {
				const errorData = await response.json();
				setEditError(errorData.error || "Failed to save changes");
			}
		} catch (err) {
			console.error("Error saving topic:", err);
			setEditError("Failed to save changes. Please try again.");
		} finally {
			setIsSaving(false);
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

	if (loading) {
		return <LoadingSpinner />;
	}

	if (error || !topic) {
		return (
			<div className="min-h-screen bg-[linear-gradient(135deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] text-white py-8">
				<div className="max-w-[1000px] mx-auto px-4">
					<BackToForumButton onClick={() => router.push("/forum")} />
					<div className="text-center py-16 px-8 bg-[rgba(40,40,40,0.3)] border border-white/10 rounded-lg backdrop-blur-[10px]">
						<h3 className="text-[#ec1d24] mb-4 font-[BentonSansBold] text-2xl">
							{error || "Topic not found"}
						</h3>
						<p className="text-white/70 mb-8 text-lg leading-relaxed">
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
		<div className="min-h-screen bg-[linear-gradient(135deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] text-white py-8">
			<div className="max-w-[1000px] mx-auto px-4">
				<BackToForumButton onClick={() => router.push("/forum")} />

				<TopicPost
					topic={topic}
					currentUserId={session?.user?.id}
					isEditing={isEditing}
					editTitle={editTitle}
					editContent={editContent}
					editError={editError}
					isSaving={isSaving}
					isDeleting={isDeleting}
					onEditTitleChange={setEditTitle}
					onEditContentChange={setEditContent}
					onSaveEdit={handleSaveEdit}
					onCancelEdit={handleCancelEdit}
					onEditClick={handleEditClick}
					onDeleteClick={handleDeleteTopic}
					onLikeToggle={handleLikeToggle}
					onShowEditHistory={() => setShowEditHistory(true)}
				/>

				{showEditHistory && (
					<EditHistoryModal
						contentId={topicId}
						contentType="topic"
						onClose={() => setShowEditHistory(false)}
					/>
				)}

				<TopicComments topic={topic} topicId={topicId} />
			</div>
		</div>
	);
}

function BackToForumButton({ onClick }: { onClick: () => void }): React.ReactElement {
	return (
		<button
			className="bg-[rgba(236,29,36,0.1)] border border-[rgba(236,29,36,0.3)] text-[#ec1d24] py-3 px-6 rounded-lg cursor-pointer transition-all duration-300 ease-in-out flex items-center gap-2 font-[BentonSansRegular] text-[0.95rem] font-medium mb-8 backdrop-blur-[5px] hover:bg-[rgba(236,29,36,0.2)] hover:border-[#ec1d24] hover:text-white hover:-translate-x-1"
			onClick={onClick}
		>
			← Back to Forum
		</button>
	);
}
