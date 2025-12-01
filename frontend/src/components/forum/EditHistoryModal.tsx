"use client";

import React, { useState, useEffect } from "react";
import { formatRelativeTime } from "@/lib/dateUtils";

interface EditHistoryItem {
	id: string;
	previousTitle?: string;
	previousContent: string;
	editedAt: string;
	editNumber: number;
}

interface EditHistoryModalProps {
	contentId: string;
	contentType: "topic" | "comment";
	onClose: () => void;
}

const EditHistoryModal: React.FC<EditHistoryModalProps> = ({
	contentId,
	contentType,
	onClose,
}) => {
	const [history, setHistory] = useState<EditHistoryItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		fetchHistory();
	}, [contentId, contentType]);

	const fetchHistory = async () => {
		try {
			setLoading(true);
			setError("");

			const apiPath = contentType === "topic" 
				? `/api/forum/topics/${contentId}/history`
				: `/api/forum/comments/${contentId}/history`;

			const response = await fetch(apiPath);

			if (!response.ok) {
				throw new Error("Failed to fetch edit history");
			}

			const data = await response.json();
			setHistory(data.history || []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<div className="edit-history-modal-backdrop" onClick={handleBackdropClick}>
			<div className="edit-history-modal">
				<div className="edit-history-header">
					<h2>Edit History</h2>
					<button className="close-btn" onClick={onClose}>×</button>
				</div>

				<div className="edit-history-content">
					{loading ? (
						<div className="edit-history-loading">Loading...</div>
					) : error ? (
						<div className="edit-history-error">{error}</div>
					) : history.length === 0 ? (
						<div className="edit-history-empty">No edit history available</div>
					) : (
						<div className="edit-history-list">
							{history.map((item, index) => (
								<div key={item.id} className="edit-history-item">
									<div className="edit-history-item-header">
										<span className="edit-number">Version {item.editNumber}</span>
										<span className="edit-date">{formatRelativeTime(item.editedAt)}</span>
									</div>
									{item.previousTitle && (
										<div className="edit-history-title">
											<strong>Title:</strong> {item.previousTitle}
										</div>
									)}
									<div className="edit-history-text">
										{item.previousContent}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default EditHistoryModal;
