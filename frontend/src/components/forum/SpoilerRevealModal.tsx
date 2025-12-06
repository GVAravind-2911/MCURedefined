"use client";

import React, { memo } from "react";

interface SpoilerRevealModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	spoilerFor: string;
}

const SpoilerRevealModal: React.FC<SpoilerRevealModalProps> = memo(
	({ isOpen, onClose, onConfirm, spoilerFor }) => {
		const handleOverlayClick = (e: React.MouseEvent) => {
			// Stop propagation to prevent parent click handlers from firing
			e.stopPropagation();
			if (e.target === e.currentTarget) {
				onClose();
			}
		};

		const handleModalClick = (e: React.MouseEvent) => {
			// Stop propagation for clicks inside the modal
			e.stopPropagation();
		};

		const handleConfirm = () => {
			onConfirm();
			onClose();
		};

		if (!isOpen) return null;

		return (
			<div
				className="fixed inset-0 bg-black/85 flex items-center justify-center z-1100 p-5 animate-[fadeIn_0.2s_ease]"
				onClick={handleOverlayClick}
			>
				<div
					className="bg-[linear-gradient(135deg,rgba(20,20,20,0.98)_0%,rgba(30,30,30,0.98)_100%)] border border-[rgba(255,165,0,0.4)] rounded-xl p-0 w-full max-w-[420px] max-h-[90vh] overflow-hidden backdrop-blur-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,165,0,0.1),0_0_40px_rgba(255,165,0,0.1)] animate-[modalSlideIn_0.3s_ease]"
					onClick={handleModalClick}
				>
					<div className="flex flex-col items-center gap-2 py-6 px-6 bg-[linear-gradient(135deg,rgba(255,165,0,0.15)_0%,rgba(255,107,53,0.1)_100%)] border-b border-[rgba(255,165,0,0.2)]">
						<div className="text-4xl animate-[pulse_2s_infinite]">⚠️</div>
						<h3 className="font-[BentonSansBold] text-xl text-[#ffa500] m-0 uppercase tracking-[1px]">
							Spoiler Warning
						</h3>
					</div>

					<div className="py-6 px-6 text-center">
						<p className="text-white/80 text-base m-0 mb-3 font-[BentonSansRegular]">
							This content contains spoilers for:
						</p>
						<div className="font-[BentonSansBold] text-lg text-white bg-[rgba(255,165,0,0.1)] py-3 px-5 rounded-lg border border-[rgba(255,165,0,0.2)] my-4 inline-block">
							{spoilerFor}
						</div>
						<p className="text-white/60 text-[0.95rem] m-0 font-[BentonSansRegular]">
							Are you sure you want to view this spoiler?
						</p>
					</div>

					<div className="flex gap-3 p-6 pt-0">
						<button
							type="button"
							className="flex-1 py-3.5 px-5 rounded-lg font-[BentonSansBold] text-sm cursor-pointer transition-all duration-300 ease-in-out uppercase tracking-[0.5px] bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:text-white hover:border-white/30"
							onClick={onClose}
						>
							No, Keep Hidden
						</button>
						<button
							type="button"
							className="flex-1 py-3.5 px-5 rounded-lg font-[BentonSansBold] text-sm cursor-pointer transition-all duration-300 ease-in-out uppercase tracking-[0.5px] bg-[linear-gradient(135deg,#ffa500,#ff8c00)] text-black border-none shadow-[0_4px_15px_rgba(255,165,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,165,0,0.4)] hover:bg-[linear-gradient(135deg,#ffb733,#ffa500)]"
							onClick={handleConfirm}
						>
							Yes, Reveal Spoiler
						</button>
					</div>
				</div>
			</div>
		);
	},
);

SpoilerRevealModal.displayName = "SpoilerRevealModal";

export default SpoilerRevealModal;
