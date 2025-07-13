"use client";

import React, { useState } from "react";
import Image from "next/image";
import { formatRelativeTime } from "@/lib/dateUtils";
import SpoilerRevealModal from "./SpoilerRevealModal";

interface ForumTopicCardProps {
	topic: {
		id: string;
		title: string;
		content: string;
		userId: string;
		username: string;
		userImage: string | null;
		createdAt: string;
		likeCount: number;
		commentCount: number;
		pinned: boolean;
		locked: boolean;
		isSpoiler?: boolean;
		spoilerFor?: string;
		spoilerExpiresAt?: string;
		userHasLiked?: boolean;
	};
	onTopicClick: (topicId: string) => void;
	onLikeToggle: (topicId: string) => void;
	isAuthenticated: boolean;
}

const ForumTopicCard: React.FC<ForumTopicCardProps> = ({
	topic,
	onTopicClick,
	onLikeToggle,
	isAuthenticated,
}) => {
	const [spoilerRevealed, setSpoilerRevealed] = useState(false);
	const [showSpoilerModal, setShowSpoilerModal] = useState(false);

	const handleCardClick = (e: React.MouseEvent) => {
		// Don't navigate if clicking on interactive elements
		if (
			(e.target as HTMLElement).closest(".topic-like-button") ||
			(e.target as HTMLElement).closest("button") ||
			(e.target as HTMLElement).closest(".spoiler-warning")
		) {
			return;
		}
		onTopicClick(topic.id);
	};

	const handleSpoilerReveal = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowSpoilerModal(true);
	};

	const handleSpoilerConfirm = () => {
		setSpoilerRevealed(true);
	};

	const handleLikeClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isAuthenticated) {
			onLikeToggle(topic.id);
		}
	};

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

	const isSpoilerExpired = () => {
		if (!topic.isSpoiler || !topic.spoilerExpiresAt) return true;
		return new Date(topic.spoilerExpiresAt) <= new Date();
	};

	const shouldShowSpoilerWarning = () => {
		return topic.isSpoiler && !isSpoilerExpired() && !spoilerRevealed;
	};

	return (
		<div
			className={`topic-card ${topic.pinned ? "pinned" : ""} ${
				topic.locked ? "locked" : ""
			}`}
			onClick={handleCardClick}
		>
			<div className="topic-header">
				<h3
					className={`topic-title ${topic.pinned ? "pinned" : ""} ${
						topic.locked ? "locked" : ""
					} ${shouldShowSpoilerWarning() ? "spoiler" : ""}`}
				>
					{shouldShowSpoilerWarning() && "⚠️ "}{topic.title}
				</h3>
				<div className="topic-meta">
					<div className="topic-author">
						{topic.userImage ? (
							<Image
								src={topic.userImage}
								alt={topic.username}
								width={24}
								height={24}
								className="topic-author-avatar"
							/>
						) : (
							<div className="topic-author-avatar-placeholder">
								{getUserInitials(topic.username)}
							</div>
						)}
						<span>{topic.username}</span>
					</div>
					<div className="topic-date">{formatDate(topic.createdAt)}</div>
					{shouldShowSpoilerWarning() && (
						<div className="spoiler-badge">
							🔒 Spoiler for {topic.spoilerFor}
						</div>
					)}
				</div>
			</div>

			<div className="topic-content">
				{shouldShowSpoilerWarning() ? (
					<div className="spoiler-warning" onClick={handleSpoilerReveal}>
						<div className="spoiler-icon">⚠️</div>
						<div className="spoiler-text">
							<h4>Spoiler Warning</h4>
							<p>This topic contains spoilers for <strong>{topic.spoilerFor}</strong></p>
							<button className="spoiler-reveal-btn">
								Click to reveal spoiler content
							</button>
						</div>
					</div>
				) : (
					<div className={`topic-content ${spoilerRevealed ? 'spoiler-revealed' : ''}`}>
						{topic.content}
					</div>
				)}
			</div>

			<div className="topic-stats">
				<div className="topic-stats-left">
					<div className="topic-stat">
						<span>💬</span>
						<span>{topic.commentCount} comments</span>
					</div>
				</div>

				<button
					className={`topic-like-button ${
						topic.userHasLiked ? "liked" : ""
					}`}
					onClick={handleLikeClick}
					disabled={!isAuthenticated}
					title={isAuthenticated ? "Like this topic" : "Sign in to like"}
				>
					<span>{topic.userHasLiked ? "❤️" : "🤍"}</span>
					<span>{topic.likeCount}</span>
				</button>
			</div>

			<SpoilerRevealModal
				isOpen={showSpoilerModal}
				onClose={() => setShowSpoilerModal(false)}
				onConfirm={handleSpoilerConfirm}
				spoilerFor={topic.spoilerFor || "Unknown Content"}
			/>
		</div>
	);
};

export default ForumTopicCard;
