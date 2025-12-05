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
		const baseClasses = "p-6 md:p-8 min-h-[400px]";
		const transitionClasses = isTransitioning 
			? "opacity-0 -translate-x-5" 
			: "opacity-100 translate-x-0 animate-[fadeInUp_0.4s_ease-out]";
		const contentClass = `${baseClasses} ${transitionClasses} transition-all duration-200 ease-out`;
		
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
						<div className="mb-8 border-b border-white/10 pb-6">
							<h2 className="font-[BentonSansBold] text-2xl md:text-3xl text-white mb-2">Session Management</h2>
							<p className="font-[BentonSansRegular] text-base text-white/70 leading-relaxed">
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
			<div className="flex flex-col gap-0 max-w-[1400px] mx-auto px-4 md:px-8 w-[95%] lg:w-[85%]">
				{/* Profile Header - LinkedIn style */}
				<ProfileHeader 
					profileUser={profileUser} 
					isOwnProfile={isOwnProfile}
					onEditProfile={() => handleSectionChange('profile')}
				/>
				
				<div className="flex flex-col lg:flex-row gap-6 mt-0">
					{/* Sidebar Navigation */}
					<aside className="lg:w-72 lg:shrink-0 bg-white/5 rounded-xl p-4 lg:p-6 h-fit border border-white/10 backdrop-blur-md">
						{['content', 'account'].map((sectionGroup) => {
							const items = sidebarItems.filter(item => item.section === sectionGroup);
							if (items.length === 0) return null;
							
							return (
								<div key={sectionGroup} className="mb-6 last:mb-0">
									<h3 className="font-[BentonSansBold] text-xs text-white/70 uppercase tracking-wide mb-3 px-2">
										{sectionGroup === 'content' ? 'Content' : 'Account'}
									</h3>
									<div className="flex flex-row lg:flex-col flex-wrap gap-1">
										{items.map(item => (
											<button
												key={item.id}
												className={`
													flex items-center w-full px-4 py-3 bg-transparent border-none
													text-white/80 font-[BentonSansRegular] text-sm text-left
													rounded-lg cursor-pointer transition-all duration-200 ease-in-out
													relative overflow-hidden group
													hover:bg-white/8 hover:text-white hover:translate-x-0.5
													${activeSection === item.id 
														? 'bg-[#ec1d24]/20 text-white! border border-[#ec1d24]/50 translate-x-1 shadow-[0_2px_8px_rgba(236,29,36,0.3)]' 
														: 'border-transparent'
													}
												`}
												onClick={() => handleSectionChange(item.id)}
											>
												<span className="mr-3 text-lg">{item.icon}</span>
												{item.label}
												{activeSection === item.id && (
													<span className="absolute -left-4 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#ec1d24] rounded-r" />
												)}
											</button>
										))}
									</div>
								</div>
							);
						})}
					</aside>

					{/* Main Content */}
					<main className="flex-1 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md overflow-hidden relative">
						{renderContent()}
					</main>
				</div>
			</div>
		</ProfileProvider>
	) : (
		<div className="flex flex-col gap-0 max-w-[1400px] mx-auto px-4 md:px-8 w-[95%] lg:w-[85%]">
			{/* Profile Header - LinkedIn style */}
			<ProfileHeader profileUser={profileUser} isOwnProfile={isOwnProfile} />
			
			<div className="flex flex-col lg:flex-row gap-6 mt-0">
				{/* Sidebar Navigation - minimal for public view */}
				<aside className="lg:w-72 lg:shrink-0 bg-white/5 rounded-xl p-4 lg:p-6 h-fit border border-white/10 backdrop-blur-md">
					<div className="mb-6 last:mb-0">
						<h3 className="font-[BentonSansBold] text-xs text-white/70 uppercase tracking-wide mb-3 px-2">
							Content
						</h3>
						<div className="flex flex-row lg:flex-col flex-wrap gap-1">
							{sidebarItems.map(item => (
								<button
									key={item.id}
									className={`
										flex items-center w-full px-4 py-3 bg-transparent border-none
										text-white/80 font-[BentonSansRegular] text-sm text-left
										rounded-lg cursor-pointer transition-all duration-200 ease-in-out
										relative overflow-hidden group
										hover:bg-white/8 hover:text-white hover:translate-x-0.5
										${activeSection === item.id 
											? 'bg-[#ec1d24]/20 text-white! border border-[#ec1d24]/50 translate-x-1 shadow-[0_2px_8px_rgba(236,29,36,0.3)]' 
											: 'border-transparent'
										}
									`}
									onClick={() => handleSectionChange(item.id)}
								>
									<span className="mr-3 text-lg">{item.icon}</span>
									{item.label}
									{activeSection === item.id && (
										<span className="absolute -left-4 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#ec1d24] rounded-r" />
									)}
								</button>
							))}
						</div>
					</div>
				</aside>

				{/* Main Content */}
				<main className="flex-1 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md overflow-hidden relative">
					{renderContent()}
				</main>
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
		<header className="relative bg-white/5 rounded-xl border border-white/10 overflow-hidden mb-6">
			{/* Banner */}
			<div className="h-32 md:h-40 bg-linear-to-br from-[#ec1d24] via-[#8b0000] to-[#2d0a0a] relative">
				<div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-black/40 to-transparent" />
			</div>
			
			{/* Profile Content */}
			<div className="flex flex-col md:flex-row items-center md:items-end px-4 md:px-8 pb-6 -mt-12 md:-mt-14 relative z-10">
				{/* Avatar */}
				<div className="shrink-0">
					{profileUser.image ? (
						<Image
							src={profileUser.image}
							alt={profileUser.displayUsername}
							width={140}
							height={140}
							className="w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-[#1a1a1a] object-cover shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
						/>
					) : (
						<div className="w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-[#1a1a1a] bg-linear-to-br from-[#ec1d24] to-[#ff6b6b] flex items-center justify-center text-3xl md:text-5xl font-[BentonSansBold] text-white shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
							{profileUser.displayUsername.charAt(0).toUpperCase()}
						</div>
					)}
				</div>
				
				{/* Info */}
				<div className="md:ml-6 mt-4 md:mt-0 pb-2 text-center md:text-left">
					<div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-1">
						<h1 className="font-[BentonSansBold] text-2xl md:text-3xl text-white">
							{profileUser.displayUsername}
						</h1>
						{profileUser.role === 'admin' && (
							<span className="bg-[#ec1d24] text-white px-3 py-1 rounded-full text-xs font-[BentonSansBold] uppercase tracking-wider">
								Admin
							</span>
						)}
					</div>
					<p className="text-[#ec1d24] text-sm md:text-base mb-1">@{profileUser.username}</p>
					<p className="text-white/50 text-sm">
						Member since {new Date(profileUser.createdAt).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
						})}
					</p>
					{isOwnProfile && onEditProfile && (
						<button 
							onClick={onEditProfile} 
							className="mt-4 px-4 py-2 bg-transparent border border-white/30 rounded-lg text-white/80 text-sm transition-all duration-200 hover:bg-white/10 hover:border-white/50 hover:text-white"
						>
							Edit Profile
						</button>
					)}
				</div>
			</div>
		</header>
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
			<div className="mb-8 border-b border-white/10 pb-6">
				<h2 className="font-[BentonSansBold] text-2xl md:text-3xl text-white mb-2">Published Content</h2>
				<p className="font-[BentonSansRegular] text-base text-white/70 leading-relaxed">
					{isOwnProfile 
						? `You have published ${totalContent} piece${totalContent !== 1 ? 's' : ''} of content`
						: `${displayUsername} has published ${totalContent} piece${totalContent !== 1 ? 's' : ''} of content`
					}
				</p>
			</div>

			<div className="flex flex-col gap-8">
				{blogs.length > 0 && (
					<section className="bg-white/5 rounded-xl p-5 md:p-6 border border-white/10">
						<h3 className="flex items-center gap-2 font-[BentonSansBold] text-lg md:text-xl text-white mb-5 pb-3 border-b border-white/10">
							<span className="text-xl">📰</span>
							Blog Posts ({blogs.length})
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
							{blogs.map((blog) => (
								<Link
									key={blog.id}
									href={`/blogs/${blog.id}`}
									className="group bg-white/5 rounded-xl overflow-hidden border border-white/10 no-underline transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)]"
								>
									<div className="relative w-full aspect-video overflow-hidden">
										<Image
											src={blog.thumbnail_path?.link || "/images/placeholder.jpg"}
											alt={blog.title}
											width={300}
											height={180}
											className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
										/>
									</div>
									<div className="p-4">
										<h4 className="font-[BentonSansBold] text-sm md:text-base text-white/90 mb-2 line-clamp-2 leading-snug">
											{blog.title}
										</h4>
										<p className="text-xs md:text-sm text-white/50">
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
					<section className="bg-white/5 rounded-xl p-5 md:p-6 border border-white/10">
						<h3 className="flex items-center gap-2 font-[BentonSansBold] text-lg md:text-xl text-white mb-5 pb-3 border-b border-white/10">
							<span className="text-xl">⭐</span>
							Reviews ({reviews.length})
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
							{reviews.map((review) => (
								<Link
									key={review.id}
									href={`/reviews/${review.id}`}
									className="group bg-white/5 rounded-xl overflow-hidden border border-white/10 no-underline transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)]"
								>
									<div className="relative w-full aspect-video overflow-hidden">
										<Image
											src={review.thumbnail_path?.link || "/images/placeholder.jpg"}
											alt={review.title}
											width={300}
											height={180}
											className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
										/>
									</div>
									<div className="p-4">
										<h4 className="font-[BentonSansBold] text-sm md:text-base text-white/90 mb-2 line-clamp-2 leading-snug">
											{review.title}
										</h4>
										<p className="text-xs md:text-sm text-white/50">
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
					<div className="text-center py-12 px-8 text-white/50 bg-white/5 rounded-xl border border-white/10">
						<div className="text-5xl mb-4">📭</div>
						<p className="text-lg mb-2">
							{isOwnProfile 
								? "You haven't published any content yet."
								: "This user hasn't published any content yet."
							}
						</p>
						{isOwnProfile && (
							<p className="text-sm text-white/30 mt-2">
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
