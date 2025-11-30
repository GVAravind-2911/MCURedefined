"use client";

import { memo, useState } from "react";
import { EditingProvider } from "@/contexts/EditingContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import ProfileEditTab from "./ProfileEditTab";
import LikedContentTab from "./LikedContentTab";
import SessionManageTab from "./SessionManageTab";
import type { Session } from 'better-auth/types';

interface ProfileClientWrapperProps {
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
	activeSessions: Session[];
	currentSessionId: string;
}

const ProfileClientWrapper = ({ session, activeSessions, currentSessionId }: ProfileClientWrapperProps) => {
	const [activeSection, setActiveSection] = useState('profile');
	const [isTransitioning, setIsTransitioning] = useState(false);

	const handleSectionChange = (newSection: string) => {
		if (newSection === activeSection) return;
		
		setIsTransitioning(true);
		
		// Small delay to allow exit animation
		setTimeout(() => {
			setActiveSection(newSection);
			setIsTransitioning(false);
		}, 150);
	};

	const sidebarItems = [
		{
			id: 'profile',
			label: 'Profile',
			icon: '👤',
			section: 'account'
		},
		{
			id: 'sessions',
			label: 'Sessions',
			icon: '🔐',
			section: 'account'
		},
		{
			id: 'liked',
			label: 'Liked Content',
			icon: '❤️',
			section: 'content'
		}
	];

	const renderContent = () => {
		const contentClass = `profile-tab-content ${isTransitioning ? 'switching' : ''}`;
		
		switch (activeSection) {
			case 'profile':
				return (
					<EditingProvider>
						<div className={contentClass}>
							<ProfileEditTab session={session} />
						</div>
					</EditingProvider>
				);
			case 'sessions':
				return (
					<div className={contentClass}>
						<div className="profile-tab-header">
							<h2 className="profile-tab-title">Session Management</h2>
							<p className="profile-tab-description">
								View and manage your active sessions across different devices
							</p>
						</div>
						<SessionManageTab 
							initialSessions={activeSessions}
							currentSessionId={currentSessionId}
						/>
					</div>
				);
			case 'liked':
				return (
					<EditingProvider>
						<div className={contentClass}>
							<LikedContentTab session={session} />
						</div>
					</EditingProvider>
				);
			default:
				return (
					<EditingProvider>
						<div className={contentClass}>
							<ProfileEditTab session={session} />
						</div>
					</EditingProvider>
				);
		}
	};

	return (
		<ProfileProvider session={session}>
			<div className="profile-container">
				{/* Sidebar Navigation */}
				<div className="profile-sidebar">
					<div className="sidebar-section">
						<h3 className="sidebar-section-title">Account</h3>
						{sidebarItems
							.filter(item => item.section === 'account')
							.map(item => (
								<button
									key={item.id}
									className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
									onClick={() => handleSectionChange(item.id)}
								>
									<span className="sidebar-icon">{item.icon}</span>
									{item.label}
								</button>
							))}
					</div>

					<div className="sidebar-section">
						<h3 className="sidebar-section-title">Content</h3>
						{sidebarItems
							.filter(item => item.section === 'content')
							.map(item => (
								<button
									key={item.id}
									className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
									onClick={() => handleSectionChange(item.id)}
								>
									<span className="sidebar-icon">{item.icon}</span>
									{item.label}
								</button>
							))}
					</div>
				</div>

				{/* Main Content */}
				<div className="profile-main-content">
					{renderContent()}
				</div>
			</div>
		</ProfileProvider>
	);
};

export default memo(ProfileClientWrapper);
