/**
 * User Management Types
 * Types for admin user management functionality
 */

export interface ManagedUser {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	createdAt: Date | string;
	updatedAt: Date | string;
	username: string;
	displayUsername: string;
	role: string;
	banned: boolean;
	banReason: string | null;
	banExpires: number | null;
}

export interface UserListResponse {
	users: ManagedUser[];
	total: number;
	limit?: number;
	offset?: number;
}

export interface UserSession {
	id: string;
	token: string;
	userId: string;
	expiresAt: Date | string;
	createdAt: Date | string;
	updatedAt?: Date | string;
	ipAddress?: string | null;
	userAgent?: string | null;
	impersonatedBy?: string | null;
}

export interface UserSessionsResponse {
	sessions: UserSession[];
}

export interface BanUserParams {
	userId: string;
	banReason?: string;
	banExpiresIn?: number; // seconds
}

export interface SetRoleParams {
	userId: string;
	role: string | string[];
}

export interface UpdateUserParams {
	userId: string;
	data: Partial<{
		name: string;
		email: string;
		image: string;
		username: string;
		displayUsername: string;
	}>;
}

export interface CreateUserParams {
	email: string;
	password: string;
	name: string;
	role?: string;
	data?: Record<string, unknown>;
}

export type UserAction = 
	| "view"
	| "edit"
	| "ban"
	| "unban"
	| "impersonate"
	| "setRole"
	| "resetPassword"
	| "viewSessions"
	| "revokeSessions"
	| "delete";

export interface UserActionResult {
	success: boolean;
	message?: string;
	error?: string;
}

export const USER_ROLES = {
	user: { label: "User", color: "bg-gray-500" },
	admin: { label: "Admin", color: "bg-red-500" },
	moderator: { label: "Moderator", color: "bg-blue-500" },
} as const;

export type UserRole = keyof typeof USER_ROLES;
