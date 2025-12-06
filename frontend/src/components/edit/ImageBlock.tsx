import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import type { ImageBlockProps } from "@/types/BlockTypes";
import type { DropzoneOptions } from "react-dropzone";
import Image from "next/image";

const ImageBlock: React.FC<ImageBlockProps> = ({
	index,
	src,
	onChange,
	onDelete,
}) => {
	const [image, setImage] = useState<{ link: string }>(src);

	const createFileList = (files: File[]): FileList => {
		const dataTransfer = new DataTransfer();
		for (const file of files) {
			dataTransfer.items.add(file);
		}
		return dataTransfer.files;
	};

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const file = acceptedFiles[0];

			if (file && file instanceof Blob) {
				const reader = new FileReader();

				reader.onload = (e: ProgressEvent<FileReader>) => {
					const dataUrl = e.target?.result as string;
					setImage({ link: dataUrl });
					const fileList = createFileList([file]);
					onChange({
						target: {
							files: fileList,
						},
					} as React.ChangeEvent<HTMLInputElement>);
				};

				reader.readAsDataURL(file);
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

	const handleReupload = (): void => {
		setImage({ link: "" });
		const emptyFileList = createFileList([]);
		onChange({
			target: {
				files: emptyFileList,
			},
		} as React.ChangeEvent<HTMLInputElement>);
	};

	return (
		<div className="relative bg-[rgba(40,40,40,0.4)] border border-white/10 rounded-xl overflow-visible transition-all duration-300 animate-[fadeInBlock_0.3s_ease-out] hover:border-white/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex justify-center items-center pt-10 px-4 md:px-6 pb-4 md:pb-6 min-h-[200px]">
			<div className="absolute top-0 left-0 bg-linear-to-br from-[rgba(60,60,60,0.95)] to-[rgba(40,40,40,0.95)] py-1.5 px-4 rounded-tl-xl rounded-br-lg text-xs text-white/70 uppercase tracking-wider border-b border-r border-white/10 z-5">
				Image
			</div>
			<div className="absolute top-0 right-0 flex gap-1 p-1.5 bg-linear-to-br from-[rgba(60,60,60,0.95)] to-[rgba(40,40,40,0.95)] rounded-tr-xl rounded-bl-lg border-b border-l border-white/10 z-5 opacity-70 transition-all duration-300 hover:opacity-100">
				{image.link && (
					<button
						type="button"
						onClick={handleReupload}
						className="py-1 px-2 border border-white/10 rounded bg-white/5 text-white/70 text-sm cursor-pointer transition-all duration-300 hover:bg-[rgba(236,29,36,0.15)] hover:border-[#ec1d24]"
						title="Replace image"
					>
						🔄
					</button>
				)}
				<button
					type="button"
					onClick={onDelete}
					className="py-1 px-2 border border-[rgba(220,53,69,0.3)] rounded bg-[rgba(220,53,69,0.2)] text-[#ff6b6b] text-sm cursor-pointer transition-all duration-300 hover:bg-[rgba(220,53,69,0.4)] hover:border-[#dc3545]"
					title="Delete block"
				>
					🗑️
				</button>
			</div>
			<div
				{...getRootProps()}
				className={`w-full min-h-[200px] border-2 border-dashed border-white/20 rounded-lg flex flex-col justify-center items-center cursor-pointer transition-all duration-300 bg-white/5 relative overflow-hidden group ${isDragActive ? "border-[#ec1d24] bg-[rgba(236,29,36,0.15)] border-solid" : ""} ${image.link ? "" : ""} hover:border-[#ec1d24] hover:bg-[rgba(236,29,36,0.15)]`}
			>
				<input {...getInputProps()} />
				{image.link ? (
					<>
						<Image
							src={image.link}
							alt="Uploaded content"
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
			</div>
		</div>
	);
};

export default ImageBlock;
