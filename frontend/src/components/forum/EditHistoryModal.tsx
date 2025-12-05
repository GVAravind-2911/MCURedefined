"use client";

import { useState, useEffect, memo } from "react";
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

const EditHistoryModal = memo(function EditHistoryModal({
	contentId,
	contentType,
	onClose,
}: EditHistoryModalProps) {
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
		<div className="fixed inset-0 bg-black/85 flex items-center justify-center z-1100 p-4 animate-[fadeIn_0.2s_ease]" onClick={handleBackdropClick}>
			<div className="bg-[linear-gradient(135deg,rgba(20,20,20,0.98)_0%,rgba(30,30,30,0.98)_100%)] border border-white/20 rounded-xl w-full max-w-[600px] max-h-[80vh] overflow-hidden backdrop-blur-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-[modalSlideIn_0.3s_ease]">
				<div className="flex items-center justify-between p-5 border-b border-white/10">
					<h2 className="font-[BentonSansBold] text-xl text-white m-0">Edit History</h2>
					<button className="bg-white/10 border border-white/20 text-white/70 text-xl cursor-pointer w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center hover:bg-[rgba(236,29,36,0.2)] hover:border-[rgba(236,29,36,0.5)] hover:text-white" onClick={onClose}>×</button>
				</div>

				<div className="p-5 overflow-y-auto max-h-[calc(80vh-70px)]">
					{loading ? (
						<div className="text-center py-8 text-white/60">Loading...</div>
					) : error ? (
						<div className="text-center py-8 text-[#dc3545]">{error}</div>
					) : history.length === 0 ? (
						<div className="text-center py-8 text-white/60">No edit history available</div>
					) : (
						<div className="flex flex-col gap-4">
							{history.map((item, index) => (
								<div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
									<div className="flex items-center justify-between mb-3 text-sm">
										<span className="font-[BentonSansBold] text-white/90">Version {item.editNumber}</span>
										<span className="text-white/50">{formatRelativeTime(item.editedAt)}</span>
									</div>
									{item.previousTitle && (
										<div className="mb-2 text-white/70 text-sm">
											<strong>Title:</strong> {item.previousTitle}
										</div>
									)}
									<div className="text-white/80 text-sm leading-relaxed font-[BentonSansRegular] whitespace-pre-wrap">
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
});

export default EditHistoryModal;
