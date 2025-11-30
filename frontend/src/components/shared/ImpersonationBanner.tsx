"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import "@/styles/impersonation-banner.css";

interface ImpersonationState {
	isImpersonating: boolean;
	originalAdmin: string | null;
	impersonatedUser: string | null;
	loading: boolean;
}

export default function ImpersonationBanner() {
	const [state, setState] = useState<ImpersonationState>({
		isImpersonating: false,
		originalAdmin: null,
		impersonatedUser: null,
		loading: true,
	});
	const [stopping, setStopping] = useState(false);

	useEffect(() => {
		const checkImpersonation = async () => {
			try {
				const session = await authClient.getSession();
				
				if (session?.data?.session?.impersonatedBy) {
					setState({
						isImpersonating: true,
						originalAdmin: session.data.session.impersonatedBy,
						impersonatedUser: session.data.user?.name || "Unknown User",
						loading: false,
					});
				} else {
					setState({
						isImpersonating: false,
						originalAdmin: null,
						impersonatedUser: null,
						loading: false,
					});
				}
			} catch (error) {
				console.error("Failed to check impersonation status:", error);
				setState((prev) => ({ ...prev, loading: false }));
			}
		};

		checkImpersonation();
	}, []);

	const handleStopImpersonating = async () => {
		setStopping(true);
		try {
			const result = await authClient.admin.stopImpersonating();
			
			if (result.error) {
				throw new Error(result.error.message || "Failed to stop impersonating");
			}

			// Redirect back to admin panel
			window.location.href = "/manage/users";
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to stop impersonating");
			setStopping(false);
		}
	};

	if (state.loading || !state.isImpersonating) {
		return null;
	}

	return (
		<div className="impersonation-banner">
			<div className="impersonation-content">
				<div className="impersonation-icon">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
						<circle cx="12" cy="7" r="4" />
						<path d="M12 14l-3-3" />
						<path d="M12 14l3-3" />
					</svg>
				</div>
				<div className="impersonation-info">
					<span className="impersonation-label">Impersonation Mode</span>
					<span className="impersonation-user">
						You are viewing the site as <strong>{state.impersonatedUser}</strong>
					</span>
				</div>
				<button
					type="button"
					className="stop-impersonating-btn"
					onClick={handleStopImpersonating}
					disabled={stopping}
				>
					{stopping ? (
						<>
							<span className="btn-spinner" />
							Stopping...
						</>
					) : (
						<>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
								<polyline points="16 17 21 12 16 7" />
								<line x1="21" y1="12" x2="9" y2="12" />
							</svg>
							Exit Impersonation
						</>
					)}
				</button>
			</div>
		</div>
	);
}
