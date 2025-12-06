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
			<h3 className="text-2xl font-bold text-white mb-3 pr-8">Delete User</h3>
			<p className="text-red-300 text-[0.95rem] mb-6 leading-relaxed bg-red-500/10 p-4 rounded-[10px] border border-red-500/30">
				⚠️ This action cannot be undone! Are you sure you want to permanently
				delete <strong className="text-white">{user.name}</strong>?
			</p>
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
					className="py-3 px-6 bg-linear-to-br from-red-500 to-red-600 text-white border-none rounded-[10px] font-semibold text-[0.95rem] cursor-pointer transition-all duration-[0.25s] hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_4px_15px_rgba(239,68,68,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
					onClick={onDeleteUser}
					disabled={actionLoading}
				>
					{actionLoading ? "Deleting..." : "Delete User"}
				</button>
			</div>
		</>
	);
});
