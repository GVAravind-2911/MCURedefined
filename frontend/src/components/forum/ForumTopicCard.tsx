"use client";

import { useState, memo, useCallback } from "react";
import Image from "next/image";
import { formatRelativeTime } from "@/lib/dateUtils";
import SpoilerRevealModal from "./SpoilerRevealModal";
import {
	Calendar,
	User,
	ArrowRight,
	MessageCircle,
	Heart,
	Pin,
	Lock,
	AlertTriangle,
} from "lucide-react";

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
		imageUrl?: string | null;
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

	const handleCardClick = useCallback(
		(e: React.MouseEvent) => {
			// Don't navigate if clicking on interactive elements
			if (
				(e.target as HTMLElement).closest(".topic-like-button") ||
				(e.target as HTMLElement).closest("button")
			) {
				return;
			}

			// If spoiler warning should be shown, open the modal instead of navigating
			if (shouldShowSpoilerWarning()) {
				e.stopPropagation();
				setShowSpoilerModal(true);
				return;
			}

			onTopicClick(topic.id);
		},
		[topic.id, onTopicClick],
	);

	const handleSpoilerReveal = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowSpoilerModal(true);
	};

	const handleSpoilerConfirm = () => {
		setSpoilerRevealed(true);
		// Navigate to the topic after confirming
		onTopicClick(topic.id);
	};

	const handleLikeClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isAuthenticated) {
			onLikeToggle(topic.id);
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

	const isSpoilerExpired = () => {
		if (!topic.isSpoiler || !topic.spoilerExpiresAt) return true;
		return new Date(topic.spoilerExpiresAt) <= new Date();
	};

	const shouldShowSpoilerWarning = () => {
		return topic.isSpoiler && !isSpoilerExpired() && !spoilerRevealed;
	};

	return (
		<>
			<div
				className={`group flex flex-col sm:flex-row w-full bg-white/2 backdrop-blur-sm rounded-xl sm:rounded-2xl transition-all duration-300 overflow-hidden border cursor-pointer ${
					topic.pinned
						? "border-[#fbbf24]/40 bg-linear-to-r from-[#fbbf24]/5 to-transparent hover:border-[#fbbf24]/60"
						: "border-white/8 hover:border-[#ec1d24]/30"
				} hover:bg-white/4 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(236,29,36,0.1)] active:scale-[0.995] ${
					topic.locked ? "opacity-75" : ""
				}`}
				onClick={handleCardClick}
			>
				{/* Thumbnail Section - Only show if topic has an image */}
				{topic.imageUrl && !shouldShowSpoilerWarning() && (
					<div className="relative w-full sm:w-48 md:w-56 lg:w-64 h-40 sm:h-auto sm:min-h-[180px] shrink-0 overflow-hidden bg-black/30">
						<Image
							src={topic.imageUrl}
							fill
							sizes="(max-width: 640px) 100vw, 256px"
							alt={topic.title}
							className="object-cover transition-transform duration-500 group-hover:scale-105"
						/>
						{/* Gradient Overlay */}
						<div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent sm:bg-linear-to-r sm:from-transparent sm:via-transparent sm:to-black/40" />

						{/* Mobile Date Badge */}
						<div className="absolute bottom-3 left-3 sm:hidden flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full border border-white/10">
							<Calendar className="w-3 h-3 text-[#ec1d24]" />
							<span className="text-xs text-white/90 font-[BentonSansRegular]">
								{formatRelativeTime(topic.createdAt)}
							</span>
						</div>

						{/* Decorative corner accent */}
						<div className="absolute top-0 left-0 w-16 h-16 bg-linear-to-br from-[#ec1d24]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
					</div>
				)}

				{/* Content Section */}
				<div className="flex-1 p-4 sm:p-5 md:p-6 flex flex-col min-w-0">
					{/* Status Badges */}
					<div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
						{topic.pinned && (
							<span className="inline-flex items-center gap-1 bg-[#fbbf24]/10 text-[#fbbf24] text-[10px] sm:text-xs py-1 px-2.5 sm:px-3 rounded-full border border-[#fbbf24]/20 font-[BentonSansBold]">
								<Pin className="w-3 h-3" />
								Pinned
							</span>
						)}
						{topic.locked && (
							<span className="inline-flex items-center gap-1 bg-white/10 text-white/70 text-[10px] sm:text-xs py-1 px-2.5 sm:px-3 rounded-full border border-white/20 font-[BentonSansBold]">
								<Lock className="w-3 h-3" />
								Locked
							</span>
						)}
						{shouldShowSpoilerWarning() && (
							<span className="inline-flex items-center gap-1 bg-[#ffa500]/10 text-[#ffa500] text-[10px] sm:text-xs py-1 px-2.5 sm:px-3 rounded-full border border-[#ffa500]/20 font-[BentonSansBold]">
								<AlertTriangle className="w-3 h-3" />
								Spoiler for {topic.spoilerFor}
							</span>
						)}
					</div>

					{/* Title */}
					<h2 className="font-[BentonSansBold] text-lg sm:text-xl md:text-2xl text-white leading-snug line-clamp-2 mb-2 sm:mb-3 group-hover:text-[#ec1d24] transition-colors duration-300">
						{topic.title}
					</h2>

					{/* Content Preview */}
					{shouldShowSpoilerWarning() ? (
						<div
							className="flex-1 bg-[#ffa500]/5 border border-[#ffa500]/20 rounded-xl p-4 text-center cursor-pointer transition-all duration-300 hover:bg-[#ffa500]/10 hover:border-[#ffa500]/30 mb-4"
							onClick={handleSpoilerReveal}
						>
							<div className="flex items-center justify-center gap-2 text-[#ffa500]">
								<AlertTriangle className="w-5 h-5" />
								<span className="font-[BentonSansBold] text-sm">
									Click to reveal spoiler content
								</span>
							</div>
						</div>
					) : (
						<p className="text-sm sm:text-[15px] leading-relaxed text-white/50 mb-4 font-[BentonSansRegular] line-clamp-2 sm:line-clamp-3 flex-1">
							{topic.content}
						</p>
					)}

					{/* Meta Info */}
					<div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-4 border-t border-white/8">
						{/* Author */}
						<div className="flex items-center gap-2 text-white/60">
							{topic.userImage ? (
								<Image
									src={topic.userImage}
									alt={topic.username}
									width={24}
									height={24}
									className="w-6 h-6 rounded-full object-cover border border-[#ec1d24]/30"
								/>
							) : (
								<div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#ec1d24]/10">
									<User className="w-3 h-3 text-[#ec1d24]" />
								</div>
							)}
							<span className="text-xs sm:text-sm font-[BentonSansRegular]">
								{topic.username}
							</span>
						</div>

						<span className="hidden sm:block w-px h-4 bg-white/15" />

						{/* Date */}
						<div className="hidden sm:flex items-center gap-1.5 text-white/50">
							<Calendar className="w-3.5 h-3.5" />
							<span className="text-xs sm:text-sm font-[BentonSansRegular]">
								{formatRelativeTime(topic.createdAt)}
							</span>
						</div>

						<span className="hidden sm:block w-px h-4 bg-white/15" />

						{/* Comments */}
						<div className="flex items-center gap-1.5 text-white/50">
							<MessageCircle className="w-3.5 h-3.5" />
							<span className="text-xs sm:text-sm font-[BentonSansRegular]">
								{topic.commentCount}
							</span>
						</div>

						<span className="hidden sm:block w-px h-4 bg-white/15" />

						{/* Likes Button */}
						<button
							className={`topic-like-button flex items-center gap-1.5 py-1 px-2 rounded-lg transition-all duration-300 ${
								topic.userHasLiked
									? "text-[#ec1d24] bg-[#ec1d24]/10"
									: "text-white/50 hover:text-[#ec1d24] hover:bg-[#ec1d24]/5"
							} ${!isAuthenticated ? "cursor-default" : "cursor-pointer"}`}
							onClick={handleLikeClick}
							disabled={!isAuthenticated}
							title={isAuthenticated ? "Like this topic" : "Sign in to like"}
							type="button"
						>
							<Heart
								className={`w-3.5 h-3.5 ${topic.userHasLiked ? "fill-current" : ""}`}
							/>
							<span className="text-xs sm:text-sm font-[BentonSansRegular]">
								{topic.likeCount}
							</span>
						</button>

						{/* Read More Arrow (appears on hover) */}
						<div className="ml-auto flex items-center gap-1.5 text-[#ec1d24] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
							<span className="text-xs sm:text-sm font-[BentonSansBold]">
								View Topic
							</span>
							<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
						</div>
					</div>
				</div>
			</div>

			<SpoilerRevealModal
				isOpen={showSpoilerModal}
				onClose={() => setShowSpoilerModal(false)}
				onConfirm={handleSpoilerConfirm}
				spoilerFor={topic.spoilerFor || "Unknown Content"}
			/>
		</>
	);
};

export default memo(ForumTopicCard);
