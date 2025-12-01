"use client";

import { memo } from "react";
import type { ManagedUser } from "../types";

interface BanUserModalProps {
	user: ManagedUser;
	banReason: string;
	setBanReason: (reason: string) => void;
	banDuration: number | undefined;
	setBanDuration: (duration: number | undefined) => void;
	onBanUser: () => void;
	onClose: () => void;
	actionLoading: boolean;
}

export default memo(function BanUserModal({
	user,
	banReason,
	setBanReason,
	banDuration,
	setBanDuration,
	onBanUser,
	onClose,
	actionLoading,
}: BanUserModalProps) {
	return (
		<>
			<h3 className="modal-title">Ban User</h3>
			<p className="modal-description">
				Are you sure you want to ban <strong>{user.name}</strong>?
				This will prevent them from signing in and revoke all their sessions.
			</p>
			<div className="modal-form">
				<label>
					Ban Reason (optional):
					<input
						type="text"
						value={banReason}
						onChange={(e) => setBanReason(e.target.value)}
						placeholder="Enter reason for ban..."
					/>
				</label>
				<label>
					Ban Duration (hours, leave empty for permanent):
					<input
						type="number"
						value={banDuration || ""}
						onChange={(e) => setBanDuration(e.target.value ? Number(e.target.value) : undefined)}
						placeholder="e.g., 24 for 1 day"
						min="1"
					/>
				</label>
			</div>
			<div className="modal-actions">
				<button
					type="button"
					className="btn-secondary"
					onClick={onClose}
				>
					Cancel
				</button>
				<button
					type="button"
					className="btn-danger"
					onClick={onBanUser}
					disabled={actionLoading}
				>
					{actionLoading ? "Banning..." : "Ban User"}
				</button>
			</div>
		</>
	);
});
