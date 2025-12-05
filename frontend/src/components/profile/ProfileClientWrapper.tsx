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
		const contentClass = `p-6 md:p-8 animate-[fadeInUp_0.3s_ease-out] ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'} transition-all duration-150`;
		
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
						<div className="mb-6">
							<h2 className="font-[BentonSansBold] text-xl md:text-2xl text-white mb-2">Session Management</h2>
							<p className="font-[BentonSansRegular] text-sm text-white/70">
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
			<div className="flex flex-col lg:flex-row gap-6">
				{/* Sidebar Navigation */}
				<aside className="lg:w-72 lg:shrink-0 bg-white/5 rounded-xl p-4 lg:p-6 h-fit border border-white/10 backdrop-blur-md">
					<div className="mb-6 last:mb-0">
						<h3 className="font-[BentonSansBold] text-xs text-white/70 uppercase tracking-wide mb-3 px-2">Account</h3>
						<div className="flex flex-row lg:flex-col flex-wrap gap-1">
							{sidebarItems
								.filter(item => item.section === 'account')
								.map(item => (
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

					<div className="mb-6 last:mb-0">
						<h3 className="font-[BentonSansBold] text-xs text-white/70 uppercase tracking-wide mb-3 px-2">Content</h3>
						<div className="flex flex-row lg:flex-col flex-wrap gap-1">
							{sidebarItems
								.filter(item => item.section === 'content')
								.map(item => (
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
				<main className="flex-1 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md overflow-hidden">
					{renderContent()}
				</main>
			</div>
		</ProfileProvider>
	);
};

export default memo(ProfileClientWrapper);
