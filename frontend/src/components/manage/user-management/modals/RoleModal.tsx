"use client";

import { memo } from "react";
import { USER_ROLES } from "@/types/UserManagementTypes";
import type { ManagedUser } from "../types";

interface RoleModalProps {
	user: ManagedUser;
	selectedRole: string;
	setSelectedRole: (role: string) => void;
	onSetRole: () => void;
	onClose: () => void;
	actionLoading: boolean;
}

export default memo(function RoleModal({
	user,
	selectedRole,
	setSelectedRole,
	onSetRole,
	onClose,
	actionLoading,
}: RoleModalProps) {
	return (
		<>
			<h3 className="modal-title">Change User Role</h3>
			<p className="modal-description">
				Change the role for <strong>{user.name}</strong>
			</p>
			<div className="modal-form">
				<label>
					Select Role:
					<div className="role-options">
						{Object.entries(USER_ROLES).map(([key, value]) => (
							<button
								type="button"
								key={key}
								className={`role-option ${selectedRole === key ? "selected" : ""}`}
								onClick={() => setSelectedRole(key)}
							>
								<span className={`role-dot ${value.color}`} />
								{value.label}
							</button>
						))}
					</div>
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
					className="btn-primary"
					onClick={onSetRole}
					disabled={actionLoading || selectedRole === user.role}
				>
					{actionLoading ? "Updating..." : "Update Role"}
				</button>
			</div>
		</>
	);
});
