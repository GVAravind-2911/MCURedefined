"use client";

import { memo } from "react";
import type { ManagedUser, UserStats, ModalState } from "../types";
import { formatDate, getRoleBadgeClass } from "../utils";
import {
	UserCog,
	Ban,
	Monitor,
	FileText,
	Star,
	Heart,
	Clock,
	CircleOff,
	Mail,
	Calendar,
	ShieldCheck,
} from "lucide-react";

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
		<div className="flex flex-col gap-5 sm:gap-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 pb-5 sm:pb-6 border-b border-white/10">
				{user.image ? (
					<div className="relative">
						<img
							src={user.image}
							alt={user.name}
							className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#ec1d24]/50 shadow-lg shadow-[#ec1d24]/20"
						/>
						<div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-linear-to-br from-[#ec1d24] to-[#c91820] flex items-center justify-center">
							<ShieldCheck className="w-3.5 h-3.5 text-white" />
						</div>
					</div>
				) : (
					<div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-linear-to-br from-[#ec1d24]/30 to-[#ec1d24] flex items-center justify-center font-bold text-2xl sm:text-3xl text-white border-2 border-[#ec1d24]/50 shadow-lg shadow-[#ec1d24]/20">
						{user.name.charAt(0).toUpperCase()}
						<div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-linear-to-br from-[#ec1d24] to-[#c91820] flex items-center justify-center">
							<ShieldCheck className="w-3.5 h-3.5 text-white" />
						</div>
					</div>
				)}
				<div className="flex-1 text-center sm:text-left min-w-0">
					<div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5 flex-wrap">
						<h3 className="text-xl sm:text-2xl font-bold text-white truncate">
							{user.name}
						</h3>
						<span
							className={`inline-flex items-center py-1 px-2.5 rounded-lg text-xs font-semibold capitalize ${getRoleBadgeClass(user.role)}`}
						>
							{user.role}
						</span>
					</div>
					<p className="text-sm text-white/40 mb-1 truncate">
						@{user.username || user.displayUsername}
					</p>
					<p className="text-sm text-white/60 truncate flex items-center justify-center sm:justify-start gap-1.5">
						<Mail className="w-3.5 h-3.5" />
						{user.email}
					</p>
				</div>
			</div>

			{/* Meta Info */}
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
				<div className="flex flex-col gap-1.5 p-3.5 bg-white/3 rounded-xl border border-white/5">
					<span className="text-[0.65rem] sm:text-xs text-white/40 uppercase tracking-wider font-medium">
						Status
					</span>
					<span
						className={`inline-flex items-center w-fit py-1 px-2.5 rounded-lg text-xs font-semibold ${
							user.banned
								? "bg-red-500/15 text-red-300 border border-red-500/30"
								: "bg-green-500/15 text-green-300 border border-green-500/30"
						}`}
					>
						{user.banned ? "Banned" : "Active"}
					</span>
				</div>
				<div className="flex flex-col gap-1.5 p-3.5 bg-white/3 rounded-xl border border-white/5">
					<span className="text-[0.65rem] sm:text-xs text-white/40 uppercase tracking-wider font-medium">
						Email Verified
					</span>
					<span
						className={`text-sm font-medium ${user.emailVerified ? "text-green-400" : "text-white/40"}`}
					>
						{user.emailVerified ? "Verified ✓" : "Not Verified"}
					</span>
				</div>
				<div className="flex flex-col gap-1.5 p-3.5 bg-white/3 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
					<span className="text-[0.65rem] sm:text-xs text-white/40 uppercase tracking-wider font-medium flex items-center gap-1">
						<Calendar className="w-3 h-3" />
						Created
					</span>
					<span className="text-white text-sm font-medium">
						{formatDate(user.createdAt)}
					</span>
				</div>
				{user.banReason && (
					<div className="flex flex-col gap-1.5 p-3.5 bg-red-500/5 rounded-xl border border-red-500/20 col-span-full">
						<span className="text-xs text-red-300/70 uppercase tracking-wider font-medium">
							Ban Reason
						</span>
						<span className="text-red-200 text-sm">{user.banReason}</span>
					</div>
				)}
			</div>

			{/* Activity Stats */}
			<div className="p-4 sm:p-5 bg-white/2 rounded-xl border border-white/5">
				<h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
					<div className="w-1 h-4 bg-[#ec1d24] rounded-full" />
					Activity Statistics
				</h4>
				{statsLoading ? (
					<div className="flex items-center gap-3 justify-center py-8 text-white/40">
						<div className="w-5 h-5 border-2 border-white/20 border-t-[#ec1d24] rounded-full animate-spin" />
						<span className="text-sm">Loading stats...</span>
					</div>
				) : userStats ? (
					<div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
						{[
							{
								icon: FileText,
								value: userStats.blogsWritten,
								label: "Blogs",
								color: "text-blue-400",
							},
							{
								icon: Star,
								value: userStats.reviewsWritten,
								label: "Reviews",
								color: "text-amber-400",
							},
							{
								icon: Heart,
								value: userStats.likedBlogs,
								label: "Liked Blogs",
								color: "text-pink-400",
							},
							{
								icon: Heart,
								value: userStats.likedReviews,
								label: "Liked Reviews",
								color: "text-rose-400",
							},
							{
								icon: Clock,
								value: userStats.likedTimeline,
								label: "Liked Events",
								color: "text-purple-400",
							},
						].map((stat, index) => (
							<div
								key={index}
								className={`flex flex-col items-center gap-1.5 p-3 bg-black/20 rounded-xl border border-white/5 text-center transition-all duration-300 hover:border-white/10 hover:bg-black/30 ${index === 4 ? "col-span-2 sm:col-span-1" : ""}`}
							>
								<stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
								<span className="text-lg sm:text-xl font-bold text-white">
									{stat.value}
								</span>
								<span className="text-[0.6rem] sm:text-[0.65rem] text-white/40 uppercase tracking-wider">
									{stat.label}
								</span>
							</div>
						))}
					</div>
				) : (
					<p className="text-center text-white/40 py-4 text-sm">
						Unable to load statistics
					</p>
				)}
			</div>

			{/* Actions */}
			<div className="flex gap-2 flex-wrap pt-4 border-t border-white/10">
				<button
					type="button"
					className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm cursor-pointer transition-all duration-300 border border-white/10 bg-white/5 text-white/70 hover:enabled:bg-blue-500/15 hover:enabled:border-blue-500/50 hover:enabled:text-blue-400 hover:enabled:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-none"
					onClick={() => onImpersonate(user)}
					disabled={actionLoading || user.role === "admin"}
				>
					<UserCog className="w-4 h-4" />
					<span>Impersonate</span>
				</button>
				{user.banned ? (
					<button
						type="button"
						className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm cursor-pointer transition-all duration-300 border border-white/10 bg-white/5 text-white/70 hover:enabled:bg-green-500/15 hover:enabled:border-green-500/50 hover:enabled:text-green-400 hover:enabled:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-none"
						onClick={() => onUnbanUser(user)}
						disabled={actionLoading}
					>
						<CircleOff className="w-4 h-4" />
						Unban
					</button>
				) : (
					<button
						type="button"
						className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm cursor-pointer transition-all duration-300 border border-white/10 bg-white/5 text-white/70 hover:enabled:bg-amber-500/15 hover:enabled:border-amber-500/50 hover:enabled:text-amber-400 hover:enabled:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-none"
						onClick={() => setModal({ type: "ban", user })}
						disabled={actionLoading || user.role === "admin"}
					>
						<Ban className="w-4 h-4" />
						Ban
					</button>
				)}
				<button
					type="button"
					className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm cursor-pointer transition-all duration-300 border border-white/10 bg-white/5 text-white/70 hover:enabled:bg-cyan-500/15 hover:enabled:border-cyan-500/50 hover:enabled:text-cyan-400 hover:enabled:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-none"
					onClick={() => onViewSessions(user)}
					disabled={actionLoading}
				>
					<Monitor className="w-4 h-4" />
					Sessions
				</button>
			</div>
		</div>
	);
});
