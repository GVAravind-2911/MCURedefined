"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	variant?: "danger" | "warning" | "info";
}

export default function ConfirmationModal({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "Confirm",
	cancelText = "Cancel",
	variant = "danger",
}: ConfirmationModalProps) {
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		},
		[onClose],
	);

	useEffect(() => {
		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "hidden";
		}
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, handleKeyDown]);

	const variantStyles = {
		danger: {
			icon: "⚠️",
			confirmBtn:
				"bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700",
		},
		warning: {
			icon: "⚡",
			confirmBtn:
				"bg-yellow-600 hover:bg-yellow-700 border-yellow-600 hover:border-yellow-700",
		},
		info: {
			icon: "ℹ️",
			confirmBtn:
				"bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700",
		},
	};

	const styles = variantStyles[variant];

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					onClick={onClose}
				>
					{/* Backdrop */}
					<div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

					{/* Modal */}
					<motion.div
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.95, opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="relative bg-linear-to-br from-[rgba(50,50,50,0.98)] to-[rgba(30,30,30,0.98)] border border-white/20 rounded-xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.5)] max-w-md w-full"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Icon */}
						<div className="text-4xl mb-4 text-center">{styles.icon}</div>

						{/* Title */}
						<h2 className="text-xl font-bold text-white text-center mb-2">
							{title}
						</h2>

						{/* Message */}
						<p className="text-white/70 text-center mb-6">{message}</p>

						{/* Actions */}
						<div className="flex gap-3 justify-center">
							<button
								type="button"
								onClick={onClose}
								className="py-3 px-6 bg-white/5 border border-white/20 rounded-lg text-white font-medium cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/40 focus-visible:outline-2 focus-visible:outline-[#ec1d24] focus-visible:outline-offset-2"
							>
								{cancelText}
							</button>
							<button
								type="button"
								onClick={() => {
									onConfirm();
									onClose();
								}}
								className={`py-3 px-6 border rounded-lg text-white font-medium cursor-pointer transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 ${styles.confirmBtn}`}
							>
								{confirmText}
							</button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
