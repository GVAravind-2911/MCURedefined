"use client";

import { memo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { EditingProvider } from "@/contexts/EditingContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import ProfileEditTab from "./ProfileEditTab";
import LikedContentTab from "./LikedContentTab";
import SessionManageTab from "./SessionManageTab";
import type { Session } from 'better-auth/types';

interface ContentItem {
	id: number;
	title: string;
	thumbnail_path: { link: string };
	created_at: string;
	description?: string;
}

interface ProfileUser {
	id: string;
	name: string;
	email: string;
	username: string;
	displayUsername: string;
	image: string | null;
	createdAt: string;
	role: string;
}

interface UnifiedProfileClientProps {
	profileUser: ProfileUser;
	blogs: ContentItem[];
	reviews: ContentItem[];
	isOwnProfile: boolean;
	session: any;
	activeSessions: Session[];
}

const UnifiedProfileClient = ({
	profileUser,
	blogs,
	reviews,
	isOwnProfile,
	session,
	activeSessions,
}: UnifiedProfileClientProps) => {
	const [activeSection, setActiveSection] = useState('published');
	const [isTransitioning, setIsTransitioning] = useState(false);

	const handleSectionChange = (newSection: string) => {
		if (newSection === activeSection) return;
		
		setIsTransitioning(true);
		
		setTimeout(() => {
			setActiveSection(newSection);
			setIsTransitioning(false);
		}, 150);
	};

	// Sidebar items - different for own profile vs public view
	const sidebarItems = isOwnProfile
		? [
			{ id: 'published', label: 'Published Content', icon: '📝', section: 'content' },
			{ id: 'liked', label: 'Liked Content', icon: '❤️', section: 'content' },
			{ id: 'profile', label: 'Edit Profile', icon: '👤', section: 'account' },
			{ id: 'sessions', label: 'Sessions', icon: '🔐', section: 'account' },
		]
		: [
			{ id: 'published', label: 'Published Content', icon: '📝', section: 'content' },
		];

	const renderContent = () => {
		const contentClass = `profile-tab-content ${isTransitioning ? 'switching' : ''}`;
		
		switch (activeSection) {
			case 'published':
				return (
					<div className={contentClass}>
						<PublishedContentSection 
							blogs={blogs} 
							reviews={reviews} 
							isOwnProfile={isOwnProfile}
							displayUsername={profileUser.displayUsername}
						/>
					</div>
				);
			case 'liked':
				if (!isOwnProfile || !session) return null;
				return (
					<EditingProvider>
						<div className={contentClass}>
							<LikedContentTab session={session} />
						</div>
					</EditingProvider>
				);
			case 'profile':
				if (!isOwnProfile || !session) return null;
				return (
					<EditingProvider>
						<div className={contentClass}>
							<ProfileEditTab session={session} />
						</div>
					</EditingProvider>
				);
			case 'sessions':
				if (!isOwnProfile || !session) return null;
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
							currentSessionId={session.session.id}
						/>
					</div>
				);
			default:
				return (
					<div className={contentClass}>
						<PublishedContentSection 
							blogs={blogs} 
							reviews={reviews} 
							isOwnProfile={isOwnProfile}
							displayUsername={profileUser.displayUsername}
						/>
					</div>
				);
		}
	};

	const content = isOwnProfile && session ? (
		<ProfileProvider session={session}>
			<div className="profile-container">
				{/* Profile Header - LinkedIn style */}
				<ProfileHeader 
					profileUser={profileUser} 
					isOwnProfile={isOwnProfile}
					onEditProfile={() => handleSectionChange('profile')}
				/>
				
				<div className="profile-body">
					{/* Sidebar Navigation */}
					<div className="profile-sidebar">
						{['content', 'account'].map((sectionGroup) => {
							const items = sidebarItems.filter(item => item.section === sectionGroup);
							if (items.length === 0) return null;
							
							return (
								<div key={sectionGroup} className="sidebar-section">
									<h3 className="sidebar-section-title">
										{sectionGroup === 'content' ? 'Content' : 'Account'}
									</h3>
									{items.map(item => (
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
							);
						})}
					</div>

					{/* Main Content */}
					<div className="profile-main-content">
						{renderContent()}
					</div>
				</div>
			</div>
		</ProfileProvider>
	) : (
		<div className="profile-container">
			{/* Profile Header - LinkedIn style */}
			<ProfileHeader profileUser={profileUser} isOwnProfile={isOwnProfile} />
			
			<div className="profile-body">
				{/* Sidebar Navigation - minimal for public view */}
				<div className="profile-sidebar">
					<div className="sidebar-section">
						<h3 className="sidebar-section-title">Content</h3>
						{sidebarItems.map(item => (
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
		</div>
	);

	return content;
};

// Profile Header Component - LinkedIn style banner
const ProfileHeader = memo(({ 
	profileUser, 
	isOwnProfile,
	onEditProfile,
}: { 
	profileUser: ProfileUser; 
	isOwnProfile: boolean;
	onEditProfile?: () => void;
}) => {
	return (
		<div className="unified-profile-header">
			<div className="profile-banner" />
			<div className="profile-header-content">
				<div className="profile-avatar-wrapper">
					{profileUser.image ? (
						<Image
							src={profileUser.image}
							alt={profileUser.displayUsername}
							width={140}
							height={140}
							className="profile-avatar-large"
						/>
					) : (
						<div className="profile-avatar-placeholder-large">
							{profileUser.displayUsername.charAt(0).toUpperCase()}
						</div>
					)}
				</div>
				<div className="profile-header-info">
					<div className="profile-name-section">
						<h1 className="profile-display-name">{profileUser.displayUsername}</h1>
						{profileUser.role === 'admin' && (
							<span className="profile-role-badge">Admin</span>
						)}
					</div>
					<p className="profile-username-text">@{profileUser.username}</p>
					<p className="profile-member-since">
						Member since {new Date(profileUser.createdAt).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
						})}
					</p>
					{isOwnProfile && onEditProfile && (
						<button onClick={onEditProfile} className="edit-profile-link">
							Edit Profile
						</button>
					)}
				</div>
			</div>
		</div>
	);
});
ProfileHeader.displayName = 'ProfileHeader';

// Published Content Section Component
const PublishedContentSection = memo(({ 
	blogs, 
	reviews, 
	isOwnProfile,
	displayUsername,
}: { 
	blogs: ContentItem[]; 
	reviews: ContentItem[];
	isOwnProfile: boolean;
	displayUsername: string;
}) => {
	const totalContent = blogs.length + reviews.length;

	return (
		<>
			<div className="profile-tab-header">
				<h2 className="profile-tab-title">Published Content</h2>
				<p className="profile-tab-description">
					{isOwnProfile 
						? `You have published ${totalContent} piece${totalContent !== 1 ? 's' : ''} of content`
						: `${displayUsername} has published ${totalContent} piece${totalContent !== 1 ? 's' : ''} of content`
					}
				</p>
			</div>

			<div className="published-content-wrapper">
				{blogs.length > 0 && (
					<section className="published-section">
						<h3 className="published-section-title">
							<span className="section-icon">📰</span>
							Blog Posts ({blogs.length})
						</h3>
						<div className="content-grid">
							{blogs.map((blog) => (
								<Link
									key={blog.id}
									href={`/blogs/${blog.id}`}
									className="content-card"
								>
									<div className="content-card-image">
										<Image
											src={blog.thumbnail_path?.link || "/images/placeholder.jpg"}
											alt={blog.title}
											width={300}
											height={180}
											className="card-thumbnail"
										/>
									</div>
									<div className="content-card-info">
										<h4 className="card-title">{blog.title}</h4>
										<p className="card-date">
											{new Date(blog.created_at).toLocaleDateString("en-US", {
												year: "numeric",
												month: "short",
												day: "numeric"
											})}
										</p>
									</div>
								</Link>
							))}
						</div>
					</section>
				)}

				{reviews.length > 0 && (
					<section className="published-section">
						<h3 className="published-section-title">
							<span className="section-icon">⭐</span>
							Reviews ({reviews.length})
						</h3>
						<div className="content-grid">
							{reviews.map((review) => (
								<Link
									key={review.id}
									href={`/reviews/${review.id}`}
									className="content-card"
								>
									<div className="content-card-image">
										<Image
											src={review.thumbnail_path?.link || "/images/placeholder.jpg"}
											alt={review.title}
											width={300}
											height={180}
											className="card-thumbnail"
										/>
									</div>
									<div className="content-card-info">
										<h4 className="card-title">{review.title}</h4>
										<p className="card-date">
											{new Date(review.created_at).toLocaleDateString("en-US", {
												year: "numeric",
												month: "short",
												day: "numeric"
											})}
										</p>
									</div>
								</Link>
							))}
						</div>
					</section>
				)}

				{blogs.length === 0 && reviews.length === 0 && (
					<div className="no-content-message">
						<div className="no-content-icon">📭</div>
						<p>
							{isOwnProfile 
								? "You haven't published any content yet."
								: "This user hasn't published any content yet."
							}
						</p>
						{isOwnProfile && (
							<p className="no-content-hint">
								Start creating blogs or reviews to see them here!
							</p>
						)}
					</div>
				)}
			</div>
		</>
	);
});
PublishedContentSection.displayName = 'PublishedContentSection';

export default memo(UnifiedProfileClient);
