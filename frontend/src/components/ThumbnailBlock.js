import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";

const ThumbnailBlock = ({ src, onChange }) => {
    const [image, setImage] = useState(src || "");

    useEffect(() => {
        if (src) {
            setImage(src);
        }
    }, [src]);

    const onDrop = useCallback(
        (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file && file instanceof Blob) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const dataUrl = e.target.result;
                    // Update local state
                    setImage(dataUrl);
                    // Call onChange to update the parent's content blocks
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

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpeg", ".jpg", ".png"],
        },
        multiple: false,
    });

    return (
        <div className="content-block image-block">
            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? "active" : ""} ${
                    image ? "has-image" : ""
                }`}
            >
                <input {...getInputProps()} />
                {image ? (
                    <>
                        <img
                            src={image}
                            alt="Uploaded content"
                            className="uploaded-image"
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

export default ThumbnailBlock;