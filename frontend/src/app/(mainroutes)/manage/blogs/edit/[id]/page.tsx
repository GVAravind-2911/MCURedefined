"use client";

import type { JSX } from "react";
import type { AxiosError } from "axios";
import BlockWrapper from "@/components/edit/BlockWrapper";
import EmbedBlock from "@/components/edit/EmbedBlock";
import ImageBlock from "@/components/edit/ImageBlock";
import TextBlock from "@/components/edit/TextBlock";
import ThumbnailBlock from "@/components/edit/ThumbnailBlock";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/main/LoadingSpinner";
import ErrorMessage from "@/components/main/ErrorMessage";
import "@/styles/editblogpage.css";

type ContentBlock = {
	id: string;
} & (
	| { type: "text"; content: string }
	| { type: "image"; content: { link: string } }
	| { type: "embed"; content: string }
);

interface BlogData {
	title: string;
	author: string;
	description: string;
	content: ContentBlock[];
	tags: string[];
	thumbnail_path: { link: string };
}

interface ErrorState {
	hasError: boolean;
	title: string;
	reasons: string[];
}

export default function Page(): JSX.Element {
	const params = useParams();
	const router = useRouter();
	const id = params.id as string;

	const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
	const [tags, setTags] = useState<string[]>([]);
	const [title, setTitle] = useState<string>("");
	const [author, setAuthor] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [thumbnail, setThumbnail] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<ErrorState>({
		hasError: false,
		title: "",
		reasons: [],
	});

	useEffect(() => {
		const fetchBlogData = async (): Promise<void> => {
			if (!id) return;

			try {
				// Try to get data from localStorage first
				const storedBlog = localStorage.getItem(`blog-${id}`);
				if (storedBlog) {
					const blogData = JSON.parse(storedBlog) as BlogData;
					initializeBlogData(blogData);
				} else {
					// If not in localStorage, try to fetch from server
					try {
						const response = await axios.get<BlogData>(
							`http://127.0.0.1:4000/blogs/${id}`,
							{ timeout: 10000 },
						);
						initializeBlogData(response.data);
					} catch (serverError) {
						const axiosError = serverError as AxiosError;

						if (axiosError.code === "ECONNREFUSED") {
							setError({
								hasError: true,
								title: "Connection Failed",
								reasons: [
									"The blog server appears to be offline",
									"No saved data found in your browser",
									"Please try again later",
								],
							});
						} else if (
							axiosError.code === "ETIMEDOUT" ||
							axiosError.message?.includes("timeout")
						) {
							setError({
								hasError: true,
								title: "Connection Timeout",
								reasons: [
									"The server took too long to respond",
									"No saved data found in your browser",
									"Please try refreshing the page",
								],
							});
						} else if (axiosError.response?.status === 404) {
							setError({
								hasError: true,
								title: "Blog Not Found",
								reasons: [
									"The requested blog could not be found",
									"It may have been deleted or moved",
									"Please check the blog ID and try again",
								],
							});
						} else {
							setError({
								hasError: true,
								title: "Unable to Load Blog",
								reasons: [
									"No saved data found in your browser",
									"Failed to connect to the blog server",
									"Please try again later",
								],
							});
						}
					}
				}
			} catch (localStorageError) {
				setError({
					hasError: true,
					title: "Data Access Error",
					reasons: [
						"Failed to read saved blog data",
						"There may be an issue with your browser storage",
						"Please try clearing your browser cache",
					],
				});
			} finally {
				setLoading(false);
			}
		};

		fetchBlogData();
	}, [id]);

	const initializeBlogData = (blogData: BlogData): void => {
		const normalizedBlocks = blogData.content.map((block) => {
			const id = generateBlockId();
			if (block.type === "image") {
				return {
					id,
					type: "image" as const,
					content: {
						link:
							typeof block.content === "string"
								? block.content
								: block.content.link,
					},
				};
			}
			return { ...block, id } as ContentBlock;
		});
		setContentBlocks(normalizedBlocks);
		setTags(blogData.tags || []);
		setTitle(blogData.title || "");
		setAuthor(blogData.author || "");
		setDescription(blogData.description || "");
		setThumbnail(blogData.thumbnail_path?.link || "");
	};

	// Rest of the component remains the same...
	const generateBlockId = (): string => {
		return `block_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
	};

	const addBlock = (type: ContentBlock["type"], index: number): void => {
		const newBlock: ContentBlock = (() => {
			switch (type) {
				case "text":
					return { id: generateBlockId(), type, content: "" };
				case "image":
					return { id: generateBlockId(), type, content: { link: "" } };
				case "embed":
					return { id: generateBlockId(), type, content: "" };
			}
		})();

		setContentBlocks((prevBlocks) => {
			const newBlocks = [...prevBlocks];
			newBlocks.splice(index + 1, 0, newBlock);
			return newBlocks;
		});
	};

	const updateBlock = (
		index: number,
		content: string | { link: string },
	): void => {
		setContentBlocks((prevBlocks) => {
			const newBlocks = [...prevBlocks];
			newBlocks[index] = {
				...newBlocks[index],
				content,
			} as ContentBlock;
			return newBlocks;
		});
	};

	const deleteBlock = (index: number): void => {
		setContentBlocks((prevBlocks) => prevBlocks.filter((_, i) => i !== index));
	};

	const handleImageUpload = async (
		index: number,
		event: React.ChangeEvent<HTMLInputElement>,
	): Promise<void> => {
		const file = event.target.files?.[0];
		if (!file) return;

		try {
			const dataUrl = await readFileAsDataURL(file);
			updateBlock(index, { link: dataUrl });
		} catch (error) {
			setError({
				hasError: true,
				title: "Image Upload Failed",
				reasons: [
					"Failed to process the selected image",
					"The file might be too large or in an unsupported format",
					"Please try a different image",
				],
			});
		}
	};

	const readFileAsDataURL = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e: ProgressEvent<FileReader>) =>
				resolve((e.target?.result as string) || "");
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	};

	const handleThumbnailUpload = async (event) => {
		const file = event.target.files[0];
		if (!file) return;

		try {
			const dataUrl = await readFileAsDataURL(file);
			setThumbnail(dataUrl);
		} catch (error) {
			setError({
				hasError: true,
				title: "Thumbnail Upload Failed",
				reasons: [
					"Failed to process the selected thumbnail",
					"The file might be too large or in an unsupported format",
					"Please try a different image",
				],
			});
		}
	};

	const handleSubmit = async () => {
		if (!id) return;

		const filteredTags = [...new Set(tags.filter((tag) => tag.trim() !== ""))];

		const processedBlocks = contentBlocks.map((block) => {
			if (block.type === "image") {
				return {
					...block,
					content: { link: block.content.link },
				};
			}
			return block;
		});

		const blogData = {
			title,
			author,
			description,
			content: processedBlocks,
			tags: filteredTags,
			thumbnail_path: { link: thumbnail },
		};

		try {
			localStorage.setItem(`blog-${id}`, JSON.stringify(blogData));
			return true;
		} catch (error) {
			setError({
				hasError: true,
				title: "Save Failed",
				reasons: [
					"Failed to save blog data to browser storage",
					"You may be in private browsing mode or have limited storage",
					"Try reducing the number of images or clearing browser storage",
				],
			});
			return false;
		}
	};

	const handlePreview = async () => {
		const saved = await handleSubmit();
		if (saved) {
			router.push(`${id}/preview`);
		}
	};

	const handleDiscard = () => {
		if (!id) return;
		try {
			localStorage.removeItem(`blog-${id}`);
			router.push("/manage/blogs");
		} catch (error) {
			setError({
				hasError: true,
				title: "Operation Failed",
				reasons: [
					"Failed to discard changes",
					"There may be an issue with your browser storage",
					"Please try again or restart your browser",
				],
			});
		}
	};

	const addTag = () => {
		setTags((prevTags) => [...prevTags, ""]);
	};

	const updateTag = (index, value) => {
		setTags((prevTags) => {
			const newTags = [...prevTags];
			newTags[index] = value;
			return newTags;
		});
	};

	const removeTag = (index) => {
		setTags((prevTags) => prevTags.filter((_, i) => i !== index));
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	// If there's an error, show the ErrorMessage component
	if (error.hasError) {
		return <ErrorMessage title={error.title} reasons={error.reasons} />;
	}

	return (
		<div className="create-blog">
			<h3 className="title-blog">Enter Title:</h3>
			<input
				type="text"
				id="title"
				name="title"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
			/>
			<h3 className="author-blog">Author</h3>
			<input
				type="text"
				id="author"
				name="author"
				value={author}
				onChange={(e) => setAuthor(e.target.value)}
			/>

			<h3 className="description-blog">Enter Description:</h3>
			<input
				type="text"
				id="description"
				name="description"
				value={description}
				onChange={(e) => setDescription(e.target.value)}
			/>

			<h3 className="thumbnail-blog">Upload Thumbnail:</h3>
			<ThumbnailBlock src={thumbnail} onChange={handleThumbnailUpload} />

			<h3 className="content-blog">Enter Content:</h3>
			<div className="contentformat">
				<div className="content">
					{contentBlocks.map((block, index) => (
						<BlockWrapper
							key={`wrapper-${block.id}`}
							onAddBlock={(type) => addBlock(type, index)}
						>
							{block.type === "text" && (
								<TextBlock
									key={`text-${block.id}`}
									content={block.content}
									onChange={(content) => updateBlock(index, content)}
									onDelete={() => deleteBlock(index)}
								/>
							)}
							{block.type === "image" && (
								<ImageBlock
									key={`image-${block.id}`}
									index={index}
									src={block.content}
									onDelete={() => deleteBlock(index)}
									onChange={(event) => handleImageUpload(index, event)}
								/>
							)}
							{block.type === "embed" && (
								<EmbedBlock
									key={`embed-${block.id}`}
									url={block.content}
									onChange={(content) => updateBlock(index, content)}
									onDelete={() => deleteBlock(index)}
								/>
							)}
						</BlockWrapper>
					))}
				</div>
			</div>

			<h3 className="tags-blog">Enter Tags:</h3>
			<div className="tags-container">
				{tags.map((tag, index) => (
					<div key={`tag-${index}-${tag}`} className="tag-item">
						<input
							type="text"
							value={tag}
							onChange={(e) => updateTag(index, e.target.value)}
							className="tag-input"
						/>
						<button
							type="button"
							onClick={() => removeTag(index)}
							className="remove-tag-button"
						>
							x
						</button>
					</div>
				))}
				<button type="button" onClick={addTag} className="add-tag-button">
					+
				</button>
			</div>

			<div className="submit-blogdiv">
				<button
					type="button"
					onClick={handlePreview}
					className="preview-button"
					id="submit-blog"
				>
					Preview
				</button>
				<button
					type="button"
					onClick={handleDiscard}
					className="discard-button"
					id="submit-blog"
				>
					Discard Changes
				</button>
			</div>
		</div>
	);
}
