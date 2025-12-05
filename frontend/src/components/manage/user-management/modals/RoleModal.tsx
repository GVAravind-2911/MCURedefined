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
			<h3 className="text-2xl font-bold text-white mb-3 pr-8">Change User Role</h3>
			<p className="text-white/70 text-[0.95rem] mb-6 leading-relaxed">
				Change the role for <strong className="text-white">{user.name}</strong>
			</p>
			<div className="flex flex-col gap-5 mb-6">
				<label className="flex flex-col gap-2 text-white/70 text-[0.9rem] font-medium">
					Select Role:
					<div className="flex flex-wrap gap-2 mt-2">
						{Object.entries(USER_ROLES).map(([key, value]) => (
							<button
								type="button"
								key={key}
								className={`flex items-center gap-2 py-3 px-4 bg-black/30 border rounded-[10px] text-[0.9rem] cursor-pointer transition-all duration-[0.25s] ${
									selectedRole === key 
										? "border-[#ec1d24] bg-[rgba(236,29,36,0.15)] text-white" 
										: "border-white/10 text-white/70 hover:border-white/20 hover:bg-white/10"
								}`}
								onClick={() => setSelectedRole(key)}
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
					onClick={onSetRole}
					disabled={actionLoading || selectedRole === user.role}
				>
					{actionLoading ? "Updating..." : "Update Role"}
				</button>
			</div>
		</>
	);
});
