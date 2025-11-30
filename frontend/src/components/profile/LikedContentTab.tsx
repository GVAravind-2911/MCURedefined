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
			<div className="profile-tab-header">
				<h2 className="profile-tab-title">Liked Content</h2>
				<p className="profile-tab-description">
					View and manage your liked blogs, reviews, and projects
				</p>
			</div>
			
			{error && (
				<div className="error-message">
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
