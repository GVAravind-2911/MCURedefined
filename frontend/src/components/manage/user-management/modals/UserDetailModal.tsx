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
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex items-center gap-5 pb-6 border-b border-white/10">
				{user.image ? (
					<img 
						src={user.image} 
						alt={user.name} 
						className="w-[72px] h-[72px] rounded-full object-cover border-[3px] border-[#ec1d24] shadow-[0_0_20px_rgba(236,29,36,0.3)]" 
					/>
				) : (
					<div className="w-[72px] h-[72px] rounded-full bg-linear-to-br from-[rgba(236,29,36,0.15)] to-[#ec1d24] flex items-center justify-center font-bold text-[1.75rem] text-white border-[3px] border-[#ec1d24]">
						{user.name.charAt(0).toUpperCase()}
					</div>
				)}
				<div className="flex-1">
					<h3 className="text-[1.35rem] font-bold text-white mb-1">{user.name}</h3>
					<p className="text-[0.9rem] text-white/40 mb-0.5">@{user.username || user.displayUsername}</p>
					<p className="text-[0.9rem] text-white/70">{user.email}</p>
				</div>
				<span className={`inline-flex items-center py-2 px-4 rounded-[20px] text-[0.85rem] font-semibold capitalize ${getRoleBadgeClass(user.role)}`}>
					{user.role}
				</span>
			</div>

			{/* Meta */}
			<div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
				<div className="flex flex-col gap-1.5 py-3.5 px-4 bg-black/30 rounded-[10px] border border-white/10">
					<span className="text-[0.75rem] text-white/40 uppercase tracking-[0.5px]">Status</span>
					<span className={`inline-flex items-center w-fit py-1.5 px-3 rounded-[20px] text-[0.8rem] font-semibold ${
						user.banned 
							? "bg-red-500/15 text-red-300 border border-red-500/30" 
							: "bg-green-500/15 text-green-300 border border-green-500/30"
					}`}>
						{user.banned ? "Banned" : "Active"}
					</span>
				</div>
				<div className="flex flex-col gap-1.5 py-3.5 px-4 bg-black/30 rounded-[10px] border border-white/10">
					<span className="text-[0.75rem] text-white/40 uppercase tracking-[0.5px]">Email Verified</span>
					<span className={user.emailVerified ? "text-green-400 font-medium" : "text-white/40"}>
						{user.emailVerified ? "Yes" : "No"}
					</span>
				</div>
				<div className="flex flex-col gap-1.5 py-3.5 px-4 bg-black/30 rounded-[10px] border border-white/10">
					<span className="text-[0.75rem] text-white/40 uppercase tracking-[0.5px]">Created</span>
					<span className="text-white">{formatDate(user.createdAt)}</span>
				</div>
				{user.banReason && (
					<div className="flex flex-col gap-1.5 py-3.5 px-4 bg-black/30 rounded-[10px] border border-white/10 col-span-full">
						<span className="text-[0.75rem] text-white/40 uppercase tracking-[0.5px]">Ban Reason</span>
						<span className="text-white">{user.banReason}</span>
					</div>
				)}
			</div>

			{/* Stats */}
			<div className="p-5 bg-black/20 rounded-[10px] border border-white/10">
				<h4 className="text-base font-semibold text-white mb-4">Activity Statistics</h4>
				{statsLoading ? (
					<div className="flex items-center gap-3 justify-center py-8 text-white/40">
						<div className="w-5 h-5 border-2 border-white/20 border-t-[#ec1d24] rounded-full animate-spin" />
						<span>Loading stats...</span>
					</div>
				) : userStats ? (
					<div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
						<div className="flex flex-col items-center gap-2 p-4 bg-[rgba(18,18,18,0.95)] rounded-[10px] border border-white/10 text-center transition-all duration-[0.25s] hover:border-[#ec1d24] hover:-translate-y-0.5">
							<svg className="text-[#ec1d24]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
								<polyline points="14 2 14 8 20 8" />
								<line x1="16" y1="13" x2="8" y2="13" />
								<line x1="16" y1="17" x2="8" y2="17" />
								<polyline points="10 9 9 9 8 9" />
							</svg>
							<span className="text-2xl font-bold text-white">{userStats.blogsWritten}</span>
							<span className="text-[0.75rem] text-white/40">Blogs Written</span>
						</div>
						<div className="flex flex-col items-center gap-2 p-4 bg-[rgba(18,18,18,0.95)] rounded-[10px] border border-white/10 text-center transition-all duration-[0.25s] hover:border-[#ec1d24] hover:-translate-y-0.5">
							<svg className="text-[#ec1d24]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
							</svg>
							<span className="text-2xl font-bold text-white">{userStats.reviewsWritten}</span>
							<span className="text-[0.75rem] text-white/40">Reviews Written</span>
						</div>
						<div className="flex flex-col items-center gap-2 p-4 bg-[rgba(18,18,18,0.95)] rounded-[10px] border border-white/10 text-center transition-all duration-[0.25s] hover:border-[#ec1d24] hover:-translate-y-0.5">
							<svg className="text-[#ec1d24]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
							</svg>
							<span className="text-2xl font-bold text-white">{userStats.likedBlogs}</span>
							<span className="text-[0.75rem] text-white/40">Liked Blogs</span>
						</div>
						<div className="flex flex-col items-center gap-2 p-4 bg-[rgba(18,18,18,0.95)] rounded-[10px] border border-white/10 text-center transition-all duration-[0.25s] hover:border-[#ec1d24] hover:-translate-y-0.5">
							<svg className="text-[#ec1d24]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
							</svg>
							<span className="text-2xl font-bold text-white">{userStats.likedReviews}</span>
							<span className="text-[0.75rem] text-white/40">Liked Reviews</span>
						</div>
						<div className="flex flex-col items-center gap-2 p-4 bg-[rgba(18,18,18,0.95)] rounded-[10px] border border-white/10 text-center transition-all duration-[0.25s] hover:border-[#ec1d24] hover:-translate-y-0.5">
							<svg className="text-[#ec1d24]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<circle cx="12" cy="12" r="10" />
								<polyline points="12 6 12 12 16 14" />
							</svg>
							<span className="text-2xl font-bold text-white">{userStats.likedTimeline}</span>
							<span className="text-[0.75rem] text-white/40">Liked Timeline</span>
						</div>
					</div>
				) : (
					<p className="text-center text-white/40 py-4">Unable to load statistics</p>
				)}
			</div>

			{/* Actions */}
			<div className="flex gap-3 flex-wrap pt-4 border-t border-white/10">
				<button
					type="button"
					className="flex items-center gap-2 py-3 px-5 rounded-[10px] font-semibold text-[0.9rem] cursor-pointer transition-all duration-[0.25s] border border-white/10 bg-transparent text-white/70 hover:enabled:-translate-y-0.5 hover:enabled:bg-blue-500/15 hover:enabled:border-blue-500 hover:enabled:text-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
					onClick={() => onImpersonate(user)}
					disabled={actionLoading || user.role === "admin"}
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
						<circle cx="12" cy="7" r="4" />
					</svg>
					Impersonate
				</button>
				{user.banned ? (
					<button
						type="button"
						className="flex items-center gap-2 py-3 px-5 rounded-[10px] font-semibold text-[0.9rem] cursor-pointer transition-all duration-[0.25s] border border-white/10 bg-transparent text-white/70 hover:enabled:-translate-y-0.5 hover:enabled:bg-green-500/15 hover:enabled:border-green-500 hover:enabled:text-green-500 disabled:opacity-40 disabled:cursor-not-allowed"
						onClick={() => onUnbanUser(user)}
						disabled={actionLoading}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<circle cx="12" cy="12" r="10" />
							<path d="M12 8v4l2 2" />
						</svg>
						Unban User
					</button>
				) : (
					<button
						type="button"
						className="flex items-center gap-2 py-3 px-5 rounded-[10px] font-semibold text-[0.9rem] cursor-pointer transition-all duration-[0.25s] border border-white/10 bg-transparent text-white/70 hover:enabled:-translate-y-0.5 hover:enabled:bg-yellow-500/15 hover:enabled:border-yellow-500 hover:enabled:text-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed"
						onClick={() => setModal({ type: "ban", user })}
						disabled={actionLoading || user.role === "admin"}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<circle cx="12" cy="12" r="10" />
							<line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
						</svg>
						Ban User
					</button>
				)}
				<button
					type="button"
					className="flex items-center gap-2 py-3 px-5 rounded-[10px] font-semibold text-[0.9rem] cursor-pointer transition-all duration-[0.25s] border border-white/10 bg-transparent text-white/70 hover:enabled:-translate-y-0.5 hover:enabled:bg-purple-500/15 hover:enabled:border-purple-500 hover:enabled:text-purple-500 disabled:opacity-40 disabled:cursor-not-allowed"
					onClick={() => onViewSessions(user)}
					disabled={actionLoading}
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
