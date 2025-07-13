"use client";

import React, { useState } from "react";

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
									<select
										id="spoiler-duration"
										className="form-input form-select"
										value={spoilerDuration}
										onChange={(e) => setSpoilerDuration(e.target.value)}
										disabled={isSubmitting}
									>
										<option value="0.5">2 weeks</option>
										<option value="1">1 month (default)</option>
										<option value="2">2 months</option>
										<option value="3">3 months</option>
										<option value="6">6 months</option>
										<option value="12">1 year</option>
									</select>
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
