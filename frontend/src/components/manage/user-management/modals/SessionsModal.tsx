"use client";

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

export default function SessionsModal({
	user,
	sessions,
	onRevokeSession,
	onRevokeAllSessions,
	onClose,
	actionLoading,
}: SessionsModalProps) {
	return (
		<>
			<h3 className="modal-title">User Sessions</h3>
			<p className="modal-description">
				Active sessions for <strong>{user.name}</strong>
			</p>
			<div className="sessions-list">
				{sessions.length === 0 ? (
					<p className="no-sessions">No active sessions</p>
				) : (
					<>
						{sessions.map((session) => (
							<div key={session.id} className="session-item">
								<div className="session-info">
									<span className="session-ua">
										{session.userAgent?.substring(0, 50) || "Unknown Device"}...
									</span>
									<span className="session-ip">IP: {session.ipAddress || "Unknown"}</span>
									<span className="session-date">
										Created: {formatDate(session.createdAt)}
									</span>
									{session.impersonatedBy && (
										<span className="session-impersonated">
											⚠️ Impersonated Session
										</span>
									)}
								</div>
								<button
									type="button"
									className="btn-danger btn-small"
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
			<div className="modal-actions">
				<button
					type="button"
					className="btn-secondary"
					onClick={onClose}
				>
					Close
				</button>
				{sessions.length > 0 && (
					<button
						type="button"
						className="btn-danger"
						onClick={() => onRevokeAllSessions(user)}
						disabled={actionLoading}
					>
						Revoke All Sessions
					</button>
				)}
			</div>
		</>
	);
}
