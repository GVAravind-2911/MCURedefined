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
		<div className="content-block image-block">
			<div className="image-type block-type">Image</div>
			<div className="image-actions block-actions">
				{image.link && (
					<button
						type="button"
						onClick={handleReupload}
						className="reupload-button"
					>
						🔄
					</button>
				)}
				<button type="button" onClick={onDelete} className="delete-button">
					🗑️
				</button>
			</div>
			<div
				{...getRootProps()}
				className={`dropzone ${isDragActive ? "active" : ""} ${
					image.link ? "has-image" : ""
				}`}
			>
				<input {...getInputProps()} />
				{image.link ? (
					<>
						<Image
							src={image.link}
							alt="Uploaded content"
							className="uploaded-image"
							width={1000}
							height={1000}
						/>
						<div className="image-overlay">
							<p>Click or drag to replace image</p>
						</div>
					</>
				) : (
					<p>Drag and drop an image here, or click to select a file</p>
				)}
			</div>
		</div>
	);
};

export default ImageBlock;
