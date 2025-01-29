'use client'

import type React from 'react';
import type { DropzoneOptions } from 'react-dropzone';
import type { ThumbnailBlockProps } from '@/types/BlockTypes';
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";


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
                            files: [file]
                        }
                    });
                };
                reader.readAsDataURL(file);
            } else {
                console.error("Invalid file type. Expected a Blob or File.");
            }
        },
        [onChange]
    );

    const dropzoneConfig: DropzoneOptions = {
        onDrop,
        accept: {
            "image/*": [".jpeg", ".jpg", ".png"],
        },
        multiple: false,
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneConfig);

    return (
        <div className="content-block image-block">
            <button
                {...getRootProps()}
                className={`dropzone ${isDragActive ? "active" : ""} ${
                    image ? "has-image" : ""
                }`}
                aria-label="Upload thumbnail image"
            >
                <input {...getInputProps()} />
                {image ? (
                    <>
                        <img
                            src={image}
                            alt="Uploaded thumbnail"
                            className="uploaded-image"
                        />
                        <div className="image-overlay">
                            <p>Click or drag to replace image</p>
                        </div>
                    </>
                ) : (
                    <p>Drag and drop an image here, or click to select a file</p>
                )}
            </button>
        </div>
    );
};

export default ThumbnailBlock;