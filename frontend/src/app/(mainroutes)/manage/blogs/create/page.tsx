"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import BlockWrapper from "@/components/edit/BlockWrapper";
import EmbedBlock from "@/components/edit/EmbedBlock";
import ImageBlock from "@/components/edit/ImageBlock";
import TextBlock from "@/components/edit/TextBlock";
import ThumbnailBlock from "@/components/edit/ThumbnailBlock";
import "@/styles/editblogpage.css";

type ContentBlock = {
	id: string;
} & (
	| { type: "text"; content: string }
	| { type: "image"; content: { link: string } }
	| { type: "embed"; content: string }
);

interface InitialState {
	contentBlocks: ContentBlock[];
	title: string;
	author: string;
	description: string;
	thumbnail: string;
	tags: string[];
}

const useInitialState = (): InitialState => ({
	contentBlocks: [],
	title: "",
	author: "",
	description: "",
	thumbnail: "",
	tags: [],
});

const CreateBlogPage: React.FC = () => {
	const router = useRouter();
	const initialState = useInitialState();

	const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(
		initialState.contentBlocks,
	);
	const [tags, setTags] = useState<string[]>(initialState.tags);
	const [title, setTitle] = useState<string>(initialState.title);
	const [author, setAuthor] = useState<string>(initialState.author);
	const [description, setDescription] = useState<string>(
		initialState.description,
	);
	const [thumbnail, setThumbnail] = useState<string>(initialState.thumbnail);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const draft = localStorage.getItem("create-blog-draft");
		if (draft) {
			const storedData = JSON.parse(draft);
			setTitle(storedData?.title || "");
			setAuthor(storedData?.author || "");
			setDescription(storedData?.description || "");
			setThumbnail(storedData?.thumbnail_path?.link || "");
			setTags(storedData?.tags || []);

			// Transform content blocks properly
			const transformedContent = storedData.content.map((block) => ({
				id: block.id || generateBlockId(),
				type: block.type,
				content:
					block.type === "image"
						? { link: block.content?.link || block.content || "" }
						: block.content || "",
			}));

			setContentBlocks(
				transformedContent.length > 0
					? transformedContent
					: initialState.contentBlocks,
			);
		}
	}, []);

	const generateBlockId = () =>
		`block-${Math.random().toString(36).substring(2)}`;

	const addBlock = (type: "text" | "image" | "embed", index: number) => {
		const newBlock = (() => {
			switch (type) {
				case "text":
					return { id: generateBlockId(), type, content: "" } as const;
				case "image":
					return {
						id: generateBlockId(),
						type,
						content: { link: "" },
					} as const;
				case "embed":
					return { id: generateBlockId(), type, content: "" } as const;
			}
		})();

		setContentBlocks((prevBlocks) => {
			const newBlocks = [...prevBlocks];
			newBlocks.splice(index + 1, 0, newBlock);
			return newBlocks;
		});
	};

	const updateBlock = (index, content) => {
		setContentBlocks((prevBlocks) => {
			const newBlocks = [...prevBlocks];
			newBlocks[index] = {
				...newBlocks[index],
				content,
			};
			return newBlocks;
		});
	};

	const deleteBlock = (index) => {
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
			setContentBlocks((prevBlocks) => {
				const newBlocks = [...prevBlocks];
				newBlocks[index] = {
					id: newBlocks[index].id,
					type: "image",
					content: { link: dataUrl },
				};
				return newBlocks;
			});
		} catch (error) {
			console.error("Error uploading image:", error);
		}
	};

	const readFileAsDataURL = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target.result as string);
			reader.onerror = (e) => reject(e);
			reader.readAsDataURL(file);
		});
	};

	const handleThumbnailUpload = async (event) => {
		const file = event.target.files[0];
		if (!file) return;

		try {
			const dataUrl = await readFileAsDataURL(file);
			setThumbnail(dataUrl as string);
		} catch (error) {
			console.error("Error uploading thumbnail:", error);
		}
	};

	const handlePreview = () => {
		const blogData = {
			title,
			author,
			description,
			content: contentBlocks.map((block) => block),
			tags: tags.filter((tag) => tag.trim() !== ""),
			thumbnail_path: { link: thumbnail },
			created_at: new Date().toISOString(),
		};

		localStorage.setItem("create-blog-draft", JSON.stringify(blogData));
		router.push("/manage/blogs/create/preview");
	};

	const handleSaveDraft = () => {
		const blogData = {
			title,
			author,
			description,
			content: contentBlocks.map((block) => block),
			tags: tags.filter((tag) => tag.trim() !== ""),
			thumbnail_path: { link: thumbnail },
			created_at: new Date().toISOString(),
		};

		localStorage.setItem("create-blog-draft", JSON.stringify(blogData));
		alert("Draft saved successfully!");
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
					{contentBlocks.length === 0 ? (
						<div className="empty-content">
							<div className="add-block-buttons">
								<button type="button" onClick={() => addBlock("text", -1)}>
									Add Text
								</button>
								<button type="button" onClick={() => addBlock("image", -1)}>
									Add Image
								</button>
								<button type="button" onClick={() => addBlock("embed", -1)}>
									Add Embed
								</button>
							</div>
						</div>
					) : (
						contentBlocks.map((block, index) => (
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
										onChange={handleImageUpload.bind(null, index)}
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
						))
					)}
				</div>
			</div>

			<h3 className="tags-blog">Enter Tags:</h3>
			<div className="tags-container">
				{tags.map((tag, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					<div key={index} className="tag-item">
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
				<button type="button" onClick={handlePreview} id="submit-blog">
					Preview
				</button>
				<button type="button" onClick={handleSaveDraft} id="submit-blog">
					Save Draft
				</button>
			</div>
		</div>
	);
};

export default CreateBlogPage;
