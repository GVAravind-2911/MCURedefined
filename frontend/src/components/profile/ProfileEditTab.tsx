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
			<div className="profile-tab-header">
				<h2 className="profile-tab-title">Profile Information</h2>
				<p className="profile-tab-description">
					Manage your personal information and account details
				</p>
			</div>
			
			{error && (
				<div className="error-message">
					<span>{error}</span>
				</div>
			)}
			
			<div className="profile-info-wrapper">
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
