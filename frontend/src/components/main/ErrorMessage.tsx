"use client";

import type React from "react";

interface ErrorMessageProps {
	title?: string;
	reasons?: string[];
	onReload?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
	title = "Connection Error",
	reasons = [
		"Temporary network disruption",
		"Server maintenance",
		"Connection timeout",
	],
	onReload = () => window.location.reload(),
}) => {
	return (
		<div className="flex justify-center items-center min-h-[70vh] w-full px-4 py-12">
			<div className="bg-linear-to-br from-[rgba(40,40,40,0.4)] to-[rgba(25,25,25,0.6)] rounded-xl p-8 md:p-12 w-full max-w-[500px] text-center relative overflow-hidden animate-[fadeIn_0.4s_ease-out] border border-white/10 backdrop-blur-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
				{/* Top accent line */}
				<div className="absolute top-0 left-0 right-0 h-[3px] bg-linear-to-r from-transparent via-[#ec1d24] to-transparent" />

				{/* Error Icon */}
				<div className="flex justify-center mb-8">
					<div className="w-20 h-20 rounded-full bg-[rgba(236,29,36,0.1)] border border-[#ec1d24]/20 flex items-center justify-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="40"
							height="40"
							className="text-[#ec1d24]"
						>
							<title>Error</title>
							<path
								d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
								fill="currentColor"
							/>
						</svg>
					</div>
				</div>

				{/* Title */}
				<h2 className="font-[BentonSansBold] text-2xl md:text-3xl text-white mb-3">
					{title}
				</h2>

				{/* Subtitle */}
				<p className="text-white/50 font-[BentonSansRegular] text-sm mb-8">
					Something went wrong. Here are some possible reasons:
				</p>

				{/* Reasons List */}
				<div className="bg-[rgba(0,0,0,0.3)] rounded-lg p-5 md:p-6 text-left border border-white/5">
					<ul className="space-y-4">
						{reasons.map((reason, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							<li
								key={index}
								className="font-[BentonSansRegular] text-sm md:text-[15px] text-white/80 flex items-center gap-3"
							>
								<span className="w-1.5 h-1.5 rounded-full bg-[#ec1d24] shrink-0" />
								<span>{reason}</span>
							</li>
						))}
					</ul>
				</div>

				{/* Reload Button */}
				<button
					className="mt-8 inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#ec1d24] text-white font-[BentonSansBold] text-sm uppercase tracking-wide rounded-lg cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(236,29,36,0.3)] hover:-translate-y-0.5 hover:bg-[#d81921] hover:shadow-[0_6px_20px_rgba(236,29,36,0.4)]"
					onClick={onReload}
					type="button"
				>
					<span>Try Again</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="16"
						height="16"
					>
						<title>Reload</title>
						<path
							d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A6.002 6.002 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
							fill="currentColor"
						/>
					</svg>
				</button>
			</div>
		</div>
	);
};

export default ErrorMessage;
