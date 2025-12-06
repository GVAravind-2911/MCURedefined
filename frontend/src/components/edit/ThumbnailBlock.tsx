"use client";

import type React from "react";
import type { DropzoneOptions } from "react-dropzone";
import type { ThumbnailBlockProps } from "@/types/BlockTypes";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

const ThumbnailBlock: React.FC<ThumbnailBlockProps> = ({ src, onChange }) => {
	const [image, setImage] = useState<string | null>(src || null);

	useEffect(() => {
		if (src) {
			setImage(src);
		}
	}, [src]);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const file = acceptedFiles[0];
			if (file && file instanceof Blob) {
				const reader = new FileReader();
				reader.onload = (e: ProgressEvent<FileReader>) => {
					const dataUrl = e.target?.result as string;
					setImage(dataUrl);
					onChange({
						target: {
							files: [file],
						},
					});
				};
				reader.readAsDataURL(file);
			} else {
				console.error("Invalid file type. Expected a Blob or File.");
			}
		},
		[onChange],
	);

	const dropzoneConfig: DropzoneOptions = {
		onDrop,
		accept: {
			"image/*": [".jpeg", ".jpg", ".png"],
		},
		multiple: false,
	};

	const { getRootProps, getInputProps, isDragActive } =
		useDropzone(dropzoneConfig);

	return (
		<div className="relative bg-[rgba(40,40,40,0.4)] border border-white/10 rounded-xl overflow-visible transition-all duration-300 hover:border-white/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex justify-center items-center p-6 min-h-[200px]">
			<button
				{...getRootProps()}
				className={`w-full min-h-[200px] border-2 border-dashed border-white/20 rounded-lg flex flex-col justify-center items-center cursor-pointer transition-all duration-300 bg-white/5 relative overflow-hidden group ${isDragActive ? "border-[#ec1d24] bg-[rgba(236,29,36,0.15)] border-solid" : ""} hover:border-[#ec1d24] hover:bg-[rgba(236,29,36,0.15)]`}
				aria-label="Upload thumbnail image"
			>
				<input {...getInputProps()} />
				{image ? (
					<>
						<Image
							src={image}
							alt="Uploaded thumbnail"
							className="max-w-full max-h-[400px] object-contain rounded-md"
							width={1000}
							height={1000}
						/>
						<div className="absolute top-0 left-0 right-0 bottom-0 bg-linear-to-b from-transparent to-black/80 flex justify-center items-end pb-6 opacity-0 transition-all duration-300 group-hover:opacity-100">
							<p className="text-white font-medium py-2 px-4 bg-black/50 rounded-full text-sm">
								Click or drag to replace image
							</p>
						</div>
					</>
				) : (
					<div className="text-center p-4">
						<div className="text-4xl mb-3">🖼️</div>
						<p className="text-white/70 mb-2">Drag and drop an image here</p>
						<p className="text-white/50 text-sm">or click to select a file</p>
						<p className="text-white/30 text-xs mt-3">Accepts: JPG, PNG</p>
					</div>
				)}
			</button>
		</div>
	);
};

export default ThumbnailBlock;
