"use client";

import { memo } from "react";

interface ModalWrapperProps {
	onClose: () => void;
	children: React.ReactNode;
}

export default memo(function ModalWrapper({ onClose, children }: ModalWrapperProps) {
	return (
		<div 
			className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-1000 p-8 animate-[fadeInSimple_0.2s_ease]" 
			onClick={onClose}
		>
			<div 
				className="relative bg-[rgba(30,30,30,0.95)] border border-white/15 rounded-[18px] p-8 max-w-[560px] w-full max-h-[90vh] overflow-y-auto shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_60px_rgba(236,29,36,0.1)] animate-[slideUp_0.3s_cubic-bezier(0.4,0,0.2,1)]" 
				onClick={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center border-none bg-white/10 text-white/70 rounded-full cursor-pointer transition-all duration-[0.25s] hover:bg-red-500/15 hover:text-red-500"
					onClick={onClose}
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
				{children}
			</div>
		</div>
	);
});