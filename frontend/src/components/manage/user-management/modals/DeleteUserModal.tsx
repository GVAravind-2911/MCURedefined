"use client";

import { memo } from "react";
import type { ManagedUser } from "../types";

interface DeleteUserModalProps {
	user: ManagedUser;
	onDeleteUser: () => void;
	onClose: () => void;
	actionLoading: boolean;
}

export default memo(function DeleteUserModal({
	user,
	onDeleteUser,
	onClose,
	actionLoading,
}: DeleteUserModalProps) {
	return (
		<>
			<h3 className="modal-title">Delete User</h3>
			<p className="modal-description danger">
				⚠️ This action cannot be undone! Are you sure you want to permanently delete{" "}
				<strong>{user.name}</strong>?
			</p>
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
					onClick={onDeleteUser}
					disabled={actionLoading}
				>
					{actionLoading ? "Deleting..." : "Delete User"}
				</button>
			</div>
		</>
	);
});
