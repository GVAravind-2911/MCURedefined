"use client";

import { useEffect, useRef, useState } from "react";
import LikeButton from "@/components/shared/LikeButton";
import ShareButton from "@/components/shared/ShareButton";

interface FloatingActionBarProps {
	contentId: number;
	contentType: "blog" | "review";
	initialLikes: number;
	userHasLiked: boolean;
	isLoggedIn: boolean;
}

export default function FloatingActionBar({
	contentId,
	contentType,
	initialLikes,
	userHasLiked,
	isLoggedIn,
}: FloatingActionBarProps) {
	const [isVisible, setIsVisible] = useState(true);
	const barRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleScroll = () => {
			// Find the tags section which marks the end of main content
			const tagsSection = document.querySelector("[data-tags-section]");
			if (!tagsSection || !barRef.current) return;

			const tagsSectionRect = tagsSection.getBoundingClientRect();

			// Hide when the tags section is about to enter the viewport
			// Show when we're above the tags section with some buffer
			if (tagsSectionRect.top < 150) {
				setIsVisible(false);
			} else {
				setIsVisible(true);
			}
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll(); // Check initial state

		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div
			ref={barRef}
			className={`sticky top-20 z-40 mb-8 flex items-center justify-center gap-4 py-3 px-6 w-fit mx-auto
				bg-linear-to-br from-white/10 via-white/5 to-transparent
				backdrop-blur-xl backdrop-saturate-150
				rounded-2xl
				border border-white/20
				shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]
				before:absolute before:inset-0 before:rounded-2xl before:bg-linear-to-b before:from-white/10 before:to-transparent before:opacity-50 before:pointer-events-none
				transition-all duration-500 ease-in-out
				hover:shadow-[0_8px_40px_rgba(236,29,36,0.15),inset_0_1px_0_rgba(255,255,255,0.15)] hover:border-white/30
				${
					isVisible
						? "opacity-100 translate-y-0 scale-100"
						: "opacity-0 -translate-y-4 scale-95 pointer-events-none"
				}`}
		>
			<LikeButton
				contentId={contentId}
				contentType={contentType}
				initialCount={initialLikes}
				userHasLiked={userHasLiked}
				isLoggedIn={isLoggedIn}
				size="md"
			/>
			<div className="w-px h-6 bg-linear-to-b from-transparent via-white/30 to-transparent" />
			<ShareButton contentId={contentId} contentType={contentType} size="md" />
		</div>
	);
}
