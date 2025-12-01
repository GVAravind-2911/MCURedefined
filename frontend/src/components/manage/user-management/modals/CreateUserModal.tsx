"use client";

import { memo } from "react";
import { USER_ROLES } from "@/types/UserManagementTypes";
import type { NewUserData } from "../types";

interface CreateUserModalProps {
	newUserData: NewUserData;
	setNewUserData: React.Dispatch<React.SetStateAction<NewUserData>>;
	onCreateUser: () => void;
	onClose: () => void;
	actionLoading: boolean;
}

export default memo(function CreateUserModal({
	newUserData,
	setNewUserData,
	onCreateUser,
	onClose,
	actionLoading,
}: CreateUserModalProps) {
	return (
		<>
			<h3 className="modal-title">Create New User</h3>
			<div className="modal-form">
				<label>
					Name *
					<input
						type="text"
						value={newUserData.name}
						onChange={(e) => setNewUserData((prev) => ({ ...prev, name: e.target.value }))}
						placeholder="Enter full name"
						required
					/>
				</label>
				<label>
					Email *
					<input
						type="email"
						value={newUserData.email}
						onChange={(e) => setNewUserData((prev) => ({ ...prev, email: e.target.value }))}
						placeholder="Enter email address"
						required
					/>
				</label>
				<label>
					Password *
					<input
						type="password"
						value={newUserData.password}
						onChange={(e) => setNewUserData((prev) => ({ ...prev, password: e.target.value }))}
						placeholder="Enter password"
						required
					/>
				</label>
				<label>
					Role
					<div className="role-options">
						{Object.entries(USER_ROLES).map(([key, value]) => (
							<button
								type="button"
								key={key}
								className={`role-option ${newUserData.role === key ? "selected" : ""}`}
								onClick={() => setNewUserData((prev) => ({ ...prev, role: key }))}
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
					onClick={onCreateUser}
					disabled={actionLoading}
				>
					{actionLoading ? "Creating..." : "Create User"}
				</button>
			</div>
		</>
	);
});
