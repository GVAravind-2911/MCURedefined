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
			<h3 className="text-2xl font-bold text-white mb-3 pr-8">Ban User</h3>
			<p className="text-white/70 text-[0.95rem] mb-6 leading-relaxed">
				Are you sure you want to ban{" "}
				<strong className="text-white">{user.name}</strong>? This will prevent
				them from signing in and revoke all their sessions.
			</p>
			<div className="flex flex-col gap-5 mb-6">
				<label className="flex flex-col gap-2 text-white/70 text-[0.9rem] font-medium">
					Ban Reason (optional):
					<input
						type="text"
						value={banReason}
						onChange={(e) => setBanReason(e.target.value)}
						placeholder="Enter reason for ban..."
						className="py-3.5 px-4 bg-black/40 border border-white/10 rounded-[10px] text-white text-[0.95rem] transition-all duration-[0.25s] focus:outline-none focus:border-[#ec1d24] focus:shadow-[0_0_0_3px_rgba(236,29,36,0.15)] placeholder:text-white/30"
					/>
				</label>
				<label className="flex flex-col gap-2 text-white/70 text-[0.9rem] font-medium">
					Ban Duration (hours, leave empty for permanent):
					<input
						type="number"
						value={banDuration || ""}
						onChange={(e) =>
							setBanDuration(
								e.target.value ? Number(e.target.value) : undefined,
							)
						}
						placeholder="e.g., 24 for 1 day"
						min="1"
						className="py-3.5 px-4 bg-black/40 border border-white/10 rounded-[10px] text-white text-[0.95rem] transition-all duration-[0.25s] focus:outline-none focus:border-[#ec1d24] focus:shadow-[0_0_0_3px_rgba(236,29,36,0.15)] placeholder:text-white/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
					/>
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
					className="py-3 px-6 bg-linear-to-br from-red-500 to-red-600 text-white border-none rounded-[10px] font-semibold text-[0.95rem] cursor-pointer transition-all duration-[0.25s] hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_4px_15px_rgba(239,68,68,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
					onClick={onBanUser}
					disabled={actionLoading}
				>
					{actionLoading ? "Banning..." : "Ban User"}
				</button>
			</div>
		</>
	);
});
