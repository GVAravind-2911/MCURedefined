"use client";

import type { ManagedUser, ModalState } from "./types";
import { formatDate, getRoleBadgeClass } from "./utils";
import {
	UserCog,
	Ban,
	Shield,
	Monitor,
	Trash2,
	CircleOff,
	Users,
} from "lucide-react";

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
	// Reusable action button component
	const ActionButton = ({
		onClick,
		disabled,
		title,
		icon: Icon,
		colorClass = "hover:enabled:bg-white/10 hover:enabled:text-white",
	}: {
		onClick: () => void;
		disabled?: boolean;
		title: string;
		icon: React.ElementType;
		colorClass?: string;
	}) => (
		<button
			type="button"
			className={`flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white/50 transition-all duration-300 ${colorClass} disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:-translate-y-0.5 hover:enabled:shadow-lg`}
			onClick={onClick}
			disabled={disabled}
			title={title}
		>
			<Icon className="w-4 h-4" />
		</button>
	);

	// Action buttons group
	const ActionButtons = ({
		user,
		stopPropagation = false,
	}: { user: ManagedUser; stopPropagation?: boolean }) => (
		<div
			className="flex gap-1.5 flex-wrap"
			onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
		>
			<ActionButton
				onClick={() => onImpersonate(user)}
				disabled={actionLoading || user.role === "admin"}
				title={
					user.role === "admin"
						? "Cannot impersonate admins"
						: "Impersonate User"
				}
				icon={UserCog}
				colorClass="hover:enabled:bg-blue-500/15 hover:enabled:border-blue-500/50 hover:enabled:text-blue-400"
			/>

			{user.banned ? (
				<ActionButton
					onClick={() => onUnbanUser(user)}
					disabled={actionLoading}
					title="Unban User"
					icon={CircleOff}
					colorClass="hover:enabled:bg-green-500/15 hover:enabled:border-green-500/50 hover:enabled:text-green-400"
				/>
			) : (
				<ActionButton
					onClick={() => setModal({ type: "ban", user })}
					disabled={actionLoading || user.role === "admin"}
					title={user.role === "admin" ? "Cannot ban admins" : "Ban User"}
					icon={Ban}
					colorClass="hover:enabled:bg-amber-500/15 hover:enabled:border-amber-500/50 hover:enabled:text-amber-400"
				/>
			)}

			<ActionButton
				onClick={() => {
					setSelectedRole(user.role);
					setModal({ type: "role", user });
				}}
				disabled={actionLoading}
				title="Change Role"
				icon={Shield}
				colorClass="hover:enabled:bg-purple-500/15 hover:enabled:border-purple-500/50 hover:enabled:text-purple-400"
			/>

			<ActionButton
				onClick={() => onViewSessions(user)}
				disabled={actionLoading}
				title="View Sessions"
				icon={Monitor}
				colorClass="hover:enabled:bg-cyan-500/15 hover:enabled:border-cyan-500/50 hover:enabled:text-cyan-400"
			/>

			<ActionButton
				onClick={() => setModal({ type: "delete", user })}
				disabled={actionLoading || user.role === "admin"}
				title={user.role === "admin" ? "Cannot delete admins" : "Delete User"}
				icon={Trash2}
				colorClass="hover:enabled:bg-red-500/15 hover:enabled:border-red-500/50 hover:enabled:text-red-400"
			/>
		</div>
	);

	// Sort indicator
	const SortIndicator = ({ field }: { field: string }) =>
		sortBy === field && (
			<span
				className={`ml-1.5 transition-transform duration-200 ${sortDirection === "desc" ? "rotate-180" : ""}`}
			>
				↑
			</span>
		);

	if (users.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-16 px-8 bg-white/2 backdrop-blur-sm rounded-2xl border border-white/10">
				<div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
					<Users className="w-8 h-8 text-white/30" />
				</div>
				<div className="text-center">
					<p className="text-white/70 text-lg font-medium mb-1">
						No users found
					</p>
					<p className="text-white/40 text-sm">
						Try adjusting your search or filter criteria
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white/2 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
			{/* Mobile Card View */}
			<div className="block lg:hidden divide-y divide-white/10">
				{users.map((user) => (
					<div
						key={user.id}
						className={`p-4 sm:p-5 cursor-pointer transition-all duration-300 hover:bg-white/5 ${user.banned ? "bg-red-500/5" : ""}`}
						onClick={() => onViewUserDetail(user)}
					>
						{/* User Header */}
						<div className="flex items-start gap-3 mb-4">
							{user.image ? (
								<img
									src={user.image}
									alt={user.name}
									className="w-14 h-14 rounded-xl object-cover border-2 border-white/10 shrink-0"
								/>
							) : (
								<div className="w-14 h-14 rounded-xl bg-linear-to-br from-[#ec1d24]/30 to-[#ec1d24] flex items-center justify-center font-bold text-lg text-white border-2 border-white/10 shrink-0">
									{user.name.charAt(0).toUpperCase()}
								</div>
							)}
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 flex-wrap mb-1">
									<span className="font-semibold text-white truncate">
										{user.name}
									</span>
									<span
										className={`inline-flex items-center py-0.5 px-2 rounded-full text-[0.65rem] font-semibold capitalize ${getRoleBadgeClass(user.role)}`}
									>
										{user.role}
									</span>
								</div>
								<p className="text-sm text-white/40 truncate">
									@{user.username || user.displayUsername}
								</p>
							</div>
							{user.banned && (
								<span className="shrink-0 inline-flex items-center py-1 px-2 rounded-lg text-[0.65rem] font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
									Banned
								</span>
							)}
						</div>

						{/* User Info Grid */}
						<div className="grid grid-cols-2 gap-3 mb-4 text-sm">
							<div className="bg-black/20 rounded-lg p-2.5">
								<span className="text-white/40 text-xs block mb-0.5">
									Email
								</span>
								<span className="text-white truncate block">{user.email}</span>
							</div>
							<div className="bg-black/20 rounded-lg p-2.5">
								<span className="text-white/40 text-xs block mb-0.5">
									Status
								</span>
								<span
									className={user.banned ? "text-red-300" : "text-green-300"}
								>
									{user.banned ? "Banned" : "Active"}
								</span>
							</div>
							<div className="bg-black/20 rounded-lg p-2.5">
								<span className="text-white/40 text-xs block mb-0.5">
									Verified
								</span>
								<span
									className={
										user.emailVerified ? "text-green-400" : "text-white/40"
									}
								>
									{user.emailVerified ? "Yes" : "No"}
								</span>
							</div>
							<div className="bg-black/20 rounded-lg p-2.5">
								<span className="text-white/40 text-xs block mb-0.5">
									Created
								</span>
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
			<div className="hidden lg:block overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="bg-black/30 border-b border-white/10">
							{[
								{ key: "name", label: "User", sortable: true },
								{ key: "email", label: "Email", sortable: true },
								{ key: "role", label: "Role", sortable: true },
								{ key: "status", label: "Status", sortable: false },
								{ key: "createdAt", label: "Created", sortable: true },
								{ key: "actions", label: "Actions", sortable: false },
							].map((column) => (
								<th
									key={column.key}
									onClick={
										column.sortable ? () => onSort(column.key) : undefined
									}
									className={`py-4 px-5 text-left font-medium text-xs uppercase tracking-wider text-white/40 ${
										column.sortable
											? "cursor-pointer select-none hover:text-white hover:bg-white/5 transition-all duration-200"
											: ""
									} ${sortBy === column.key ? "text-[#ec1d24]" : ""}`}
								>
									<span className="flex items-center">
										{column.label}
										{column.sortable && <SortIndicator field={column.key} />}
									</span>
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-white/5">
						{users.map((user) => (
							<tr
								key={user.id}
								className={`transition-all duration-200 cursor-pointer hover:bg-white/5 ${user.banned ? "bg-red-500/5 hover:bg-red-500/10" : ""}`}
								onClick={() => onViewUserDetail(user)}
							>
								{/* User */}
								<td className="py-4 px-5">
									<div className="flex items-center gap-3">
										{user.image ? (
											<img
												src={user.image}
												alt={user.name}
												className="w-10 h-10 rounded-lg object-cover border border-white/10"
											/>
										) : (
											<div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#ec1d24]/30 to-[#ec1d24] flex items-center justify-center font-bold text-sm text-white">
												{user.name.charAt(0).toUpperCase()}
											</div>
										)}
										<div className="min-w-0">
											<p className="font-medium text-white truncate">
												{user.name}
											</p>
											<p className="text-sm text-white/40 truncate">
												@{user.username || user.displayUsername}
											</p>
										</div>
									</div>
								</td>

								{/* Email */}
								<td className="py-4 px-5">
									<div className="flex items-center gap-2">
										<span className="text-white/80 truncate max-w-[200px]">
											{user.email}
										</span>
										{user.emailVerified ? (
											<span
												className="shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center"
												title="Verified"
											>
												<svg
													className="w-3 h-3 text-green-400"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
													strokeWidth="3"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M5 13l4 4L19 7"
													/>
												</svg>
											</span>
										) : (
											<span
												className="shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center"
												title="Not Verified"
											>
												<svg
													className="w-3 h-3 text-white/30"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
													strokeWidth="3"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</span>
										)}
									</div>
								</td>

								{/* Role */}
								<td className="py-4 px-5">
									<span
										className={`inline-flex items-center py-1.5 px-3 rounded-lg text-xs font-semibold capitalize ${getRoleBadgeClass(user.role)}`}
									>
										{user.role}
									</span>
								</td>

								{/* Status */}
								<td className="py-4 px-5">
									{user.banned ? (
										<div className="flex flex-col gap-0.5">
											<span className="inline-flex items-center w-fit py-1.5 px-3 rounded-lg text-xs font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
												Banned
											</span>
											{user.banReason && (
												<span
													className="text-xs text-white/40 italic truncate max-w-[120px]"
													title={user.banReason}
												>
													{user.banReason}
												</span>
											)}
										</div>
									) : (
										<span className="inline-flex items-center py-1.5 px-3 rounded-lg text-xs font-semibold bg-green-500/15 text-green-300 border border-green-500/30">
											Active
										</span>
									)}
								</td>

								{/* Created */}
								<td className="py-4 px-5 text-white/60 text-sm">
									{formatDate(user.createdAt)}
								</td>

								{/* Actions */}
								<td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
									<ActionButtons user={user} stopPropagation />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
