"use client";

import type { ManagedUser } from "./types";

interface UserStatsBarProps {
	total: number;
	users: ManagedUser[];
}

export default function UserStatsBar({ total, users }: UserStatsBarProps) {
	return (
		<div className="stats-bar">
			<div className="stat-item">
				<span className="stat-value">{total}</span>
				<span className="stat-label">Total Users</span>
			</div>
			<div className="stat-item">
				<span className="stat-value">
					{users.filter((u) => u.role === "admin").length}
				</span>
				<span className="stat-label">Admins</span>
			</div>
			<div className="stat-item">
				<span className="stat-value">
					{users.filter((u) => u.banned).length}
				</span>
				<span className="stat-label">Banned</span>
			</div>
			<div className="stat-item">
				<span className="stat-value">
					{users.filter((u) => !u.emailVerified).length}
				</span>
				<span className="stat-label">Unverified</span>
			</div>
		</div>
	);
}
