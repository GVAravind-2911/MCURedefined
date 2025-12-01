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
		<div className="user-detail-modal">
			<div className="user-detail-header">
				{user.image ? (
					<img src={user.image} alt={user.name} className="detail-avatar" />
				) : (
					<div className="detail-avatar-placeholder">
						{user.name.charAt(0).toUpperCase()}
					</div>
				)}
				<div className="detail-info">
					<h3>{user.name}</h3>
					<p className="detail-username">@{user.username || user.displayUsername}</p>
					<p className="detail-email">{user.email}</p>
				</div>
				<span className={`role-badge large ${getRoleBadgeClass(user.role)}`}>
					{user.role}
				</span>
			</div>

			<div className="user-detail-meta">
				<div className="meta-item">
					<span className="meta-label">Status</span>
					<span className={`status-badge ${user.banned ? "banned" : "active"}`}>
						{user.banned ? "Banned" : "Active"}
					</span>
				</div>
				<div className="meta-item">
					<span className="meta-label">Email Verified</span>
					<span className={user.emailVerified ? "verified" : "unverified"}>
						{user.emailVerified ? "Yes" : "No"}
					</span>
				</div>
				<div className="meta-item">
					<span className="meta-label">Created</span>
					<span>{formatDate(user.createdAt)}</span>
				</div>
				{user.banReason && (
					<div className="meta-item full-width">
						<span className="meta-label">Ban Reason</span>
						<span>{user.banReason}</span>
					</div>
				)}
			</div>

			<div className="user-detail-stats">
				<h4>Activity Statistics</h4>
				{statsLoading ? (
					<div className="stats-loading">
						<div className="loading-spinner small" />
						<span>Loading stats...</span>
					</div>
				) : userStats ? (
					<div className="stats-grid">
						<div className="stat-card">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
								<polyline points="14 2 14 8 20 8" />
								<line x1="16" y1="13" x2="8" y2="13" />
								<line x1="16" y1="17" x2="8" y2="17" />
								<polyline points="10 9 9 9 8 9" />
							</svg>
							<span className="stat-number">{userStats.blogsWritten}</span>
							<span className="stat-name">Blogs Written</span>
						</div>
						<div className="stat-card">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
							</svg>
							<span className="stat-number">{userStats.reviewsWritten}</span>
							<span className="stat-name">Reviews Written</span>
						</div>
						<div className="stat-card">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
							</svg>
							<span className="stat-number">{userStats.likedBlogs}</span>
							<span className="stat-name">Liked Blogs</span>
						</div>
						<div className="stat-card">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
							</svg>
							<span className="stat-number">{userStats.likedReviews}</span>
							<span className="stat-name">Liked Reviews</span>
						</div>
						<div className="stat-card">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<circle cx="12" cy="12" r="10" />
								<polyline points="12 6 12 12 16 14" />
							</svg>
							<span className="stat-number">{userStats.likedTimeline}</span>
							<span className="stat-name">Liked Timeline</span>
						</div>
					</div>
				) : (
					<p className="no-stats">Unable to load statistics</p>
				)}
			</div>

			<div className="user-detail-actions">
				<button
					type="button"
					className="action-btn-large impersonate"
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
						className="action-btn-large unban"
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
						className="action-btn-large ban"
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
					className="action-btn-large sessions"
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
}
