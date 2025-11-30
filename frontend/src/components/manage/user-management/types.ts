import type { ManagedUser, UserSession } from "@/types/UserManagementTypes";

export interface UserListState {
	users: ManagedUser[];
	total: number;
	loading: boolean;
	error: string | null;
}

export interface ModalState {
	type: "ban" | "role" | "sessions" | "delete" | "create" | "userDetail" | null;
	user: ManagedUser | null;
}

export interface UserStats {
	likedBlogs: number;
	likedReviews: number;
	likedTimeline: number;
	blogsWritten: number;
	reviewsWritten: number;
}

export interface NewUserData {
	email: string;
	password: string;
	name: string;
	role: string;
}

export { type ManagedUser, type UserSession };
