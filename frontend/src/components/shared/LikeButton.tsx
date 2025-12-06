"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { formatNumber } from "@/lib/utils/formatNumber";

type ContentType = "blog" | "blogs" | "review" | "reviews" | "project";

interface LikeButtonProps {
	contentId: number;
	contentType: ContentType;
	initialCount: number;
	userHasLiked: boolean;
	isLoggedIn: boolean;
	size?: "sm" | "md" | "lg";
}

const getApiConfig = (contentType: ContentType) => {
	switch (contentType) {
		case "blog":
		case "blogs":
			return { path: "/api/blog", idKey: "blogId" };
		case "review":
		case "reviews":
			return { path: "/api/review", idKey: "reviewId" };
		case "project":
			return { path: "/api/project", idKey: "projectId" };
	}
};

const sizeClasses = {
	sm: { button: "w-9 h-9", icon: 16, count: "text-xs" },
	md: { button: "w-11 h-11", icon: 20, count: "text-sm" },
	lg: { button: "w-14 h-14", icon: 24, count: "text-base" },
};

export default function LikeButton({
	contentId,
	contentType,
	initialCount,
	userHasLiked,
	isLoggedIn,
	size = "md",
}: LikeButtonProps) {
	const [liked, setLiked] = useState(userHasLiked);
	const [count, setCount] = useState(initialCount);
	const [isPending, setIsPending] = useState(false);
	const [showPulse, setShowPulse] = useState(false);

	const { path: apiPath, idKey } = getApiConfig(contentType);
	const {
		button: buttonSize,
		icon: iconSize,
		count: countSize,
	} = sizeClasses[size];

	const handleLike = async () => {
		if (isPending || !isLoggedIn) return;

		const wasLiked = liked;
		const action = wasLiked ? "unlike" : "like";

		// Optimistic update
		setLiked(!wasLiked);
		setCount((prev) => (wasLiked ? prev - 1 : prev + 1));
		setShowPulse(true);
		setIsPending(true);

		try {
			await axios.post(`${apiPath}/${action}`, { [idKey]: contentId });
		} catch (err) {
			// Revert on error
			console.error(`Failed to ${action} ${contentType}:`, err);
			setLiked(wasLiked);
			setCount((prev) => (wasLiked ? prev + 1 : prev - 1));
		} finally {
			setIsPending(false);
		}
	};

	useEffect(() => {
		if (showPulse) {
			const timer = setTimeout(() => setShowPulse(false), 600);
			return () => clearTimeout(timer);
		}
	}, [showPulse]);

	return (
		<div className="flex items-center gap-2">
			<motion.button
				type="button"
				onClick={handleLike}
				disabled={isPending}
				className={`
					${buttonSize}
					flex items-center justify-center
					rounded-full
					transition-all duration-200
					${isLoggedIn ? "cursor-pointer" : "cursor-not-allowed opacity-60"}
					${
						liked
							? "bg-[#ec1d24]/15 text-[#ec1d24] hover:bg-[#ec1d24]/25"
							: "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
					}
				`}
				whileTap={isLoggedIn ? { scale: 0.9 } : undefined}
				whileHover={isLoggedIn ? { scale: 1.05 } : undefined}
				title={isLoggedIn ? (liked ? "Unlike" : "Like") : "Sign in to like"}
			>
				<motion.svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill={liked ? "currentColor" : "none"}
					stroke="currentColor"
					strokeWidth={liked ? "0" : "2"}
					width={iconSize}
					height={iconSize}
					animate={showPulse && liked ? { scale: [1, 1.3, 1] } : {}}
					transition={{ duration: 0.3, ease: "easeOut" }}
				>
					<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
				</motion.svg>
			</motion.button>

			<motion.span
				className={`${countSize} font-[BentonSansRegular] ${liked ? "text-[#ec1d24]" : "text-white/70"}`}
				animate={showPulse ? { scale: [1, 1.15, 1] } : {}}
				transition={{ duration: 0.3 }}
			>
				{formatNumber(count)}
			</motion.span>
		</div>
	);
}
