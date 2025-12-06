"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useState, useCallback, memo } from "react";
import type { Session } from "better-auth/types";

interface SessionManageTabProps {
	initialSessions: Session[];
	currentSessionId?: string;
	className?: string;
}

const SessionManageTab = memo(function SessionManageTab({
	initialSessions,
	currentSessionId,
	className = "",
}: SessionManageTabProps) {
	const [sessions, setSessions] = useState<Session[]>(() => {
		return initialSessions.map((session) => ({
			...session,
			isCurrent: session.id === currentSessionId,
		}));
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
		null,
	);

	// Refresh sessions from server
	const refreshSessions = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await authClient.listSessions();
			const sessionsData = response?.data || [];

			const updatedSessions = Array.isArray(sessionsData)
				? sessionsData.map((session) => ({
						...session,
						isCurrent: session.id === currentSessionId,
					}))
				: [];

			setSessions(updatedSessions);
		} catch (error) {
			console.error("Error refreshing sessions:", error);
			setError("Failed to refresh sessions");
		} finally {
			setLoading(false);
		}
	}, [currentSessionId]);

	// Handle session revocation with token-based API call
	const handleRevokeSession = useCallback(
		async (sessionId: string) => {
			if (sessionId === currentSessionId) {
				setError("Cannot revoke current session");
				return;
			}

			const sessionToRevoke = sessions.find((s) => s.id === sessionId);
			if (!sessionToRevoke || !sessionToRevoke.token) {
				setError("Session token not found");
				return;
			}

			try {
				setRevokingSessionId(sessionId);
				setError(null);

				// Optimistically remove session from UI
				setSessions((prev) =>
					prev.filter((session) => session.id !== sessionId),
				);

				// Call authClient to revoke session using token
				await authClient.revokeSession({
					token: sessionToRevoke.token,
				});
			} catch (error) {
				console.error("Error revoking session:", error);
				setError("Failed to revoke session");

				// Restore session on error
				const originalSession = initialSessions.find((s) => s.id === sessionId);
				if (originalSession) {
					setSessions((prev) => [
						...prev,
						{
							...originalSession,
							isCurrent: originalSession.id === currentSessionId,
						},
					]);
				}
			} finally {
				setRevokingSessionId(null);
			}
		},
		[currentSessionId, initialSessions, sessions],
	);

	// Get device type from user agent
	const getDeviceType = useCallback((userAgent?: string | null) => {
		if (!userAgent) return "Unknown Device";

		const ua = userAgent.toLowerCase();
		if (
			ua.includes("mobile") ||
			ua.includes("android") ||
			ua.includes("iphone")
		) {
			return "Mobile";
		}
		if (ua.includes("tablet") || ua.includes("ipad")) {
			return "Tablet";
		}
		return "Desktop";
	}, []);

	// Format relative time
	const getRelativeTime = useCallback((dateInput: string | Date) => {
		const date = new Date(dateInput);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffMins < 1) return "Just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;

		return `${diffDays} days ago`;
	}, []);

	return (
		<div className={`mt-4 ${className}`}>
			<div className="mb-6 text-left">
				<h2 className="font-[BentonSansBold] text-xl md:text-2xl text-white m-0 mb-2">
					Active Sessions
				</h2>
				{error && (
					<div className="flex justify-between items-center bg-red-500/10 border border-red-500/25 rounded-lg p-4 text-red-400 text-sm mb-4">
						{error}
						<button
							onClick={() => setError(null)}
							aria-label="Close error"
							className="bg-transparent border-none text-red-400 cursor-pointer text-lg p-0 w-5 h-5 flex items-center justify-center transition-all duration-200 hover:text-red-300 hover:scale-110"
						>
							×
						</button>
					</div>
				)}
			</div>

			{loading ? (
				<div className="flex flex-col gap-3">
					{[1, 2].map((i) => (
						<div
							key={i}
							className="flex justify-between items-center bg-white/5 border border-white/10 rounded-lg p-5"
						>
							<div className="flex flex-col gap-2">
								<div className="h-5 w-32 rounded bg-linear-to-r from-white/5 via-white/10 to-white/5 bg-size-[200%_100%] animate-[shimmer_1.5s_infinite]" />
								<div className="h-3.5 w-20 rounded bg-linear-to-r from-white/5 via-white/10 to-white/5 bg-size-[200%_100%] animate-[shimmer_1.5s_infinite]" />
							</div>
						</div>
					))}
				</div>
			) : sessions.length > 0 ? (
				<div className="flex flex-col gap-3">
					{sessions.map((session) => {
						const deviceType = getDeviceType(session.userAgent);
						const isRevoking = revokingSessionId === session.id;
						const isCurrent = session.id === currentSessionId;

						return (
							<div
								key={session.id}
								className={`
                                    flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0
                                    bg-white/5 border rounded-lg p-4 sm:p-5 transition-all duration-200
                                    hover:bg-white/8 hover:border-white/20
                                    ${isCurrent ? "border-[#ec1d24] bg-[#ec1d24]/8" : "border-white/10"}
                                    ${isRevoking ? "opacity-60 pointer-events-none" : ""}
                                `}
							>
								<div className="flex flex-col gap-1 w-full sm:w-auto">
									<div className="font-[BentonSansBold] text-base text-white flex items-center gap-3 justify-between sm:justify-start w-full">
										{deviceType}
										{isCurrent && (
											<span className="bg-linear-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-[BentonSansRegular] uppercase tracking-wide">
												Current
											</span>
										)}
									</div>
									<div className="font-[BentonSansRegular] text-sm text-white/70">
										{getRelativeTime(session.createdAt)}
									</div>
								</div>

								{!isCurrent && (
									<button
										onClick={() => handleRevokeSession(session.id)}
										className="bg-transparent text-red-400 border border-red-400/40 px-4 py-2 rounded-lg font-[BentonSansRegular] text-sm cursor-pointer transition-all duration-200 whitespace-nowrap self-end sm:self-auto hover:bg-red-500 hover:text-white hover:border-red-500 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
										disabled={isRevoking}
										aria-label={`Revoke ${deviceType} session`}
									>
										{isRevoking ? "Revoking..." : "Revoke"}
									</button>
								)}
							</div>
						);
					})}
				</div>
			) : (
				<div className="text-center py-12 px-4 text-white/70 font-[BentonSansRegular]">
					<p className="m-0 mb-6 text-lg">No active sessions found</p>
					<button
						onClick={refreshSessions}
						disabled={loading}
						className="bg-[#ec1d24] text-white border-none px-6 py-3 rounded-lg font-[BentonSansRegular] text-sm cursor-pointer transition-all duration-200 hover:bg-[#d11920] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
					>
						{loading ? "Loading..." : "Refresh"}
					</button>
				</div>
			)}
		</div>
	);
});

export default SessionManageTab;
