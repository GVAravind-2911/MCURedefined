"use client";

import React, { memo } from "react";

interface SpoilerRevealModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	spoilerFor: string;
}

const SpoilerRevealModal: React.FC<SpoilerRevealModalProps> = memo(({
	isOpen,
	onClose,
	onConfirm,
	spoilerFor,
}) => {
	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	const handleConfirm = () => {
		onConfirm();
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="spoiler-modal-overlay" onClick={handleOverlayClick}>
			<div className="spoiler-modal">
				<div className="spoiler-modal-header">
					<div className="spoiler-modal-icon">⚠️</div>
					<h3 className="spoiler-modal-title">Spoiler Warning</h3>
				</div>
				
				<div className="spoiler-modal-content">
					<p className="spoiler-modal-text">
						This content contains spoilers for:
					</p>
					<div className="spoiler-modal-subject">
						{spoilerFor}
					</div>
					<p className="spoiler-modal-question">
						Are you sure you want to view this spoiler?
					</p>
				</div>

				<div className="spoiler-modal-actions">
					<button
						type="button"
						className="spoiler-modal-button spoiler-modal-button-cancel"
						onClick={onClose}
					>
						No, Keep Hidden
					</button>
					<button
						type="button"
						className="spoiler-modal-button spoiler-modal-button-confirm"
						onClick={handleConfirm}
					>
						Yes, Reveal Spoiler
					</button>
				</div>
			</div>
		</div>
	);
});

SpoilerRevealModal.displayName = "SpoilerRevealModal";

export default SpoilerRevealModal;
