"use client";

import { memo, useEffect } from "react";
import { X } from "lucide-react";

interface ModalWrapperProps {
	onClose: () => void;
	children: React.ReactNode;
}

export default memo(function ModalWrapper({
	onClose,
	children,
}: ModalWrapperProps) {
	// Handle escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [onClose]);

	// Prevent body scroll when modal is open
	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "";
		};
	}, []);

	return (
		<div
			className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-1000 p-4 sm:p-6 animate-in fade-in duration-200"
			onClick={onClose}
		>
			<div
				className="relative bg-linear-to-br from-[rgba(30,30,30,0.98)] to-[rgba(20,20,20,0.98)] backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-7 max-w-[560px] w-full max-h-[90vh] overflow-y-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Decorative gradient */}
				<div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-[#ec1d24]/10 to-transparent rounded-t-2xl sm:rounded-t-3xl pointer-events-none" />

				{/* Close button */}
				<button
					type="button"
					className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-red-500/15 text-white/50 hover:text-red-400 rounded-xl transition-all duration-300 border border-white/10 hover:border-red-500/30"
					onClick={onClose}
				>
					<X className="w-5 h-5" />
				</button>

				<div className="relative">{children}</div>
			</div>
		</div>
	);
});
