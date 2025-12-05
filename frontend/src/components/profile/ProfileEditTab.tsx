"use client";

import { memo } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import ProfileInfo from "./ProfileInfo";

interface ProfileEditTabProps {
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

const ProfileEditTab = ({ session }: ProfileEditTabProps) => {
	const { 
		userProfile, 
		profileUser, 
		isLoading, 
		isUpdating, 
		updateProfile, 
		error 
	} = useProfile();

	const handleProfileUpdate = async () => {
		// The context will handle refreshing the data
		// No need for manual refetch here
	};

	return (
		<>
			<div className="mb-8 border-b border-white/10 pb-6">
				<h2 className="font-[BentonSansBold] text-2xl md:text-3xl text-white mb-2">Profile Information</h2>
				<p className="font-[BentonSansRegular] text-base text-white/70 leading-relaxed">
					Manage your personal information and account details
				</p>
			</div>
			
			{error && (
				<div className="flex justify-between items-center bg-red-500/10 border border-red-500/25 rounded-lg p-4 text-red-400 text-sm mb-4">
					<span>{error}</span>
				</div>
			)}
			
			<div className="mt-4">
				<ProfileInfo 
					session={{ 
						...session, 
						user: profileUser || session.user 
					}}
					userProfile={userProfile}
					onProfileUpdate={handleProfileUpdate}
					isLoading={isLoading}
					isUpdating={isUpdating}
					onUpdate={updateProfile}
				/>
			</div>
		</>
	);
};

export default memo(ProfileEditTab);
