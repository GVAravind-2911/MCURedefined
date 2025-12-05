"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";

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
		<>
			{/* Add padding to body when banner is present - handled via CSS-in-JS or a global style */}
			<style jsx global>{`
				body:has(.impersonation-banner) {
					padding-top: 56px;
				}
				body:has(.impersonation-banner) header {
					top: 56px;
				}
			`}</style>
			<div className="impersonation-banner fixed top-0 left-0 right-0 z-9999 bg-linear-to-r from-orange-500 via-amber-500 to-orange-500 bg-size-[200%_100%] animate-[shimmer_3s_linear_infinite] shadow-[0_2px_10px_rgba(247,147,30,0.4)]">
				<div className="flex items-center justify-center gap-4 py-3 px-6 max-w-[1400px] mx-auto flex-wrap md:flex-nowrap">
					<div className="flex items-center justify-center w-9 h-9 bg-black/20 rounded-full text-white shrink-0 md:w-7 md:h-7">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="md:w-4 md:h-4"
						>
							<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
							<circle cx="12" cy="7" r="4" />
							<path d="M12 14l-3-3" />
							<path d="M12 14l3-3" />
						</svg>
					</div>
					<div className="flex flex-col gap-0.5 flex-1 min-w-0 md:flex-auto">
						<span className="text-[0.7rem] font-bold uppercase tracking-wider text-black/60">
							Impersonation Mode
						</span>
						<span className="text-sm text-white font-medium md:text-xs md:truncate">
							You are viewing the site as <strong className="font-bold">{state.impersonatedUser}</strong>
						</span>
					</div>
					<button
						type="button"
						className="flex items-center gap-2 py-2 px-4 bg-black/30 text-white border-2 border-white/40 rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 shrink-0 hover:bg-black/50 hover:border-white hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed md:py-1.5 md:px-3 md:text-xs"
						onClick={handleStopImpersonating}
						disabled={stopping}
					>
						{stopping ? (
							<>
								<span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
		</>
	);
}
