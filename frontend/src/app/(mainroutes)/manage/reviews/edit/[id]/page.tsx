"use client";

import type { JSX } from "react";
import type { AxiosError } from "axios";
import BlockWrapper from "@/components/BlockWrapper";
import EmbedBlock from "@/components/EmbedBlock";
import ImageBlock from "@/components/ImageBlock";
import TextBlock from "@/components/TextBlock";
import ThumbnailBlock from "@/components/ThumbnailBlock";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
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

	useEffect(() => {
		const fetchBlogData = async (): Promise<void> => {
			if (!id) return;

			try {
				const storedBlog = localStorage.getItem(`review-${id}`);
				if (storedBlog) {
					const blogData = JSON.parse(storedBlog) as BlogData;
					console.log(blogData);
					initializeBlogData(blogData);
				} else {
					const response = await axios.get<BlogData>(
						`http://127.0.0.1:4000/reviews/${id}`,
					);
					initializeBlogData(response.data);
				}
			} catch (error) {
				console.error("Error fetching review data:", error as AxiosError);
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
			console.log(contentBlocks);
		} catch (error) {
			console.error("Error uploading image:", error);
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
			console.error("Error uploading thumbnail:", error);
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
			localStorage.setItem(`review-${id}`, JSON.stringify(blogData));
			console.log("Blog data saved successfully");
		} catch (error) {
			console.error("Error saving review data:", error);
		}
	};

	const handlePreview = async () => {
		await handleSubmit();
		router.push(`/${id}/preview`);
	};

	const handleDiscard = () => {
		if (!id) return;
		localStorage.removeItem(`review-${id}`);
		router.push("/manage/reviews");
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
