"use client";

import { useState, useEffect, useCallback, memo } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import BlockWrapper from "@/components/edit/BlockWrapper";
import EmbedBlock from "@/components/edit/EmbedBlock";
import ImageBlock from "@/components/edit/ImageBlock";
import TextBlock from "@/components/edit/TextBlock";
import ThumbnailBlock from "@/components/edit/ThumbnailBlock";
import type { ContentBlock, ContentConfig, ContentData } from "@/types/ContentTypes";
import {
	generateBlockId,
	readFileAsDataURL,
	getDraftStorageKey,
	createContentBlock,
	normalizeContentBlocks,
} from "@/lib/content/utils";
import { authClient } from "@/lib/auth/auth-client";
import "@/styles/editblogpage.css";

interface ContentEditorProps {
	config: ContentConfig;
	mode: "create" | "edit";
	id?: string;
	initialData?: ContentData;
}

// Memoized Tag Item component
const TagItem = memo(
	({
		tag,
		index,
		onUpdate,
		onRemove,
	}: {
		tag: string;
		index: number;
		onUpdate: (index: number, value: string) => void;
		onRemove: (index: number) => void;
	}) => (
		<div className="tag-item">
			<input
				type="text"
				value={tag}
				onChange={(e) => onUpdate(index, e.target.value)}
				className="tag-input"
				placeholder="Enter tag..."
				aria-label={`Tag ${index + 1}`}
			/>
			<button
				type="button"
				onClick={() => onRemove(index)}
				className="remove-tag-button"
				aria-label="Remove tag"
			>
				×
			</button>
		</div>
	),
);

TagItem.displayName = "TagItem";

export default function ContentEditor({
	config,
	mode,
	id,
	initialData,
}: ContentEditorProps): React.ReactElement {
	const router = useRouter();
	const storageKey = getDraftStorageKey(config, mode === "edit" ? id : undefined);
	const { data: session } = authClient.useSession();

	const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
	const [tags, setTags] = useState<string[]>([]);
	const [title, setTitle] = useState("");
	const [author, setAuthor] = useState("");
	const [authorId, setAuthorId] = useState<string | undefined>(undefined);
	const [description, setDescription] = useState("");
	const [thumbnail, setThumbnail] = useState<{ link: string; key?: string }>({ link: "", key: "" });

	// Set author from session when available
	useEffect(() => {
		if (session?.user && mode === "create") {
			// For new content, always use the logged-in user as author
			setAuthor(session.user.displayUsername || session.user.name || "");
			setAuthorId(session.user.id);
		}
	}, [session, mode]);

	// Load data on mount
	useEffect(() => {
		// If we have initial data (edit mode with fetched data), use it
		if (initialData) {
			setTitle(initialData.title || "");
			setAuthor(initialData.author || "");
			setAuthorId(initialData.author_id);
			setDescription(initialData.description || "");
			setThumbnail({
				link: initialData.thumbnail_path?.link || "",
				key: initialData.thumbnail_path?.key || ""
			});
			setTags(initialData.tags || []);
			setContentBlocks(normalizeContentBlocks(initialData.content || []));
			return;
		}

		// Otherwise, try to load from localStorage
		const draft = localStorage.getItem(storageKey);
		if (draft) {
			try {
				const storedData = JSON.parse(draft) as ContentData;
				setTitle(storedData?.title || "");
				// Don't override author from draft if session is available in create mode
				if (mode !== "create" || !session?.user) {
					setAuthor(storedData?.author || "");
					setAuthorId(storedData?.author_id);
				}
				setDescription(storedData?.description || "");
				setThumbnail({
					link: storedData?.thumbnail_path?.link || "",
					key: storedData?.thumbnail_path?.key || ""
				});
				setTags(storedData?.tags || []);
				setContentBlocks(normalizeContentBlocks(storedData?.content || []));
			} catch (error) {
				console.error("Error loading draft:", error);
			}
		}
	}, [initialData, storageKey, mode, session]);

	const addBlock = useCallback(
		(type: ContentBlock["type"], index: number) => {
			const newBlock = createContentBlock(type);
			setContentBlocks((prev) => {
				const newBlocks = [...prev];
				newBlocks.splice(index + 1, 0, newBlock);
				return newBlocks;
			});
		},
		[],
	);

	const updateBlock = useCallback(
		(index: number, content: string | { link: string }) => {
			setContentBlocks((prev) => {
				const newBlocks = [...prev];
				newBlocks[index] = { ...newBlocks[index], content } as ContentBlock;
				return newBlocks;
			});
		},
		[],
	);

	const deleteBlock = useCallback((index: number) => {
		setContentBlocks((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const handleImageUpload = useCallback(
		async (index: number, event: ChangeEvent<HTMLInputElement>): Promise<void> => {
			const file = event.target.files?.[0];
			if (!file) return;

			try {
				const dataUrl = await readFileAsDataURL(file);
				setContentBlocks((prev) => {
					const newBlocks = [...prev];
					newBlocks[index] = {
						id: newBlocks[index].id,
						type: "image",
						// When uploading a new image, clear the key as this is a new base64 image
						content: { link: dataUrl, key: "" },
					};
					return newBlocks;
				});
			} catch (error) {
				console.error("Error uploading image:", error);
			}
		},
		[],
	);

	const handleThumbnailUpload = useCallback(
		async (event: ChangeEvent<HTMLInputElement> | { target: { files: File[] } }) => {
			const target = event.target as { files?: File[] | FileList | null };
			const file = target.files?.[0];
			if (!file) return;

			try {
				const dataUrl = await readFileAsDataURL(file);
				// When uploading a new image, clear the key as this is a new base64 image
				setThumbnail({ link: dataUrl, key: "" });
			} catch (error) {
				console.error("Error uploading thumbnail:", error);
			}
		},
		[],
	);

	const getContentData = useCallback(
		(): ContentData => ({
			title,
			author,
			author_id: authorId,
			description,
			content: contentBlocks,
			tags: tags.filter((tag) => tag.trim() !== ""),
			thumbnail_path: thumbnail,
			created_at: new Date().toISOString(),
		}),
		[title, author, authorId, description, contentBlocks, tags, thumbnail],
	);

	const handlePreview = useCallback(() => {
		localStorage.setItem(storageKey, JSON.stringify(getContentData()));
		if (mode === "edit" && id) {
			router.push(`${config.managePath}/edit/${id}/preview`);
		} else {
			router.push(`${config.managePath}/create/preview`);
		}
	}, [getContentData, router, storageKey, mode, id, config.managePath]);

	const handleSaveDraft = useCallback(() => {
		localStorage.setItem(storageKey, JSON.stringify(getContentData()));
		alert("Draft saved successfully!");
	}, [getContentData, storageKey]);

	const handleDiscard = useCallback(() => {
		try {
			localStorage.removeItem(storageKey);
			router.push(config.managePath);
		} catch (error) {
			console.error("Error discarding:", error);
		}
	}, [storageKey, router, config.managePath]);

	const addTag = useCallback(() => {
		setTags((prev) => [...prev, ""]);
	}, []);

	const updateTag = useCallback((index: number, value: string) => {
		setTags((prev) => {
			const newTags = [...prev];
			newTags[index] = value;
			return newTags;
		});
	}, []);

	const removeTag = useCallback((index: number) => {
		setTags((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const placeholderPrefix = config.singularName;

	return (
		<div className="create-blog">
			<section>
				<h3 className="title-blog">Enter Title:</h3>
				<input
					type="text"
					id="title"
					name="title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder={`Enter your ${placeholderPrefix} title...`}
				/>
			</section>

			<section>
				<h3 className="author-blog">Author</h3>
				<div className="author-display">
					{session?.user?.image && (
						<img 
							src={session.user.image} 
							alt={author} 
							className="author-avatar-small"
						/>
					)}
					<span className="author-name-display">{author || "Loading..."}</span>
				</div>
			</section>

			<section>
				<h3 className="description-blog">Enter Description:</h3>
				<input
					type="text"
					id="description"
					name="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder={`Brief description of your ${placeholderPrefix}...`}
				/>
			</section>

			<section>
				<h3 className="thumbnail-blog">Upload Thumbnail:</h3>
				<ThumbnailBlock src={thumbnail.link} onChange={handleThumbnailUpload} />
			</section>

			<section>
				<h3 className="content-blog">Enter Content:</h3>
				<div className="contentformat">
					<div className="content">
						{contentBlocks.length === 0 ? (
							<div className="empty-content">
								<div className="add-block-buttons">
									<button type="button" onClick={() => addBlock("text", -1)}>
										📝 Add Text
									</button>
									<button type="button" onClick={() => addBlock("image", -1)}>
										🖼️ Add Image
									</button>
									<button type="button" onClick={() => addBlock("embed", -1)}>
										🔗 Add Embed
									</button>
								</div>
							</div>
						) : (
							contentBlocks.map((block, index) => (
								<BlockWrapper
									key={block.id}
									onAddBlock={(type) => addBlock(type, index)}
								>
									{block.type === "text" && (
										<TextBlock
											content={block.content}
											onChange={(content) => updateBlock(index, content)}
											onDelete={() => deleteBlock(index)}
										/>
									)}
									{block.type === "image" && (
										<ImageBlock
											index={index}
											src={block.content}
											onDelete={() => deleteBlock(index)}
											onChange={(e) => handleImageUpload(index, e)}
										/>
									)}
									{block.type === "embed" && (
										<EmbedBlock
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
			</section>

			<section>
				<h3 className="tags-blog">Enter Tags:</h3>
				<div className="tags-container">
					{tags.map((tag, index) => (
						<TagItem
							key={`tag-${index}`}
							tag={tag}
							index={index}
							onUpdate={updateTag}
							onRemove={removeTag}
						/>
					))}
					<button
						type="button"
						onClick={addTag}
						className="add-tag-button"
						aria-label="Add new tag"
					>
						+
					</button>
				</div>
			</section>

			<div className="submit-blogdiv">
				<button
					type="button"
					onClick={handlePreview}
					id="submit-blog"
					className="preview-button"
				>
					Preview
				</button>
				{mode === "create" ? (
					<button type="button" onClick={handleSaveDraft} id="submit-blog">
						Save Draft
					</button>
				) : (
					<button
						type="button"
						onClick={handleDiscard}
						className="discard-button"
						id="submit-blog"
					>
						Discard Changes
					</button>
				)}
			</div>
		</div>
	);
}
