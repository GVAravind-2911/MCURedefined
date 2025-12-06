"use client";

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

type ContentType = "blog" | "blogs" | "review" | "reviews" | "project";

interface ShareButtonProps {
	contentId: number;
	contentType: ContentType;
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
	sm: { button: "w-9 h-9", icon: 16 },
	md: { button: "w-11 h-11", icon: 20 },
	lg: { button: "w-14 h-14", icon: 24 },
};

export default function ShareButton({
	contentId,
	contentType,
	size = "md",
}: ShareButtonProps) {
	const [copied, setCopied] = useState(false);
	const [isPending, setIsPending] = useState(false);

	const { path: apiPath, idKey } = getApiConfig(contentType);
	const { button: buttonSize, icon: iconSize } = sizeClasses[size];

	const handleShare = async () => {
		if (isPending) return;

		const url = window.location.href;

		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setIsPending(true);

			// Track share in background (don't wait)
			axios.post(`${apiPath}/share`, { [idKey]: contentId }).catch(() => {});

			setTimeout(() => {
				setCopied(false);
			}, 2000);
		} catch (err) {
			console.error(`Failed to share ${contentType}:`, err);
		} finally {
			setIsPending(false);
		}
	};

	return (
		<motion.button
			type="button"
			onClick={handleShare}
			disabled={isPending}
			className={`
				${buttonSize}
				flex items-center justify-center
				rounded-full
				transition-all duration-200
				cursor-pointer
				${
					copied
						? "bg-green-500/20 text-green-400"
						: "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
				}
			`}
			whileTap={{ scale: 0.9 }}
			whileHover={{ scale: 1.05 }}
			title={copied ? "Link copied!" : "Copy link"}
		>
			<motion.svg
				xmlns="http://www.w3.org/2000/svg"
				width={iconSize}
				height={iconSize}
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				animate={copied ? { scale: [1, 1.2, 1] } : {}}
				transition={{ duration: 0.3 }}
			>
				{copied ? (
					// Checkmark icon when copied
					<path d="M20 6L9 17l-5-5" />
				) : (
					// Share/link icon
					<>
						<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
						<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
					</>
				)}
			</motion.svg>
		</motion.button>
	);
}
