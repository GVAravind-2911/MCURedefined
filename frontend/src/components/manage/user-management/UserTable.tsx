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
	// Reusable action buttons component
	const ActionButtons = ({ user, stopPropagation = false }: { user: ManagedUser; stopPropagation?: boolean }) => (
		<div className="flex gap-2 flex-wrap" onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}>
			<button
				type="button"
				className="flex items-center justify-center w-[34px] h-[34px] rounded-md border border-white/10 bg-transparent text-white/70 cursor-pointer transition-all duration-[0.25s] hover:enabled:-translate-y-0.5 hover:enabled:bg-blue-500/15 hover:enabled:border-blue-500 hover:enabled:text-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
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
					className="flex items-center justify-center w-[34px] h-[34px] rounded-md border border-white/10 bg-transparent text-white/70 cursor-pointer transition-all duration-[0.25s] hover:enabled:-translate-y-0.5 hover:enabled:bg-yellow-500/15 hover:enabled:border-yellow-500 hover:enabled:text-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed"
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
					className="flex items-center justify-center w-[34px] h-[34px] rounded-md border border-white/10 bg-transparent text-white/70 cursor-pointer transition-all duration-[0.25s] hover:enabled:-translate-y-0.5 hover:enabled:bg-yellow-500/15 hover:enabled:border-yellow-500 hover:enabled:text-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed"
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
				className="flex items-center justify-center w-[34px] h-[34px] rounded-md border border-white/10 bg-transparent text-white/70 cursor-pointer transition-all duration-[0.25s] hover:enabled:-translate-y-0.5 hover:enabled:bg-purple-500/15 hover:enabled:border-purple-500 hover:enabled:text-purple-500 disabled:opacity-40 disabled:cursor-not-allowed"
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
				className="flex items-center justify-center w-[34px] h-[34px] rounded-md border border-white/10 bg-transparent text-white/70 cursor-pointer transition-all duration-[0.25s] hover:enabled:-translate-y-0.5 hover:enabled:bg-green-500/15 hover:enabled:border-green-500 hover:enabled:text-green-500 disabled:opacity-40 disabled:cursor-not-allowed"
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
				className="flex items-center justify-center w-[34px] h-[34px] rounded-md border border-white/10 bg-transparent text-white/70 cursor-pointer transition-all duration-[0.25s] hover:enabled:-translate-y-0.5 hover:enabled:bg-red-500/15 hover:enabled:border-red-500 hover:enabled:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
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
	);

	return (
		<div className="bg-[rgba(18,18,18,0.95)] rounded-[14px] border border-white/10 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
			{/* Mobile Card View */}
			<div className="block md:hidden">
				{users.map((user) => (
					<div
						key={user.id}
						className={`p-4 border-b border-white/10 last:border-b-0 cursor-pointer transition-all duration-[0.25s] hover:bg-white/5 ${user.banned ? "bg-red-500/5" : ""}`}
						onClick={() => onViewUserDetail(user)}
					>
						{/* User Header */}
						<div className="flex items-start gap-3 mb-3">
							{user.image ? (
								<img src={user.image} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/10 shrink-0" />
							) : (
								<div className="w-12 h-12 rounded-full bg-linear-to-br from-[#ec1d24]/15 to-[#ec1d24] flex items-center justify-center font-bold text-[1.1rem] text-white border-2 border-white/10 shrink-0">
									{user.name.charAt(0).toUpperCase()}
								</div>
							)}
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 flex-wrap">
									<span className="font-semibold text-white truncate">{user.name}</span>
									<span className={`inline-flex items-center py-1 px-2.5 rounded-[20px] text-[0.7rem] font-semibold capitalize ${getRoleBadgeClass(user.role)}`}>
										{user.role}
									</span>
								</div>
								<span className="text-[0.8rem] text-white/50 block truncate">@{user.username || user.displayUsername}</span>
							</div>
						</div>

						{/* User Info */}
						<div className="space-y-2 mb-3">
							<div className="flex items-center gap-2 text-[0.85rem]">
								<span className="text-white/50">Email:</span>
								<span className="text-white truncate flex-1">{user.email}</span>
								{user.emailVerified ? (
									<span className="text-green-500 text-[0.8rem] font-bold shrink-0" title="Email Verified">✓</span>
								) : (
									<span className="text-white/50 text-[0.8rem] shrink-0" title="Email Not Verified">✗</span>
								)}
							</div>
							<div className="flex items-center gap-2 text-[0.85rem]">
								<span className="text-white/50">Status:</span>
								{user.banned ? (
									<span className="inline-flex items-center py-1 px-2.5 rounded-[20px] text-[0.7rem] font-semibold bg-red-500/15 text-red-300 border border-red-500/30">Banned</span>
								) : (
									<span className="inline-flex items-center py-1 px-2.5 rounded-[20px] text-[0.7rem] font-semibold bg-green-500/15 text-green-300 border border-green-500/30">Active</span>
								)}
							</div>
							<div className="flex items-center gap-2 text-[0.85rem]">
								<span className="text-white/50">Created:</span>
								<span className="text-white">{formatDate(user.createdAt)}</span>
							</div>
						</div>

						{/* Actions */}
						<div onClick={(e) => e.stopPropagation()}>
							<ActionButtons user={user} />
						</div>
					</div>
				))}
			</div>

			{/* Desktop Table View */}
			<div className="hidden md:block overflow-x-auto">
				<table className="w-full border-collapse min-w-[800px]">
					<thead className="bg-black/30">
						<tr>
							<th onClick={() => onSort("name")} className="py-4 px-5 text-left font-semibold text-[0.8rem] uppercase tracking-[0.5px] text-white/50 border-b border-white/10 cursor-pointer select-none transition-all duration-[0.25s] hover:text-white hover:bg-white/5">
								User
								{sortBy === "name" && (
									<span className="text-[#ec1d24] ml-1">{sortDirection === "asc" ? " ↑" : " ↓"}</span>
								)}
							</th>
							<th onClick={() => onSort("email")} className="py-4 px-5 text-left font-semibold text-[0.8rem] uppercase tracking-[0.5px] text-white/50 border-b border-white/10 cursor-pointer select-none transition-all duration-[0.25s] hover:text-white hover:bg-white/5">
								Email
								{sortBy === "email" && (
									<span className="text-[#ec1d24] ml-1">{sortDirection === "asc" ? " ↑" : " ↓"}</span>
								)}
							</th>
							<th onClick={() => onSort("role")} className="py-4 px-5 text-left font-semibold text-[0.8rem] uppercase tracking-[0.5px] text-white/50 border-b border-white/10 cursor-pointer select-none transition-all duration-[0.25s] hover:text-white hover:bg-white/5">
								Role
								{sortBy === "role" && (
									<span className="text-[#ec1d24] ml-1">{sortDirection === "asc" ? " ↑" : " ↓"}</span>
								)}
							</th>
							<th className="py-4 px-5 text-left font-semibold text-[0.8rem] uppercase tracking-[0.5px] text-white/50 border-b border-white/10">Status</th>
							<th onClick={() => onSort("createdAt")} className="py-4 px-5 text-left font-semibold text-[0.8rem] uppercase tracking-[0.5px] text-white/50 border-b border-white/10 cursor-pointer select-none transition-all duration-[0.25s] hover:text-white hover:bg-white/5">
								Created
								{sortBy === "createdAt" && (
									<span className="text-[#ec1d24] ml-1">{sortDirection === "asc" ? " ↑" : " ↓"}</span>
								)}
							</th>
							<th className="py-4 px-5 text-left font-semibold text-[0.8rem] uppercase tracking-[0.5px] text-white/50 border-b border-white/10">Actions</th>
						</tr>
					</thead>
					<tbody>
						{users.map((user) => (
							<tr 
								key={user.id} 
								className={`border-b border-white/10 last:border-b-0 transition-all duration-[0.25s] cursor-pointer hover:bg-white/5 ${user.banned ? "bg-red-500/5 hover:bg-red-500/10" : ""}`}
								onClick={() => onViewUserDetail(user)}
							>
								<td className="py-4 px-5 text-white text-[0.95rem] min-w-[220px]">
									<div className="flex items-center gap-3.5">
										{user.image ? (
											<img src={user.image} alt={user.name} className="w-11 h-11 rounded-full object-cover border-2 border-white/10 transition-all duration-[0.25s] group-hover:border-[#ec1d24]" />
										) : (
											<div className="w-11 h-11 rounded-full bg-linear-to-br from-[#ec1d24]/15 to-[#ec1d24] flex items-center justify-center font-bold text-[1.1rem] text-white border-2 border-white/10">
												{user.name.charAt(0).toUpperCase()}
											</div>
										)}
										<div className="flex flex-col gap-0.5">
											<span className="font-semibold text-white">{user.name}</span>
											<span className="text-[0.85rem] text-white/50">@{user.username || user.displayUsername}</span>
										</div>
									</div>
								</td>
								<td className="py-4 px-5 text-white text-[0.95rem]">
									<div className="flex items-center gap-2">
										<span>{user.email}</span>
										{user.emailVerified ? (
											<span className="text-green-500 text-[0.9rem] font-bold" title="Email Verified">✓</span>
										) : (
											<span className="text-white/50 text-[0.9rem]" title="Email Not Verified">✗</span>
										)}
									</div>
								</td>
								<td className="py-4 px-5 text-white text-[0.95rem]">
									<span className={`inline-flex items-center py-1.5 px-3.5 rounded-[20px] text-[0.8rem] font-semibold capitalize ${getRoleBadgeClass(user.role)}`}>
										{user.role}
									</span>
								</td>
								<td className="py-4 px-5 text-white text-[0.95rem]">
									{user.banned ? (
										<div className="flex flex-col gap-1">
											<span className="inline-flex items-center py-1.5 px-3.5 rounded-[20px] text-[0.8rem] font-semibold bg-red-500/15 text-red-300 border border-red-500/30">Banned</span>
											{user.banReason && (
												<span className="text-[0.75rem] text-white/50 italic" title={user.banReason}>
													{user.banReason.length > 20
														? `${user.banReason.substring(0, 20)}...`
														: user.banReason}
												</span>
											)}
										</div>
									) : (
										<span className="inline-flex items-center py-1.5 px-3.5 rounded-[20px] text-[0.8rem] font-semibold bg-green-500/15 text-green-300 border border-green-500/30">Active</span>
									)}
								</td>
								<td className="py-4 px-5 text-white text-[0.95rem]">{formatDate(user.createdAt)}</td>
								<td className="py-4 px-5 text-white text-[0.95rem]" onClick={(e) => e.stopPropagation()}>
									<ActionButtons user={user} stopPropagation />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{users.length === 0 && (
				<div className="py-16 px-8 text-center">
					<p className="text-white/50 text-base">No users found matching your criteria.</p>
				</div>
			)}
		</div>
	);
}
