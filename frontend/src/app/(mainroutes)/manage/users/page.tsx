import type React from "react";
import UserManagement from "@/components/manage/UserManagement";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ManageUsersPage(): Promise<React.ReactElement> {
	return (
		<div className="manage-users-page">
			<div className="blog-hero">
				<div className="hero-overlay" />
				<div className="hero-content">
					<h1 className="hero-title">User Management</h1>
					<p className="hero-description">
						Manage users, roles, and permissions for your application.
					</p>
				</div>
			</div>
			<UserManagement />
		</div>
	);
}
