"use client";

import { useState, memo, useCallback } from "react";
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
	};

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
			className={`bg-[rgba(40,40,40,0.3)] border rounded-lg p-7 transition-all duration-300 ease-in-out cursor-pointer backdrop-blur-[10px] relative overflow-hidden group before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-[linear-gradient(90deg,transparent,#ec1d24,transparent)] before:opacity-0 before:transition-opacity before:duration-300 hover:bg-[rgba(50,50,50,0.5)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(236,29,36,0.15)] hover:before:opacity-100 ${
				topic.pinned 
					? 'border-[#fbbf24] bg-[linear-gradient(135deg,rgba(251,191,36,0.1)_0%,rgba(40,40,40,0.4)_100%)] before:bg-[linear-gradient(90deg,transparent,#fbbf24,transparent)] before:opacity-100' 
					: 'border-white/10 hover:border-[rgba(236,29,36,0.5)]'
			} ${topic.locked ? 'opacity-70 border-white/20' : ''}`}
			onClick={handleCardClick}
		>
			<div className="flex justify-between items-start mb-4 max-md:flex-col max-md:gap-4 max-md:items-stretch">
				<h3
					className={`font-[BentonSansBold] text-[1.4rem] text-white m-0 leading-tight transition-colors duration-300 group-hover:text-[#ec1d24] ${
						topic.pinned ? "before:content-['📌_']" : ''
					} ${topic.locked ? "after:content-['_🔒']" : ''} ${
						shouldShowSpoilerWarning() ? 'text-[#ffa500] opacity-90' : ''
					}`}
				>
					{shouldShowSpoilerWarning() && "⚠️ "}{topic.title}
				</h3>
				<div className="flex flex-col items-end gap-1 text-right max-md:items-start max-md:text-left">
					<div className="flex items-center gap-2 font-[BentonSansRegular] text-white/80 text-[0.9rem]">
						{topic.userImage ? (
							<Image
								src={topic.userImage}
								alt={topic.username}
								width={24}
								height={24}
								className="w-7 h-7 rounded-full object-cover border-2 border-[rgba(236,29,36,0.5)]"
							/>
						) : (
							<div className="w-7 h-7 rounded-full bg-[linear-gradient(135deg,#ec1d24,#ff7f50)] text-white flex items-center justify-center font-[BentonSansBold] text-[0.75rem]">
								{getUserInitials(topic.username)}
							</div>
						)}
						<span>{topic.username}</span>
					</div>
					<div className="font-[BentonSansRegular] text-white/50 text-[0.8rem]">{formatDate(topic.createdAt)}</div>
					{shouldShowSpoilerWarning() && (
						<div className="bg-[rgba(255,165,0,0.2)] text-[#ffa500] py-0.5 px-2 rounded font-[BentonSansBold] text-[0.75rem] border border-[rgba(255,165,0,0.3)] uppercase tracking-[0.5px]">
							🔒 Spoiler for {topic.spoilerFor}
						</div>
					)}
				</div>
			</div>

			<div className="text-white/80 font-[BentonSansRegular] leading-relaxed mb-4 line-clamp-3">
				{shouldShowSpoilerWarning() ? (
					<div 
						className="bg-[linear-gradient(135deg,rgba(255,165,0,0.12)_0%,rgba(255,107,53,0.12)_100%)] border-2 border-[rgba(255,165,0,0.3)] rounded-xl p-6 text-center cursor-pointer transition-all duration-400 backdrop-blur-sm relative overflow-hidden my-2 hover:bg-[linear-gradient(135deg,rgba(255,165,0,0.18)_0%,rgba(255,107,53,0.18)_100%)] hover:border-[rgba(255,165,0,0.5)] hover:scale-[1.02] hover:shadow-[0_8px_25px_rgba(255,165,0,0.2)]"
						onClick={handleSpoilerReveal}
					>
						<div className="text-5xl mb-4">⚠️</div>
						<div className="text-white/90">
							<h4 className="m-0 mb-2 font-[BentonSansBold] text-xl text-[#ffa500]">Spoiler Warning</h4>
							<p className="m-0 mb-6 text-base leading-normal">This topic contains spoilers for <strong>{topic.spoilerFor}</strong></p>
							<button className="bg-[linear-gradient(135deg,#ffa500,#ff6b35)] text-white border-none py-3 px-6 rounded-[10px] font-[BentonSansBold] text-base font-bold cursor-pointer transition-all duration-200 shadow-[0_4px_15px_rgba(255,165,0,0.3)] hover:bg-[linear-gradient(135deg,#ff8c00,#ff4757)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,165,0,0.4)]">
								Click to reveal spoiler content
							</button>
						</div>
					</div>
				) : (
					<div className={spoilerRevealed ? 'animate-[topicSpoilerReveal_0.8s_ease]' : ''}>
						{topic.content}
					</div>
				)}
			</div>

			<div className="flex justify-between items-center pt-4 border-t border-white/10 max-md:flex-col max-md:gap-4 max-md:items-stretch">
				<div className="flex items-center gap-5 max-md:justify-between">
					<div className="flex items-center gap-1.5 text-white/50 font-[BentonSansRegular] text-[0.9rem]">
						<span>💬</span>
						<span>{topic.commentCount} comments</span>
					</div>
				</div>

				<button
					className={`flex items-center gap-1.5 bg-none border-none text-white/50 font-[BentonSansRegular] text-[0.9rem] cursor-pointer py-1.5 px-3 rounded-[20px] transition-all duration-300 ease-in-out hover:text-[#ec1d24] hover:bg-[rgba(236,29,36,0.1)] ${
						topic.userHasLiked ? 'text-[#ec1d24]' : ''
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

export default memo(ForumTopicCard);
