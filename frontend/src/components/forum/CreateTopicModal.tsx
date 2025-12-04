"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

const DURATION_OPTIONS = [
	{ value: "0.5", label: "2 weeks" },
	{ value: "1", label: "1 month (default)" },
	{ value: "2", label: "2 months" },
	{ value: "3", label: "3 months" },
	{ value: "6", label: "6 months" },
	{ value: "12", label: "1 year" },
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

interface ImageData {
	url: string;
	key: string;
}

interface CreateTopicModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (title: string, content: string, spoilerData?: {
		isSpoiler: boolean;
		spoilerFor?: string;
		spoilerExpiresAt?: Date;
	}, imageData?: ImageData) => Promise<void>;
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
	
	// Image state
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [uploadedImage, setUploadedImage] = useState<ImageData | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

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

	const readFileAsDataURL = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(new Error("Failed to read file"));
			reader.readAsDataURL(file);
		});
	};

	const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
			setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
			return;
		}

		// Validate file size
		if (file.size > MAX_IMAGE_SIZE) {
			setError("Image must be less than 5MB");
			return;
		}

		setError("");
		setImageFile(file);

		try {
			const dataUrl = await readFileAsDataURL(file);
			setImagePreview(dataUrl);
		} catch {
			setError("Failed to read image file");
		}
	}, []);

	const handleRemoveImage = useCallback(() => {
		setImagePreview(null);
		setImageFile(null);
		setUploadedImage(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, []);

	const uploadImage = async (dataUrl: string): Promise<ImageData> => {
		const response = await fetch("/api/forum/images/upload", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ image: dataUrl }),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.error || "Failed to upload image");
		}

		const data = await response.json();
		return { url: data.link, key: data.key };
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
			let imageData: ImageData | undefined;

			// Upload image if one is selected
			if (imagePreview && !uploadedImage) {
				setIsUploadingImage(true);
				try {
					imageData = await uploadImage(imagePreview);
					setUploadedImage(imageData);
				} catch (err) {
					setError(err instanceof Error ? err.message : "Failed to upload image");
					setIsSubmitting(false);
					setIsUploadingImage(false);
					return;
				}
				setIsUploadingImage(false);
			} else if (uploadedImage) {
				imageData = uploadedImage;
			}

			const spoilerData = isSpoiler ? {
				isSpoiler: true,
				spoilerFor: spoilerFor.trim(),
				spoilerExpiresAt: new Date(Date.now() + (parseFloat(spoilerDuration) * 30 * 24 * 60 * 60 * 1000)) // Convert months to milliseconds
			} : { isSpoiler: false };

			await onSubmit(title.trim(), content.trim(), spoilerData, imageData);
			
			// Reset form on success
			setTitle("");
			setContent("");
			setIsSpoiler(false);
			setSpoilerFor("");
			setSpoilerDuration("1");
			handleRemoveImage();
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create topic");
		} finally {
			setIsSubmitting(false);
			setIsUploadingImage(false);
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
			handleRemoveImage();
			onClose();
		}
	};

	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = useCallback(async (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();

		const file = e.dataTransfer.files[0];
		if (!file) return;

		// Validate file type
		if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
			setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
			return;
		}

		// Validate file size
		if (file.size > MAX_IMAGE_SIZE) {
			setError("Image must be less than 5MB");
			return;
		}

		setError("");
		setImageFile(file);

		try {
			const dataUrl = await readFileAsDataURL(file);
			setImagePreview(dataUrl);
		} catch {
			setError("Failed to read image file");
		}
	}, []);

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

					{/* Image Upload Section */}
					<div className="form-group">
						<label className="form-label">
							📷 Attach Image (optional)
						</label>
						<div className="image-upload-info">
							<small>⚠️ Images cannot be edited after posting. Max size: 5MB</small>
						</div>
						
						{imagePreview ? (
							<div className="image-preview-container">
								<div className="image-preview-wrapper">
									<Image
										src={imagePreview}
										alt="Preview"
										width={400}
										height={300}
										className="image-preview"
										style={{ objectFit: "contain", maxHeight: "200px", width: "auto" }}
									/>
								</div>
								<button
									type="button"
									className="remove-image-button"
									onClick={handleRemoveImage}
									disabled={isSubmitting}
								>
									✕ Remove Image
								</button>
							</div>
						) : (
							<div
								className="image-dropzone"
								onDragOver={handleDragOver}
								onDrop={handleDrop}
								onClick={() => fileInputRef.current?.click()}
							>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
									onChange={handleImageSelect}
									className="hidden-file-input"
									disabled={isSubmitting}
								/>
								<div className="dropzone-content">
									<span className="dropzone-icon">🖼️</span>
									<span>Click or drag an image here</span>
									<small>JPEG, PNG, GIF, WebP • Max 5MB</small>
								</div>
							</div>
						)}
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
							{isUploadingImage ? "Uploading Image..." : isSubmitting ? "Creating..." : "Create Topic"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CreateTopicModal;
