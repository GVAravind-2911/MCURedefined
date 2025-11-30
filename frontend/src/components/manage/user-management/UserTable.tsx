"use client";

import type { ManagedUser, ModalState } from "./types";
import { formatDate, getRoleBadgeClass } from "./utils";

interface UserTableProps {
	users: ManagedUser[];
	sortBy: string;
	sortDirection: "asc" | "desc";
	onSort: (field: string) => void;
	onViewUserDetail: (user: ManagedUser) => void;
	onImpersonate: (user: ManagedUser) => void;
	onUnbanUser: (user: ManagedUser) => void;
	onViewSessions: (user: ManagedUser) => void;
	setModal: (modal: ModalState) => void;
	setSelectedRole: (role: string) => void;
	actionLoading: boolean;
}

export default function UserTable({
	users,
	sortBy,
	sortDirection,
	onSort,
	onViewUserDetail,
	onImpersonate,
	onUnbanUser,
	onViewSessions,
	setModal,
	setSelectedRole,
	actionLoading,
}: UserTableProps) {
	return (
		<div className="user-table-container">
			<table className="user-table">
				<thead>
					<tr>
						<th onClick={() => onSort("name")} className="sortable">
							User
							{sortBy === "name" && (
								<span className="sort-indicator">{sortDirection === "asc" ? " ↑" : " ↓"}</span>
							)}
						</th>
						<th onClick={() => onSort("email")} className="sortable">
							Email
							{sortBy === "email" && (
								<span className="sort-indicator">{sortDirection === "asc" ? " ↑" : " ↓"}</span>
							)}
						</th>
						<th onClick={() => onSort("role")} className="sortable">
							Role
							{sortBy === "role" && (
								<span className="sort-indicator">{sortDirection === "asc" ? " ↑" : " ↓"}</span>
							)}
						</th>
						<th>Status</th>
						<th onClick={() => onSort("createdAt")} className="sortable">
							Created
							{sortBy === "createdAt" && (
								<span className="sort-indicator">{sortDirection === "asc" ? " ↑" : " ↓"}</span>
							)}
						</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => (
						<tr 
							key={user.id} 
							className={`${user.banned ? "banned-row" : ""} clickable-row`}
							onClick={() => onViewUserDetail(user)}
						>
							<td className="user-cell">
								<div className="user-info">
									{user.image ? (
										<img src={user.image} alt={user.name} className="user-avatar" />
									) : (
										<div className="user-avatar-placeholder">
											{user.name.charAt(0).toUpperCase()}
										</div>
									)}
									<div className="user-details">
										<span className="user-name">{user.name}</span>
										<span className="user-username">@{user.username || user.displayUsername}</span>
									</div>
								</div>
							</td>
							<td>
								<div className="email-cell">
									<span>{user.email}</span>
									{user.emailVerified ? (
										<span className="verified-badge" title="Email Verified">✓</span>
									) : (
										<span className="unverified-badge" title="Email Not Verified">✗</span>
									)}
								</div>
							</td>
							<td>
								<span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
									{user.role}
								</span>
							</td>
							<td>
								{user.banned ? (
									<div className="status-banned">
										<span className="status-badge banned">Banned</span>
										{user.banReason && (
											<span className="ban-reason" title={user.banReason}>
												{user.banReason.length > 20
													? `${user.banReason.substring(0, 20)}...`
													: user.banReason}
											</span>
										)}
									</div>
								) : (
									<span className="status-badge active">Active</span>
								)}
							</td>
							<td>{formatDate(user.createdAt)}</td>
							<td onClick={(e) => e.stopPropagation()}>
								<div className="action-buttons">
									<button
										type="button"
										className="action-btn impersonate"
										onClick={() => onImpersonate(user)}
										disabled={actionLoading || user.role === "admin"}
										title={user.role === "admin" ? "Cannot impersonate admins" : "Impersonate User"}
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
											<circle cx="12" cy="7" r="4" />
										</svg>
									</button>
									
									{user.banned ? (
										<button
											type="button"
											className="action-btn unban"
											onClick={() => onUnbanUser(user)}
											disabled={actionLoading}
											title="Unban User"
										>
											<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
												<path d="M12 6v6l4 2" />
											</svg>
										</button>
									) : (
										<button
											type="button"
											className="action-btn ban"
											onClick={() => setModal({ type: "ban", user })}
											disabled={actionLoading || user.role === "admin"}
											title={user.role === "admin" ? "Cannot ban admins" : "Ban User"}
										>
											<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<circle cx="12" cy="12" r="10" />
												<line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
											</svg>
										</button>
									)}

									<button
										type="button"
										className="action-btn role"
										onClick={() => {
											setSelectedRole(user.role);
											setModal({ type: "role", user });
										}}
										disabled={actionLoading}
										title="Change Role"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<path d="M12 2L2 7l10 5 10-5-10-5z" />
											<path d="M2 17l10 5 10-5" />
											<path d="M2 12l10 5 10-5" />
										</svg>
									</button>

									<button
										type="button"
										className="action-btn sessions"
										onClick={() => onViewSessions(user)}
										disabled={actionLoading}
										title="View Sessions"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
											<line x1="8" y1="21" x2="16" y2="21" />
											<line x1="12" y1="17" x2="12" y2="21" />
										</svg>
									</button>

									<button
										type="button"
										className="action-btn delete"
										onClick={() => setModal({ type: "delete", user })}
										disabled={actionLoading || user.role === "admin"}
										title={user.role === "admin" ? "Cannot delete admins" : "Delete User"}
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<polyline points="3 6 5 6 21 6" />
											<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
										</svg>
									</button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{users.length === 0 && (
				<div className="empty-state">
					<p>No users found matching your criteria.</p>
				</div>
			)}
		</div>
	);
}
