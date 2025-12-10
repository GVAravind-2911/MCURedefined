"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { authClient } from "@/lib/auth/auth-client";
import LoadingSpinner from "@/components/main/LoadingSpinner";
import TopicPost, { isTopicDeleted } from "@/components/forum/TopicPost";
import TopicComments from "@/components/forum/TopicComments";
import { ArrowLeft, MessageSquare, AlertTriangle } from "lucide-react";

const EditHistoryModal = dynamic(
	() => import("@/components/forum/EditHistoryModal"),
	{ ssr: false },
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
						: null,
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
				setTopic((prev) => (prev ? { ...prev, ...updatedTopic } : null));
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
			"Are you sure you want to delete this topic? This action cannot be undone.",
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
		return (
			<div className="flex flex-col w-full min-h-screen">
				<div className="flex-1 flex items-center justify-center">
					<LoadingSpinner />
				</div>
			</div>
		);
	}

	if (error || !topic) {
		return (
			<div className="flex flex-col w-full min-h-screen">
				<div className="flex-1 w-full max-w-[1000px] mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
					<BackToForumButton onClick={() => router.push("/forum")} />
					<div className="flex justify-center items-center min-h-[300px] sm:min-h-[400px]">
						<div className="text-center max-w-md px-6 py-10 bg-white/2 backdrop-blur-sm border border-white/8 rounded-2xl">
							{/* Icon */}
							<div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6">
								<div className="absolute inset-0 bg-[#ec1d24]/10 blur-xl rounded-full" />
								<div className="relative w-full h-full rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
									<AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-white/25" />
								</div>
							</div>
							<h3 className="font-[BentonSansBold] text-xl sm:text-2xl mb-3 text-white">
								{error || "Topic not found"}
							</h3>
							<p className="font-[BentonSansRegular] mb-8 text-white/50 text-sm sm:text-base leading-relaxed">
								{error === "Topic not found"
									? "This topic may have been deleted or moved."
									: "Something went wrong while loading the topic."}
							</p>
							<button
								onClick={() => router.push("/forum")}
								className="inline-flex items-center gap-2.5 bg-linear-to-br from-[#ec1d24] to-[#c91820] text-white py-3 px-6 rounded-xl cursor-pointer font-[BentonSansBold] text-sm sm:text-base transition-all duration-300 hover:shadow-lg hover:shadow-[#ec1d24]/25 hover:-translate-y-0.5 active:translate-y-0"
								type="button"
							>
								<MessageSquare className="w-4 h-4" />
								Return to Forum
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col w-full min-h-screen">
			<div className="flex-1 w-full max-w-[1000px] mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
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

function BackToForumButton({
	onClick,
}: { onClick: () => void }): React.ReactElement {
	return (
		<button
			className="inline-flex items-center gap-2 mb-6 py-2.5 px-4 bg-white/5 border border-white/15 rounded-xl text-white/70 text-sm transition-all duration-300 hover:bg-[#ec1d24]/10 hover:border-[#ec1d24]/30 hover:text-[#ec1d24] group"
			onClick={onClick}
			type="button"
		>
			<ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
			<span className="font-[BentonSansRegular]">Back to Forum</span>
		</button>
	);
}
