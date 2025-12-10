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
const ALLOWED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/gif",
	"image/webp",
];

interface ImageData {
	url: string;
	key: string;
}

interface CreateTopicModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (
		title: string,
		content: string,
		spoilerData?: {
			isSpoiler: boolean;
			spoilerFor?: string;
			spoilerExpiresAt?: Date;
		},
		imageData?: ImageData,
	) => Promise<void>;
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
			if (
				durationDropdownRef.current &&
				!durationDropdownRef.current.contains(event.target as Node)
			) {
				setDurationDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const getDurationLabel = () => {
		const option = DURATION_OPTIONS.find(
			(opt) => opt.value === spoilerDuration,
		);
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

	const handleImageSelect = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
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
		},
		[],
	);

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
					setError(
						err instanceof Error ? err.message : "Failed to upload image",
					);
					setIsSubmitting(false);
					setIsUploadingImage(false);
					return;
				}
				setIsUploadingImage(false);
			} else if (uploadedImage) {
				imageData = uploadedImage;
			}

			const spoilerData = isSpoiler
				? {
						isSpoiler: true,
						spoilerFor: spoilerFor.trim(),
						spoilerExpiresAt: new Date(
							Date.now() +
								parseFloat(spoilerDuration) * 30 * 24 * 60 * 60 * 1000,
						), // Convert months to milliseconds
					}
				: { isSpoiler: false };

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
		<div
			className="fixed inset-0 bg-black/85 flex items-center justify-center z-1000 p-4"
			onClick={handleOverlayClick}
		>
			<div className="bg-[linear-gradient(135deg,rgba(12,12,12,0.98)_0%,rgba(26,26,26,0.98)_100%)] border border-[rgba(236,29,36,0.5)] rounded-xl p-8 w-full max-w-[700px] max-h-[90vh] overflow-y-auto backdrop-blur-[20px] shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(236,29,36,0.1)] relative animate-[modalSlideIn_0.3s_ease] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[linear-gradient(90deg,transparent,#ec1d24,transparent)] before:rounded-t-xl max-md:m-4 max-md:p-6 max-md:max-w-[calc(100vw-2rem)]">
				<div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
					<h2 className="font-[BentonSansBold] text-[1.75rem] max-md:text-2xl text-white m-0 flex items-center gap-2 uppercase tracking-[0.5px] after:content-[''] after:block after:w-10 after:h-[3px] after:bg-[#ec1d24] after:ml-3">
						💭 Create New Topic
					</h2>
					<button
						type="button"
						className="bg-white/10 border border-white/20 text-white/70 text-2xl cursor-pointer w-10 h-10 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center hover:bg-[rgba(236,29,36,0.2)] hover:border-[rgba(236,29,36,0.5)] hover:text-white hover:scale-105"
						onClick={handleClose}
						disabled={isSubmitting}
					>
						×
					</button>
				</div>

				<form className="flex flex-col gap-6" onSubmit={handleSubmit}>
					<div className="flex flex-col gap-3">
						<label
							htmlFor="topic-title"
							className="font-[BentonSansBold] text-white/80 text-[0.95rem] uppercase tracking-[0.5px]"
						>
							Topic Title
						</label>
						<input
							id="topic-title"
							type="text"
							className="py-4 px-5 border border-white/20 rounded-lg bg-white/5 text-white font-[BentonSansRegular] text-base transition-all duration-300 ease-in-out shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] focus:outline-none focus:border-[#ec1d24] focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(236,29,36,0.15),inset_0_2px_4px_rgba(0,0,0,0.1)]"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="What would you like to discuss?"
							maxLength={200}
							disabled={isSubmitting}
							required
						/>
						<div className="text-[0.8rem] text-white/50 text-right mt-1">
							{title.length}/200
						</div>
					</div>

					<div className="flex flex-col gap-3">
						<label
							htmlFor="topic-content"
							className="font-[BentonSansBold] text-white/80 text-[0.95rem] uppercase tracking-[0.5px]"
						>
							Content
						</label>
						<textarea
							id="topic-content"
							className="py-4 px-5 border border-white/20 rounded-lg bg-white/5 text-white font-[BentonSansRegular] text-base transition-all duration-300 ease-in-out shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] resize-y min-h-[150px] focus:outline-none focus:border-[#ec1d24] focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(236,29,36,0.15),inset_0_2px_4px_rgba(0,0,0,0.1)]"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="Share your thoughts, ask questions, or start a discussion..."
							maxLength={10000}
							disabled={isSubmitting}
							required
						/>
						<div className="text-[0.8rem] text-white/50 text-right mt-1">
							{content.length}/10,000
						</div>
					</div>

					{/* Image Upload Section */}
					<div className="flex flex-col gap-3">
						<label className="font-[BentonSansBold] text-white/80 text-[0.95rem] uppercase tracking-[0.5px]">
							📷 Attach Image (optional)
						</label>
						<div className="mb-2 text-white/70">
							<small className="text-[#ffa500]">
								⚠️ Images cannot be edited after posting. Max size: 5MB
							</small>
						</div>

						{imagePreview ? (
							<div className="flex flex-col items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
								<div className="max-w-full flex justify-center">
									<Image
										src={imagePreview}
										alt="Preview"
										width={400}
										height={300}
										className="max-h-[200px] w-auto rounded-lg"
										style={{ objectFit: "contain" }}
									/>
								</div>
								<button
									type="button"
									className="bg-[rgba(220,53,69,0.2)] text-[#dc3545] border border-[rgba(220,53,69,0.3)] py-2 px-4 rounded-lg cursor-pointer transition-all duration-300 ease-in-out text-sm hover:not-disabled:bg-[rgba(220,53,69,0.3)] hover:not-disabled:border-[rgba(220,53,69,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
									onClick={handleRemoveImage}
									disabled={isSubmitting}
								>
									✕ Remove Image
								</button>
							</div>
						) : (
							<div
								className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ease-in-out bg-white/5 hover:border-[#ec1d24] hover:bg-[rgba(236,29,36,0.2)]"
								onDragOver={handleDragOver}
								onDrop={handleDrop}
								onClick={() => fileInputRef.current?.click()}
							>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
									onChange={handleImageSelect}
									className="hidden"
									disabled={isSubmitting}
								/>
								<div className="flex flex-col items-center gap-2 text-white/70">
									<span className="text-4xl">🖼️</span>
									<span>Click or drag an image here</span>
									<small className="text-white/50">
										JPEG, PNG, GIF, WebP • Max 5MB
									</small>
								</div>
							</div>
						)}
					</div>

					{/* Spoiler Options */}
					<div className="flex flex-col gap-3">
						<div className="flex items-center gap-3 p-5 bg-[linear-gradient(135deg,rgba(255,165,0,0.08)_0%,rgba(255,107,53,0.08)_100%)] border border-[rgba(255,165,0,0.25)] rounded-lg transition-all duration-300 ease-in-out mb-2 hover:bg-[linear-gradient(135deg,rgba(255,165,0,0.12)_0%,rgba(255,107,53,0.12)_100%)] hover:border-[rgba(255,165,0,0.4)]">
							<input
								id="is-spoiler"
								type="checkbox"
								className="accent-[#ffa500] scale-[1.3] cursor-pointer m-0"
								checked={isSpoiler}
								onChange={(e) => setIsSpoiler(e.target.checked)}
								disabled={isSubmitting}
							/>
							<label
								htmlFor="is-spoiler"
								className="m-0 cursor-pointer flex items-center gap-2 text-base text-white/90 font-[BentonSansBold]"
							>
								⚠️ This topic contains spoilers
							</label>
						</div>

						{isSpoiler && (
							<div className="ml-0 p-6 border-l-[3px] border-[rgba(255,165,0,0.4)] bg-[linear-gradient(135deg,rgba(255,165,0,0.03)_0%,rgba(255,107,53,0.03)_100%)] rounded-r-lg flex flex-col gap-5 mt-4 animate-[slideDown_0.3s_ease] max-md:pl-4 max-[480px]:ml-0 max-[480px]:pl-4">
								<div className="flex flex-col gap-2">
									<label
										htmlFor="spoiler-for"
										className="text-sm text-white/80 font-[BentonSansBold]"
									>
										Spoiler for:
									</label>
									<input
										id="spoiler-for"
										type="text"
										className="text-[0.95rem] py-3.5 px-4 bg-white/5 border border-[rgba(255,165,0,0.2)] rounded-lg text-white font-[BentonSansRegular] transition-all duration-300 ease-in-out focus:outline-none focus:border-[#ffa500] focus:bg-[rgba(255,165,0,0.08)] focus:shadow-[0_0_0_3px_rgba(255,165,0,0.15)]"
										value={spoilerFor}
										onChange={(e) => setSpoilerFor(e.target.value)}
										placeholder="e.g., Deadpool & Wolverine, Spider-Man 4, etc."
										disabled={isSubmitting}
										required={isSpoiler}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<label
										htmlFor="spoiler-duration"
										className="text-sm text-white/80 font-[BentonSansBold]"
									>
										Spoiler protection duration:
									</label>
									<div className="relative" ref={durationDropdownRef}>
										<button
											type="button"
											className="flex items-center justify-between gap-3 w-full py-3.5 px-4 bg-white/5 border border-[rgba(255,165,0,0.2)] rounded-lg text-white/90 text-[0.95rem] cursor-pointer transition-all duration-300 ease-in-out text-left hover:border-[rgba(255,165,0,0.4)] hover:bg-[rgba(255,165,0,0.05)] focus:outline-none focus:border-[#ffa500] focus:bg-[rgba(255,165,0,0.08)] focus:shadow-[0_0_0_3px_rgba(255,165,0,0.15)] disabled:opacity-60 disabled:cursor-not-allowed"
											onClick={() =>
												!isSubmitting &&
												setDurationDropdownOpen(!durationDropdownOpen)
											}
											disabled={isSubmitting}
										>
											<span>{getDurationLabel()}</span>
											<svg
												className={`shrink-0 opacity-70 transition-transform duration-200 ${durationDropdownOpen ? "rotate-180" : ""}`}
												width="12"
												height="12"
												viewBox="0 0 12 12"
											>
												<path
													d="M2 4L6 8L10 4"
													stroke="currentColor"
													strokeWidth="2"
													fill="none"
												/>
											</svg>
										</button>
										{durationDropdownOpen && (
											<div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[#1a1a1a] border border-[rgba(255,165,0,0.3)] rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-100 overflow-hidden animate-[dropdownFadeIn_0.2s_ease]">
												{DURATION_OPTIONS.map((option) => (
													<button
														key={option.value}
														type="button"
														className={`flex items-center w-full py-3 px-4 bg-transparent border-none text-white/70 text-[0.95rem] text-left cursor-pointer transition-all duration-300 ease-in-out hover:bg-[rgba(255,165,0,0.1)] hover:text-white/90 ${spoilerDuration === option.value ? "bg-[rgba(255,165,0,0.15)] text-[#ffa500] font-medium" : ""}`}
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
									<div className="text-[0.8rem] text-white/50 mt-1 italic">
										Spoiler protection will automatically expire after this
										duration
									</div>
								</div>
							</div>
						)}
					</div>

					{error && (
						<div className="text-[#ff6b6b] text-sm text-center py-3 px-4 bg-[rgba(255,107,107,0.1)] border border-[rgba(255,107,107,0.3)] rounded-lg animate-[fadeInSimple_0.3s_ease]">
							{error}
						</div>
					)}

					<div className="flex gap-4 justify-end pt-4 border-t border-white/10 max-md:flex-col max-md:gap-3">
						<button
							type="button"
							className="py-3.5 px-7 border-none rounded-lg font-[BentonSansBold] text-base cursor-pointer transition-all duration-300 ease-in-out relative overflow-hidden uppercase tracking-[0.5px] bg-white/10 text-white/80 border border-white/20 hover:not-disabled:bg-white/20 hover:not-disabled:text-white hover:not-disabled:border-white/30 hover:not-disabled:-translate-y-px max-md:w-full"
							onClick={handleClose}
							disabled={isSubmitting}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="py-3.5 px-7 border-none rounded-lg font-[BentonSansBold] text-base cursor-pointer transition-all duration-300 ease-in-out relative overflow-hidden uppercase tracking-[0.5px] bg-[linear-gradient(135deg,#ec1d24,#d01c22)] text-white shadow-[0_4px_15px_rgba(236,29,36,0.3)] hover:not-disabled:bg-[linear-gradient(135deg,#ff3a3a,#ec1d24)] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_6px_20px_rgba(236,29,36,0.4)] disabled:bg-[rgba(236,29,36,0.4)] disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none max-md:w-full flex items-center justify-center gap-2"
							disabled={isSubmitting || !title.trim() || !content.trim()}
						>
							{isSubmitting && (
								<svg
									className="animate-spin h-5 w-5 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
							)}
							{isSubmitting ? "Creating..." : "Create Topic"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CreateTopicModal;
