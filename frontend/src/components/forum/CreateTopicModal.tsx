"use client";

import React, { useState, useRef, useEffect } from "react";

const DURATION_OPTIONS = [
	{ value: "0.5", label: "2 weeks" },
	{ value: "1", label: "1 month (default)" },
	{ value: "2", label: "2 months" },
	{ value: "3", label: "3 months" },
	{ value: "6", label: "6 months" },
	{ value: "12", label: "1 year" },
];

interface CreateTopicModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (title: string, content: string, spoilerData?: {
		isSpoiler: boolean;
		spoilerFor?: string;
		spoilerExpiresAt?: Date;
	}) => Promise<void>;
}

const CreateTopicModal: React.FC<CreateTopicModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
}) => {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [isSpoiler, setIsSpoiler] = useState(false);
	const [spoilerFor, setSpoilerFor] = useState("");
	const [spoilerDuration, setSpoilerDuration] = useState("1"); // Duration in months
	const [durationDropdownOpen, setDurationDropdownOpen] = useState(false);
	const durationDropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (durationDropdownRef.current && !durationDropdownRef.current.contains(event.target as Node)) {
				setDurationDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const getDurationLabel = () => {
		const option = DURATION_OPTIONS.find(opt => opt.value === spoilerDuration);
		return option?.label || "1 month (default)";
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!title.trim() || !content.trim()) {
			setError("Both title and content are required.");
			return;
		}

		if (title.length > 200) {
			setError("Title must be 200 characters or less.");
			return;
		}

		if (content.length > 10000) {
			setError("Content must be 10,000 characters or less.");
			return;
		}

		if (isSpoiler && !spoilerFor.trim()) {
			setError("Please specify what this spoiler is for.");
			return;
		}

		setIsSubmitting(true);
		try {
			const spoilerData = isSpoiler ? {
				isSpoiler: true,
				spoilerFor: spoilerFor.trim(),
				spoilerExpiresAt: new Date(Date.now() + (parseFloat(spoilerDuration) * 30 * 24 * 60 * 60 * 1000)) // Convert months to milliseconds
			} : { isSpoiler: false };

			await onSubmit(title.trim(), content.trim(), spoilerData);
			// Reset form on success
			setTitle("");
			setContent("");
			setIsSpoiler(false);
			setSpoilerFor("");
			setSpoilerDuration("1");
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create topic");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		if (!isSubmitting) {
			setTitle("");
			setContent("");
			setError("");
			setIsSpoiler(false);
			setSpoilerFor("");
			setSpoilerDuration("1");
			onClose();
		}
	};

	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className="create-topic-overlay" onClick={handleOverlayClick}>
			<div className="create-topic-modal">
				<div className="create-topic-header">
					<h2 className="create-topic-title">
						💭 Create New Topic
					</h2>
					<button
						type="button"
						className="close-modal-button"
						onClick={handleClose}
						disabled={isSubmitting}
					>
						×
					</button>
				</div>

				<form className="create-topic-form" onSubmit={handleSubmit}>
					<div className="form-group">
						<label htmlFor="topic-title" className="form-label">
							Topic Title
						</label>
						<input
							id="topic-title"
							type="text"
							className="form-input"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="What would you like to discuss?"
							maxLength={200}
							disabled={isSubmitting}
							required
						/>
						<div className="character-count">
							{title.length}/200
						</div>
					</div>

					<div className="form-group">
						<label htmlFor="topic-content" className="form-label">
							Content
						</label>
						<textarea
							id="topic-content"
							className="form-textarea"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="Share your thoughts, ask questions, or start a discussion..."
							maxLength={10000}
							disabled={isSubmitting}
							required
						/>
						<div className="character-count">
							{content.length}/10,000
						</div>
					</div>

					{/* Spoiler Options */}
					<div className="form-group">
						<div className="spoiler-checkbox-group">
							<input
								id="is-spoiler"
								type="checkbox"
								className="spoiler-checkbox"
								checked={isSpoiler}
								onChange={(e) => setIsSpoiler(e.target.checked)}
								disabled={isSubmitting}
							/>
							<label htmlFor="is-spoiler" className="spoiler-label">
								⚠️ This topic contains spoilers
							</label>
						</div>

						{isSpoiler && (
							<div className="spoiler-fields">
								<div className="spoiler-field">
									<label htmlFor="spoiler-for" className="form-label">
										Spoiler for:
									</label>
									<input
										id="spoiler-for"
										type="text"
										className="form-input"
										value={spoilerFor}
										onChange={(e) => setSpoilerFor(e.target.value)}
										placeholder="e.g., Deadpool & Wolverine, Spider-Man 4, etc."
										disabled={isSubmitting}
										required={isSpoiler}
									/>
								</div>
								<div className="spoiler-field">
									<label htmlFor="spoiler-duration" className="form-label">
										Spoiler protection duration:
									</label>
									<div className="custom-dropdown" ref={durationDropdownRef}>
										<button
											type="button"
											className="dropdown-trigger"
											onClick={() => !isSubmitting && setDurationDropdownOpen(!durationDropdownOpen)}
											disabled={isSubmitting}
										>
											<span>{getDurationLabel()}</span>
											<svg
												className={`dropdown-arrow ${durationDropdownOpen ? "open" : ""}`}
												width="12"
												height="12"
												viewBox="0 0 12 12"
											>
												<path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" fill="none" />
											</svg>
										</button>
										{durationDropdownOpen && (
											<div className="dropdown-menu">
												{DURATION_OPTIONS.map((option) => (
													<button
														key={option.value}
														type="button"
														className={`dropdown-item ${spoilerDuration === option.value ? "selected" : ""}`}
														onClick={() => {
															setSpoilerDuration(option.value);
															setDurationDropdownOpen(false);
														}}
													>
														{option.label}
													</button>
												))}
											</div>
										)}
									</div>
									<div className="spoiler-help-text">
										Spoiler protection will automatically expire after this duration
									</div>
								</div>
							</div>
						)}
					</div>

					{error && (
						<div className="error-message">
							{error}
						</div>
					)}

					<div className="form-actions">
						<button
							type="button"
							className="form-button form-button-secondary"
							onClick={handleClose}
							disabled={isSubmitting}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="form-button form-button-primary"
							disabled={isSubmitting || !title.trim() || !content.trim()}
						>
							{isSubmitting ? "Creating..." : "Create Topic"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CreateTopicModal;
