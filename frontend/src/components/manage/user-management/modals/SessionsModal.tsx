"use client";

import { memo } from "react";
import type { ManagedUser, UserSession } from "../types";
import { formatDate } from "../utils";

interface SessionsModalProps {
	user: ManagedUser;
	sessions: UserSession[];
	onRevokeSession: (sessionToken: string) => void;
	onRevokeAllSessions: (user: ManagedUser) => void;
	onClose: () => void;
	actionLoading: boolean;
}

export default memo(function SessionsModal({
	user,
	sessions,
	onRevokeSession,
	onRevokeAllSessions,
	onClose,
	actionLoading,
}: SessionsModalProps) {
	return (
		<>
			<h3 className="text-2xl font-bold text-white mb-3 pr-8">User Sessions</h3>
			<p className="text-white/70 text-[0.95rem] mb-6 leading-relaxed">
				Active sessions for <strong className="text-white">{user.name}</strong>
			</p>
			<div className="max-h-[300px] overflow-y-auto mb-6 pr-2">
				{sessions.length === 0 ? (
					<p className="text-center text-white/40 py-8">No active sessions</p>
				) : (
					<>
						{sessions.map((session) => (
							<div key={session.id} className="flex items-start justify-between gap-4 p-4 bg-black/30 border border-white/10 rounded-[10px] mb-3 last:mb-0">
								<div className="flex flex-col gap-1 flex-1 min-w-0">
									<span className="text-[0.9rem] text-white wrap-break-word">
										{session.userAgent?.substring(0, 50) || "Unknown Device"}...
									</span>
									<span className="text-[0.8rem] text-white/40">IP: {session.ipAddress || "Unknown"}</span>
									<span className="text-[0.8rem] text-white/40">
										Created: {formatDate(session.createdAt)}
									</span>
									{session.impersonatedBy && (
										<span className="text-[0.8rem] text-yellow-500 font-medium">
											⚠️ Impersonated Session
										</span>
									)}
								</div>
								<button
									type="button"
									className="py-2 px-4 bg-linear-to-br from-red-500 to-red-600 text-white border-none rounded-[10px] font-semibold text-[0.85rem] cursor-pointer transition-all duration-[0.25s] hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_4px_15px_rgba(239,68,68,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
									onClick={() => onRevokeSession(session.token)}
									disabled={actionLoading}
								>
									Revoke
								</button>
							</div>
						))}
					</>
				)}
			</div>
			<div className="flex gap-3 justify-end pt-2 border-t border-white/10 mt-2">
				<button
					type="button"
					className="py-3 px-6 bg-transparent text-white/70 border border-white/10 rounded-[10px] font-semibold text-[0.95rem] cursor-pointer transition-all duration-[0.25s] hover:border-white/20 hover:text-white hover:bg-white/10"
					onClick={onClose}
				>
					Close
				</button>
				{sessions.length > 0 && (
					<button
						type="button"
						className="py-3 px-6 bg-linear-to-br from-red-500 to-red-600 text-white border-none rounded-[10px] font-semibold text-[0.95rem] cursor-pointer transition-all duration-[0.25s] hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_4px_15px_rgba(239,68,68,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
						onClick={() => onRevokeAllSessions(user)}
						disabled={actionLoading}
					>
						Revoke All Sessions
					</button>
				)}
			</div>
		</>
	);
});
