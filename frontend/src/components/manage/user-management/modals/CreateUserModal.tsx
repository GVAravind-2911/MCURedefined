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
			<h3 className="text-2xl font-bold text-white mb-3 pr-8">Create New User</h3>
			<div className="flex flex-col gap-5 mb-6">
				<label className="flex flex-col gap-2 text-white/70 text-[0.9rem] font-medium">
					Name *
					<input
						type="text"
						value={newUserData.name}
						onChange={(e) => setNewUserData((prev) => ({ ...prev, name: e.target.value }))}
						placeholder="Enter full name"
						required
						className="py-3.5 px-4 bg-black/40 border border-white/10 rounded-[10px] text-white text-[0.95rem] transition-all duration-[0.25s] focus:outline-none focus:border-[#ec1d24] focus:shadow-[0_0_0_3px_rgba(236,29,36,0.15)] placeholder:text-white/30"
					/>
				</label>
				<label className="flex flex-col gap-2 text-white/70 text-[0.9rem] font-medium">
					Email *
					<input
						type="email"
						value={newUserData.email}
						onChange={(e) => setNewUserData((prev) => ({ ...prev, email: e.target.value }))}
						placeholder="Enter email address"
						required
						className="py-3.5 px-4 bg-black/40 border border-white/10 rounded-[10px] text-white text-[0.95rem] transition-all duration-[0.25s] focus:outline-none focus:border-[#ec1d24] focus:shadow-[0_0_0_3px_rgba(236,29,36,0.15)] placeholder:text-white/30"
					/>
				</label>
				<label className="flex flex-col gap-2 text-white/70 text-[0.9rem] font-medium">
					Password *
					<input
						type="password"
						value={newUserData.password}
						onChange={(e) => setNewUserData((prev) => ({ ...prev, password: e.target.value }))}
						placeholder="Enter password"
						required
						className="py-3.5 px-4 bg-black/40 border border-white/10 rounded-[10px] text-white text-[0.95rem] transition-all duration-[0.25s] focus:outline-none focus:border-[#ec1d24] focus:shadow-[0_0_0_3px_rgba(236,29,36,0.15)] placeholder:text-white/30"
					/>
				</label>
				<label className="flex flex-col gap-2 text-white/70 text-[0.9rem] font-medium">
					Role
					<div className="flex flex-wrap gap-2 mt-2">
						{Object.entries(USER_ROLES).map(([key, value]) => (
							<button
								type="button"
								key={key}
								className={`flex items-center gap-2 py-3 px-4 bg-black/30 border rounded-[10px] text-[0.9rem] cursor-pointer transition-all duration-[0.25s] ${
									newUserData.role === key 
										? "border-[#ec1d24] bg-[rgba(236,29,36,0.15)] text-white" 
										: "border-white/10 text-white/70 hover:border-white/20 hover:bg-white/10"
								}`}
								onClick={() => setNewUserData((prev) => ({ ...prev, role: key }))}
							>
								<span className={`w-2.5 h-2.5 rounded-full ${value.color}`} />
								{value.label}
							</button>
						))}
					</div>
				</label>
			</div>
			<div className="flex gap-3 justify-end pt-2 border-t border-white/10 mt-2">
				<button
					type="button"
					className="py-3 px-6 bg-transparent text-white/70 border border-white/10 rounded-[10px] font-semibold text-[0.95rem] cursor-pointer transition-all duration-[0.25s] hover:border-white/20 hover:text-white hover:bg-white/10"
					onClick={onClose}
				>
					Cancel
				</button>
				<button
					type="button"
					className="py-3 px-6 bg-linear-to-br from-[#ec1d24] to-[#b91c1c] text-white border-none rounded-[10px] font-semibold text-[0.95rem] cursor-pointer transition-all duration-[0.25s] hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_4px_15px_rgba(236,29,36,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
					onClick={onCreateUser}
					disabled={actionLoading}
				>
					{actionLoading ? "Creating..." : "Create User"}
				</button>
			</div>
		</>
	);
});
