"use client";

import { memo } from "react";
import type { ManagedUser, UserStats, ModalState } from "../types";
import { formatDate, getRoleBadgeClass } from "../utils";

interface UserDetailModalProps {
	user: ManagedUser;
	userStats: UserStats | null;
	statsLoading: boolean;
	actionLoading: boolean;
	onImpersonate: (user: ManagedUser) => void;
	onUnbanUser: (user: ManagedUser) => void;
	onViewSessions: (user: ManagedUser) => void;
	setModal: (modal: ModalState) => void;
}

export default memo(function UserDetailModal({
	user,
	userStats,
	statsLoading,
	actionLoading,
	onImpersonate,
	onUnbanUser,
	onViewSessions,
	setModal,
}: UserDetailModalProps) {
	return (
		<div className="flex flex-col gap-4 sm:gap-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 pb-4 sm:pb-6 border-b border-white/10">
				{user.image ? (
					<img 
						src={user.image} 
						alt={user.name} 
						className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full object-cover border-[3px] border-[#ec1d24] shadow-[0_0_20px_rgba(236,29,36,0.3)]" 
					/>
				) : (
					<div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-linear-to-br from-[rgba(236,29,36,0.15)] to-[#ec1d24] flex items-center justify-center font-bold text-xl sm:text-[1.75rem] text-white border-[3px] border-[#ec1d24]">
						{user.name.charAt(0).toUpperCase()}
					</div>
				)}
				<div className="flex-1 text-center sm:text-left min-w-0">
					<h3 className="text-lg sm:text-[1.35rem] font-bold text-white mb-1 truncate">{user.name}</h3>
					<p className="text-[0.85rem] sm:text-[0.9rem] text-white/40 mb-0.5 truncate">@{user.username || user.displayUsername}</p>
					<p className="text-[0.85rem] sm:text-[0.9rem] text-white/70 truncate">{user.email}</p>
				</div>
				<span className={`inline-flex items-center py-1.5 px-3 sm:py-2 sm:px-4 rounded-[20px] text-[0.8rem] sm:text-[0.85rem] font-semibold capitalize shrink-0 ${getRoleBadgeClass(user.role)}`}>
					{user.role}
				</span>
			</div>

			{/* Meta */}
			<div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 sm:gap-4">
				<div className="flex flex-col gap-1.5 py-3 px-3 sm:py-3.5 sm:px-4 bg-black/30 rounded-[10px] border border-white/10">
					<span className="text-[0.7rem] sm:text-[0.75rem] text-white/40 uppercase tracking-[0.5px]">Status</span>
					<span className={`inline-flex items-center w-fit py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-[20px] text-[0.75rem] sm:text-[0.8rem] font-semibold ${
						user.banned 
							? "bg-red-500/15 text-red-300 border border-red-500/30" 
							: "bg-green-500/15 text-green-300 border border-green-500/30"
					}`}>
						{user.banned ? "Banned" : "Active"}
					</span>
				</div>
				<div className="flex flex-col gap-1.5 py-3 px-3 sm:py-3.5 sm:px-4 bg-black/30 rounded-[10px] border border-white/10">
					<span className="text-[0.7rem] sm:text-[0.75rem] text-white/40 uppercase tracking-[0.5px]">Email Verified</span>
					<span className={user.emailVerified ? "text-green-400 font-medium text-sm" : "text-white/40 text-sm"}>
						{user.emailVerified ? "Yes" : "No"}
					</span>
				</div>
				<div className="flex flex-col gap-1.5 py-3 px-3 sm:py-3.5 sm:px-4 bg-black/30 rounded-[10px] border border-white/10">
					<span className="text-[0.7rem] sm:text-[0.75rem] text-white/40 uppercase tracking-[0.5px]">Created</span>
					<span className="text-white text-sm">{formatDate(user.createdAt)}</span>
				</div>
				{user.banReason && (
					<div className="flex flex-col gap-1.5 py-3 px-3 sm:py-3.5 sm:px-4 bg-black/30 rounded-[10px] border border-white/10 col-span-full">
						<span className="text-[0.7rem] sm:text-[0.75rem] text-white/40 uppercase tracking-[0.5px]">Ban Reason</span>
						<span className="text-white text-sm">{user.banReason}</span>
					</div>
				)}
			</div>

			{/* Stats */}
			<div className="p-4 sm:p-5 bg-black/20 rounded-[10px] border border-white/10">
				<h4 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">Activity Statistics</h4>
				{statsLoading ? (
					<div className="flex items-center gap-3 justify-center py-6 sm:py-8 text-white/40">
						<div className="w-5 h-5 border-2 border-white/20 border-t-[#ec1d24] rounded-full animate-spin" />
						<span className="text-sm">Loading stats...</span>
					</div>
				) : userStats ? (
					<div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2 sm:gap-3">
						<div className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-[rgba(18,18,18,0.95)] rounded-[10px] border border-white/10 text-center transition-all duration-[0.25s] hover:border-[#ec1d24] hover:-translate-y-0.5">
							<svg className="text-[#ec1d24] w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
								<polyline points="14 2 14 8 20 8" />
								<line x1="16" y1="13" x2="8" y2="13" />
								<line x1="16" y1="17" x2="8" y2="17" />
								<polyline points="10 9 9 9 8 9" />
							</svg>
							<span className="text-xl sm:text-2xl font-bold text-white">{userStats.blogsWritten}</span>
							<span className="text-[0.65rem] sm:text-[0.75rem] text-white/40">Blogs</span>
						</div>
						<div className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-[rgba(18,18,18,0.95)] rounded-[10px] border border-white/10 text-center transition-all duration-[0.25s] hover:border-[#ec1d24] hover:-translate-y-0.5">
							<svg className="text-[#ec1d24] w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
							</svg>
							<span className="text-xl sm:text-2xl font-bold text-white">{userStats.reviewsWritten}</span>
							<span className="text-[0.65rem] sm:text-[0.75rem] text-white/40">Reviews</span>
						</div>
						<div className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-[rgba(18,18,18,0.95)] rounded-[10px] border border-white/10 text-center transition-all duration-[0.25s] hover:border-[#ec1d24] hover:-translate-y-0.5">
							<svg className="text-[#ec1d24] w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
							</svg>
							<span className="text-xl sm:text-2xl font-bold text-white">{userStats.likedBlogs}</span>
							<span className="text-[0.65rem] sm:text-[0.75rem] text-white/40">Liked Blogs</span>
						</div>
						<div className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-[rgba(18,18,18,0.95)] rounded-[10px] border border-white/10 text-center transition-all duration-[0.25s] hover:border-[#ec1d24] hover:-translate-y-0.5">
							<svg className="text-[#ec1d24] w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
							</svg>
							<span className="text-xl sm:text-2xl font-bold text-white">{userStats.likedReviews}</span>
							<span className="text-[0.65rem] sm:text-[0.75rem] text-white/40">Liked Reviews</span>
						</div>
						<div className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-[rgba(18,18,18,0.95)] rounded-[10px] border border-white/10 text-center transition-all duration-[0.25s] hover:border-[#ec1d24] hover:-translate-y-0.5 col-span-2 sm:col-span-1">
							<svg className="text-[#ec1d24] w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<circle cx="12" cy="12" r="10" />
								<polyline points="12 6 12 12 16 14" />
							</svg>
							<span className="text-xl sm:text-2xl font-bold text-white">{userStats.likedTimeline}</span>
							<span className="text-[0.65rem] sm:text-[0.75rem] text-white/40">Liked Timeline</span>
						</div>
					</div>
				) : (
					<p className="text-center text-white/40 py-4 text-sm">Unable to load statistics</p>
				)}
			</div>

			{/* Actions */}
			<div className="flex gap-2 sm:gap-3 flex-wrap pt-3 sm:pt-4 border-t border-white/10">
				<button
					type="button"
					className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 sm:py-3 sm:px-5 rounded-[10px] font-semibold text-[0.8rem] sm:text-[0.9rem] cursor-pointer transition-all duration-[0.25s] border border-white/10 bg-transparent text-white/70 hover:enabled:-translate-y-0.5 hover:enabled:bg-blue-500/15 hover:enabled:border-blue-500 hover:enabled:text-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-none"
					onClick={() => onImpersonate(user)}
					disabled={actionLoading || user.role === "admin"}
				>
					<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
						<circle cx="12" cy="7" r="4" />
					</svg>
					<span className="hidden sm:inline">Impersonate</span>
					<span className="sm:hidden">Impersonate</span>
				</button>
				{user.banned ? (
					<button
						type="button"
						className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 sm:py-3 sm:px-5 rounded-[10px] font-semibold text-[0.8rem] sm:text-[0.9rem] cursor-pointer transition-all duration-[0.25s] border border-white/10 bg-transparent text-white/70 hover:enabled:-translate-y-0.5 hover:enabled:bg-green-500/15 hover:enabled:border-green-500 hover:enabled:text-green-500 disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-none"
						onClick={() => onUnbanUser(user)}
						disabled={actionLoading}
					>
						<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<circle cx="12" cy="12" r="10" />
							<path d="M12 8v4l2 2" />
						</svg>
						Unban
					</button>
				) : (
					<button
						type="button"
						className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 sm:py-3 sm:px-5 rounded-[10px] font-semibold text-[0.8rem] sm:text-[0.9rem] cursor-pointer transition-all duration-[0.25s] border border-white/10 bg-transparent text-white/70 hover:enabled:-translate-y-0.5 hover:enabled:bg-yellow-500/15 hover:enabled:border-yellow-500 hover:enabled:text-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-none"
						onClick={() => setModal({ type: "ban", user })}
						disabled={actionLoading || user.role === "admin"}
					>
						<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<circle cx="12" cy="12" r="10" />
							<line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
						</svg>
						Ban
					</button>
				)}
				<button
					type="button"
					className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 sm:py-3 sm:px-5 rounded-[10px] font-semibold text-[0.8rem] sm:text-[0.9rem] cursor-pointer transition-all duration-[0.25s] border border-white/10 bg-transparent text-white/70 hover:enabled:-translate-y-0.5 hover:enabled:bg-purple-500/15 hover:enabled:border-purple-500 hover:enabled:text-purple-500 disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-none"
					onClick={() => onViewSessions(user)}
					disabled={actionLoading}
				>
					<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
						<line x1="8" y1="21" x2="16" y2="21" />
						<line x1="12" y1="17" x2="12" y2="21" />
					</svg>
					Sessions
				</button>
			</div>
		</div>
	);
});
