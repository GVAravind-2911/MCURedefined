"use client";

import { memo, useEffect } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import ProfileContent from "./ProfileContent";

interface LikedContentTabProps {
	session: {
		user: {
			id: string;
			name: string;
			email: string;
			image?: string;
		};
		session: {
			id: string;
			userId: string;
			expiresAt: Date;
			token: string;
			createdAt: Date;
			updatedAt: Date;
		};
	};
}

const LikedContentTab = ({ session }: LikedContentTabProps) => {
	const { 
		likedContent, 
		metadata, 
		isLoading, 
		refreshLikedContent,
		error 
	} = useProfile();

	// Load liked content if not already loaded
	useEffect(() => {
		if (!likedContent && !isLoading) {
			refreshLikedContent();
		}
	}, [likedContent, isLoading, refreshLikedContent]);

	return (
		<>
			<div className="mb-8 border-b border-white/10 pb-6">
				<h2 className="font-[BentonSansBold] text-2xl md:text-3xl text-white mb-2">Liked Content</h2>
				<p className="font-[BentonSansRegular] text-base text-white/70 leading-relaxed">
					View and manage your liked blogs, reviews, and projects
				</p>
			</div>
			
			{error && (
				<div className="flex justify-between items-center bg-red-500/10 border border-red-500/25 rounded-lg p-4 text-red-400 text-sm mb-4">
					<span>{error}</span>
				</div>
			)}
			
			<ProfileContent 
				session={session} 
				likedContent={likedContent}
				metadata={metadata}
				isLoading={isLoading}
				onRefresh={refreshLikedContent}
			/>
		</>
	);
};

export default memo(LikedContentTab);
