"use client";

import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth/auth-client";
import "@/styles/user-management.css";
import "@/styles/bloghero.css";

import type { UserListState, ModalState, UserStats, NewUserData, ManagedUser, UserSession } from "./types";
import UserToolbar from "./UserToolbar";
import UserStatsBar from "./UserStatsBar";
import UserTable from "./UserTable";
import UserPagination from "./UserPagination";
import {
	ModalWrapper,
	UserDetailModal,
	BanUserModal,
	RoleModal,
	SessionsModal,
	DeleteUserModal,
	CreateUserModal,
} from "./modals";

export default function UserManagement() {
	const [userState, setUserState] = useState<UserListState>({
		users: [],
		total: 0,
		loading: true,
		error: null,
	});
	const [searchValue, setSearchValue] = useState("");
	const [searchField, setSearchField] = useState<"email" | "name">("email");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(10);
	const [sortBy, setSortBy] = useState<string>("createdAt");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
	const [filterRole, setFilterRole] = useState<string>("");
	const [filterBanned, setFilterBanned] = useState<string>("");
	const [modal, setModal] = useState<ModalState>({ type: null, user: null });
	const [actionLoading, setActionLoading] = useState(false);
	const [userSessions, setUserSessions] = useState<UserSession[]>([]);
	const [userStats, setUserStats] = useState<UserStats | null>(null);
	const [statsLoading, setStatsLoading] = useState(false);

	// Form states for modals
	const [banReason, setBanReason] = useState("");
	const [banDuration, setBanDuration] = useState<number | undefined>(undefined);
	const [selectedRole, setSelectedRole] = useState("");

	// Create user form
	const [newUserData, setNewUserData] = useState<NewUserData>({
		email: "",
		password: "",
		name: "",
		role: "user",
	});

	const fetchUsers = useCallback(async () => {
		setUserState((prev) => ({ ...prev, loading: true, error: null }));

		try {
			const query: Record<string, unknown> = {
				limit: pageSize,
				offset: (currentPage - 1) * pageSize,
				sortBy,
				sortDirection,
			};

			if (searchValue) {
				query.searchValue = searchValue;
				query.searchField = searchField;
				query.searchOperator = "contains";
			}

			if (filterRole) {
				query.filterField = "role";
				query.filterValue = filterRole;
				query.filterOperator = "eq";
			}

			if (filterBanned) {
				query.filterField = "banned";
				query.filterValue = filterBanned === "true";
				query.filterOperator = "eq";
			}

			const response = await authClient.admin.listUsers({ query });

			if (response.error) {
				throw new Error(response.error.message || "Failed to fetch users");
			}

			setUserState({
				users: (response.data?.users as ManagedUser[]) || [],
				total: response.data?.total || 0,
				loading: false,
				error: null,
			});
		} catch (error) {
			setUserState((prev) => ({
				...prev,
				loading: false,
				error: error instanceof Error ? error.message : "Failed to fetch users",
			}));
		}
	}, [currentPage, pageSize, searchValue, searchField, sortBy, sortDirection, filterRole, filterBanned]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setCurrentPage(1);
		fetchUsers();
	};

	const handleSort = (field: string) => {
		if (sortBy === field) {
			setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setSortBy(field);
			setSortDirection("asc");
		}
	};

	const handleViewUserDetail = async (user: ManagedUser) => {
		setModal({ type: "userDetail", user });
		setStatsLoading(true);
		setUserStats(null);

		try {
			const response = await fetch(`/api/user/${user.id}/stats`);
			if (response.ok) {
				const data = await response.json();
				setUserStats(data);
			} else {
				setUserStats({
					likedBlogs: 0,
					likedReviews: 0,
					likedTimeline: 0,
					blogsWritten: 0,
					reviewsWritten: 0,
				});
			}
		} catch (error) {
			console.error("Failed to fetch user stats:", error);
			setUserStats({
				likedBlogs: 0,
				likedReviews: 0,
				likedTimeline: 0,
				blogsWritten: 0,
				reviewsWritten: 0,
			});
		} finally {
			setStatsLoading(false);
		}
	};

	const handleImpersonate = async (user: ManagedUser) => {
		if (!confirm(`Are you sure you want to impersonate ${user.name}?`)) return;

		setActionLoading(true);
		try {
			const result = await authClient.admin.impersonateUser({ userId: user.id });
			if (result.error) {
				throw new Error(result.error.message || "Failed to impersonate user");
			}
			window.location.href = "/";
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to impersonate user");
		} finally {
			setActionLoading(false);
		}
	};

	const handleBanUser = async () => {
		if (!modal.user) return;

		setActionLoading(true);
		try {
			const result = await authClient.admin.banUser({
				userId: modal.user.id,
				banReason: banReason || undefined,
				banExpiresIn: banDuration ? banDuration * 3600 : undefined,
			});

			if (result.error) {
				throw new Error(result.error.message || "Failed to ban user");
			}

			closeModal();
			setBanReason("");
			setBanDuration(undefined);
			fetchUsers();
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to ban user");
		} finally {
			setActionLoading(false);
		}
	};

	const handleUnbanUser = async (user: ManagedUser) => {
		if (!confirm(`Are you sure you want to unban ${user.name}?`)) return;

		setActionLoading(true);
		try {
			const result = await authClient.admin.unbanUser({ userId: user.id });
			if (result.error) {
				throw new Error(result.error.message || "Failed to unban user");
			}
			fetchUsers();
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to unban user");
		} finally {
			setActionLoading(false);
		}
	};

	const handleSetRole = async () => {
		if (!modal.user || !selectedRole) return;

		setActionLoading(true);
		try {
			const result = await authClient.admin.setRole({
				userId: modal.user.id,
				role: selectedRole,
			});

			if (result.error) {
				throw new Error(result.error.message || "Failed to set role");
			}

			closeModal();
			setSelectedRole("");
			fetchUsers();
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to set role");
		} finally {
			setActionLoading(false);
		}
	};

	const handleViewSessions = async (user: ManagedUser) => {
		setActionLoading(true);
		try {
			const result = await authClient.admin.listUserSessions({ userId: user.id });
			if (result.error) {
				throw new Error(result.error.message || "Failed to fetch sessions");
			}
			setUserSessions((result.data?.sessions as UserSession[]) || []);
			setModal({ type: "sessions", user });
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to fetch sessions");
		} finally {
			setActionLoading(false);
		}
	};

	const handleRevokeSession = async (sessionToken: string) => {
		if (!confirm("Are you sure you want to revoke this session?")) return;

		setActionLoading(true);
		try {
			const result = await authClient.admin.revokeUserSession({ sessionToken });
			if (result.error) {
				throw new Error(result.error.message || "Failed to revoke session");
			}
			if (modal.user) {
				handleViewSessions(modal.user);
			}
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to revoke session");
		} finally {
			setActionLoading(false);
		}
	};

	const handleRevokeAllSessions = async (user: ManagedUser) => {
		if (!confirm(`Are you sure you want to revoke all sessions for ${user.name}?`)) return;

		setActionLoading(true);
		try {
			const result = await authClient.admin.revokeUserSessions({ userId: user.id });
			if (result.error) {
				throw new Error(result.error.message || "Failed to revoke sessions");
			}
			if (modal.type === "sessions") {
				handleViewSessions(user);
			}
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to revoke sessions");
		} finally {
			setActionLoading(false);
		}
	};

	const handleDeleteUser = async () => {
		if (!modal.user) return;

		setActionLoading(true);
		try {
			const result = await authClient.admin.removeUser({ userId: modal.user.id });
			if (result.error) {
				throw new Error(result.error.message || "Failed to delete user");
			}
			closeModal();
			fetchUsers();
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to delete user");
		} finally {
			setActionLoading(false);
		}
	};

	const handleCreateUser = async () => {
		if (!newUserData.email || !newUserData.password || !newUserData.name) {
			alert("Please fill in all required fields");
			return;
		}

		setActionLoading(true);
		try {
			const result = await authClient.admin.createUser({
				email: newUserData.email,
				password: newUserData.password,
				name: newUserData.name,
				role: newUserData.role,
			});

			if (result.error) {
				throw new Error(result.error.message || "Failed to create user");
			}

			closeModal();
			setNewUserData({ email: "", password: "", name: "", role: "user" });
			fetchUsers();
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to create user");
		} finally {
			setActionLoading(false);
		}
	};

	const closeModal = () => {
		setModal({ type: null, user: null });
	};

	const totalPages = Math.ceil(userState.total / pageSize);

	return (
		<div className="user-management-container">
			<UserToolbar
				searchValue={searchValue}
				setSearchValue={setSearchValue}
				searchField={searchField}
				setSearchField={setSearchField}
				filterRole={filterRole}
				setFilterRole={setFilterRole}
				filterBanned={filterBanned}
				setFilterBanned={setFilterBanned}
				onSearch={handleSearch}
				onCreateUser={() => setModal({ type: "create", user: null })}
				setCurrentPage={setCurrentPage}
			/>

			<UserStatsBar total={userState.total} users={userState.users} />

			{/* Error State */}
			{userState.error && (
				<div className="error-message">
					<p>{userState.error}</p>
					<button type="button" onClick={fetchUsers} className="btn-secondary">
						Retry
					</button>
				</div>
			)}

			{/* Loading State */}
			{userState.loading && (
				<div className="loading-state">
					<div className="loading-spinner" />
					<p>Loading users...</p>
				</div>
			)}

			{/* User Table */}
			{!userState.loading && !userState.error && (
				<UserTable
					users={userState.users}
					sortBy={sortBy}
					sortDirection={sortDirection}
					onSort={handleSort}
					onViewUserDetail={handleViewUserDetail}
					onImpersonate={handleImpersonate}
					onUnbanUser={handleUnbanUser}
					onViewSessions={handleViewSessions}
					setModal={setModal}
					setSelectedRole={setSelectedRole}
					actionLoading={actionLoading}
				/>
			)}

			<UserPagination
				currentPage={currentPage}
				totalPages={totalPages}
				setCurrentPage={setCurrentPage}
			/>

			{/* Modals */}
			{modal.type && (
				<ModalWrapper onClose={closeModal}>
					{modal.type === "userDetail" && modal.user && (
						<UserDetailModal
							user={modal.user}
							userStats={userStats}
							statsLoading={statsLoading}
							actionLoading={actionLoading}
							onImpersonate={handleImpersonate}
							onUnbanUser={handleUnbanUser}
							onViewSessions={handleViewSessions}
							setModal={setModal}
						/>
					)}

					{modal.type === "ban" && modal.user && (
						<BanUserModal
							user={modal.user}
							banReason={banReason}
							setBanReason={setBanReason}
							banDuration={banDuration}
							setBanDuration={setBanDuration}
							onBanUser={handleBanUser}
							onClose={closeModal}
							actionLoading={actionLoading}
						/>
					)}

					{modal.type === "role" && modal.user && (
						<RoleModal
							user={modal.user}
							selectedRole={selectedRole}
							setSelectedRole={setSelectedRole}
							onSetRole={handleSetRole}
							onClose={closeModal}
							actionLoading={actionLoading}
						/>
					)}

					{modal.type === "sessions" && modal.user && (
						<SessionsModal
							user={modal.user}
							sessions={userSessions}
							onRevokeSession={handleRevokeSession}
							onRevokeAllSessions={handleRevokeAllSessions}
							onClose={closeModal}
							actionLoading={actionLoading}
						/>
					)}

					{modal.type === "delete" && modal.user && (
						<DeleteUserModal
							user={modal.user}
							onDeleteUser={handleDeleteUser}
							onClose={closeModal}
							actionLoading={actionLoading}
						/>
					)}

					{modal.type === "create" && (
						<CreateUserModal
							newUserData={newUserData}
							setNewUserData={setNewUserData}
							onCreateUser={handleCreateUser}
							onClose={() => {
								closeModal();
								setNewUserData({ email: "", password: "", name: "", role: "user" });
							}}
							actionLoading={actionLoading}
						/>
					)}
				</ModalWrapper>
			)}
		</div>
	);
}
