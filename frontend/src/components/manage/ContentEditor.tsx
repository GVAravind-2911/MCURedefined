"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
	type DragStartEvent,
	DragOverlay,
} from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import BlockWrapper from "@/components/edit/BlockWrapper";
import EmbedBlock from "@/components/edit/EmbedBlock";
import ImageBlock from "@/components/edit/ImageBlock";
import TextBlock from "@/components/edit/TextBlock";
import ThumbnailBlock from "@/components/edit/ThumbnailBlock";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import type { ContentBlock, ContentConfig, ContentData } from "@/types/ContentTypes";
import {
	readFileAsDataURL,
	getDraftStorageKey,
	createContentBlock,
	normalizeContentBlocks,
} from "@/lib/content/utils";
import { authClient } from "@/lib/auth/auth-client";
import { useUndoRedo } from "@/hooks/useUndoRedo";

interface ContentEditorProps {
	config: ContentConfig;
	mode: "create" | "edit";
	id?: string;
	initialData?: ContentData;
}

// Undo/Redo floating controls - only shows for structural block changes (add/delete/reorder)
const UndoRedoControls = memo(({ 
	canUndo, 
	canRedo, 
	onUndo, 
	onRedo 
}: { 
	canUndo: boolean; 
	canRedo: boolean; 
	onUndo: () => void; 
	onRedo: () => void; 
}) => {
	if (!canUndo && !canRedo) return null;
	
	return (
		<div className="fixed bottom-6 left-6 z-40 flex items-center gap-1 py-1 px-2 bg-linear-to-br from-[rgba(50,50,50,0.95)] to-[rgba(30,30,30,0.95)] border border-white/20 rounded-lg shadow-lg backdrop-blur-sm">
			<button
				type="button"
				onClick={onUndo}
				disabled={!canUndo}
				className={`p-2 rounded transition-all duration-200 ${
					canUndo 
						? "text-white/80 hover:bg-white/10 hover:text-white" 
						: "text-white/30 cursor-not-allowed"
				}`}
				title="Undo block add/delete/move"
			>
				<span className="text-lg">↩</span>
			</button>
			<button
				type="button"
				onClick={onRedo}
				disabled={!canRedo}
				className={`p-2 rounded transition-all duration-200 ${
					canRedo 
						? "text-white/80 hover:bg-white/10 hover:text-white" 
						: "text-white/30 cursor-not-allowed"
				}`}
				title="Redo block add/delete/move"
			>
				<span className="text-lg">↪</span>
			</button>
			<span className="text-xs text-white/40 px-2 border-l border-white/10">Block Structure</span>
		</div>
	);
});

UndoRedoControls.displayName = "UndoRedoControls";

// Auto-save status indicator
const AutoSaveIndicator = memo(({ status }: { status: "idle" | "saving" | "saved" }) => {
	if (status === "idle") return null;
	
	return (
		<div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 py-2 px-4 bg-linear-to-br from-[rgba(50,50,50,0.95)] to-[rgba(30,30,30,0.95)] border border-white/20 rounded-full shadow-lg backdrop-blur-sm">
			{status === "saving" ? (
				<>
					<span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
					<span className="text-sm text-white/70">Saving draft...</span>
				</>
			) : (
				<>
					<span className="w-2 h-2 bg-green-400 rounded-full" />
					<span className="text-sm text-white/70">Draft saved</span>
				</>
			)}
		</div>
	);
});

AutoSaveIndicator.displayName = "AutoSaveIndicator";

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
		<div className="relative flex items-center bg-white/5 border border-white/10 rounded-full py-1 pl-4 pr-2 transition-all duration-300 hover:border-[#ec1d24]">
			<input
				type="text"
				value={tag}
				onChange={(e) => onUpdate(index, e.target.value)}
				className="bg-transparent border-none text-white/90 text-sm outline-none min-w-20 max-w-[150px] placeholder:text-white/50"
				placeholder="Enter tag..."
				aria-label={`Tag ${index + 1}`}
			/>
			<button
				type="button"
				onClick={() => onRemove(index)}
				className="flex items-center justify-center w-[22px] h-[22px] bg-white/10 border-none text-white/70 text-xs cursor-pointer rounded-full ml-2 transition-all duration-300 hover:bg-red-500/40 hover:text-red-400"
				aria-label="Remove tag"
			>
				×
			</button>
		</div>
	),
);

TagItem.displayName = "TagItem";

// Word count helper
const getWordCount = (text: string): number => {
	const stripped = text.replace(/<[^>]*>/g, "").trim();
	if (!stripped) return 0;
	return stripped.split(/\s+/).length;
};

export default function ContentEditor({
	config,
	mode,
	id,
	initialData,
}: ContentEditorProps): React.ReactElement {
	const router = useRouter();
	const storageKey = getDraftStorageKey(config, mode === "edit" ? id : undefined);
	const { data: session } = authClient.useSession();

	// Use undo/redo for content blocks
	const {
		state: contentBlocks,
		setState: setContentBlocks,
		undo: undoBlocks,
		redo: redoBlocks,
		canUndo: canUndoBlocks,
		canRedo: canRedoBlocks,
	} = useUndoRedo<ContentBlock[]>([], { maxHistory: 30, debounceMs: 0 });

	const [tags, setTags] = useState<string[]>([]);
	const [title, setTitle] = useState("");
	const [author, setAuthor] = useState("");
	const [authorId, setAuthorId] = useState<string | undefined>(undefined);
	const [description, setDescription] = useState("");
	const [thumbnail, setThumbnail] = useState<{ link: string; key?: string }>({ link: "", key: "" });
	
	// UI state
	const [showDiscardModal, setShowDiscardModal] = useState(false);
	const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
	const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
	const [activeId, setActiveId] = useState<string | null>(null);
	const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const initialLoadDoneRef = useRef(false);

	// DnD sensors
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	// Global keyboard shortcuts for undo/redo
	useEffect(() => {
		const handleGlobalKeyDown = (e: KeyboardEvent) => {
			// Only handle if not in a text input/textarea
			const target = e.target as HTMLElement;
			const isTextInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
			
			if ((e.ctrlKey || e.metaKey) && !isTextInput) {
				if (e.key === "z" && e.shiftKey) {
					e.preventDefault();
					redoBlocks();
				} else if (e.key === "z") {
					e.preventDefault();
					undoBlocks();
				} else if (e.key === "y") {
					e.preventDefault();
					redoBlocks();
				}
			}
		};

		window.addEventListener("keydown", handleGlobalKeyDown);
		return () => window.removeEventListener("keydown", handleGlobalKeyDown);
	}, [undoBlocks, redoBlocks]);

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
		if (initialLoadDoneRef.current) return;
		
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
			// Skip history for initial load
			setContentBlocks(normalizeContentBlocks(initialData.content || []), true);
			initialLoadDoneRef.current = true;
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
				// Skip history for localStorage load
				setContentBlocks(normalizeContentBlocks(storedData?.content || []), true);
			} catch (error) {
				console.error("Error loading draft:", error);
			}
		}
		initialLoadDoneRef.current = true;
	}, [initialData, storageKey, mode, session]);

	// Block-level undo/redo is only for structural changes (add, delete, reorder)
	// Content edits within blocks (text, embed URL) are handled by each block's internal undo/redo
	const addBlock = useCallback(
		(type: ContentBlock["type"], index: number) => {
			const newBlock = createContentBlock(type);
			// Structural change - push to block history
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
			// Content update - skip block history (each block handles its own undo/redo)
			setContentBlocks((prev) => {
				const newBlocks = [...prev];
				newBlocks[index] = { ...newBlocks[index], content } as ContentBlock;
				return newBlocks;
			}, true); // skipHistory = true for content edits
		},
		[],
	);

	const deleteBlock = useCallback((index: number) => {
		// Structural change - push to block history
		setContentBlocks((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const handleImageUpload = useCallback(
		async (index: number, event: ChangeEvent<HTMLInputElement>): Promise<void> => {
			const file = event.target.files?.[0];
			if (!file) return;

			try {
				const dataUrl = await readFileAsDataURL(file);
				// Content update within block - skip block history
				setContentBlocks((prev) => {
					const newBlocks = [...prev];
					newBlocks[index] = {
						id: newBlocks[index].id,
						type: "image",
						// When uploading a new image, clear the key as this is a new base64 image
						content: { link: dataUrl, key: "" },
					};
					return newBlocks;
				}, true); // skipHistory = true for content edits
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

	// Auto-save effect
	useEffect(() => {
		if (autoSaveTimeoutRef.current) {
			clearTimeout(autoSaveTimeoutRef.current);
		}

		// Only auto-save if there's content
		if (title || description || contentBlocks.length > 0) {
			setAutoSaveStatus("saving");
			autoSaveTimeoutRef.current = setTimeout(() => {
				localStorage.setItem(storageKey, JSON.stringify(getContentData()));
				setAutoSaveStatus("saved");
				// Reset to idle after 2 seconds
				setTimeout(() => setAutoSaveStatus("idle"), 2000);
			}, 1000);
		}

		return () => {
			if (autoSaveTimeoutRef.current) {
				clearTimeout(autoSaveTimeoutRef.current);
			}
		};
	}, [title, description, contentBlocks, tags, thumbnail, storageKey, getContentData]);

	// Validate required fields
	const validateFields = useCallback(() => {
		const errors: Record<string, string> = {};
		if (!title.trim()) errors.title = "Title is required";
		if (!thumbnail.link) errors.thumbnail = "Thumbnail is required";
		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	}, [title, thumbnail]);

	// Handle drag start
	const handleDragStart = useCallback((event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	}, []);

	// Handle drag end for reordering - structural change, pushes to block history
	const handleDragEnd = useCallback((event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);

		if (over && active.id !== over.id) {
			// Structural change - push to block history (no skipHistory flag)
			setContentBlocks((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over.id);
				return arrayMove(items, oldIndex, newIndex);
			});
		}
	}, []);

	const handlePreview = useCallback(() => {
		if (!validateFields()) return;
		localStorage.setItem(storageKey, JSON.stringify(getContentData()));
		if (mode === "edit" && id) {
			router.push(`${config.managePath}/edit/${id}/preview`);
		} else {
			router.push(`${config.managePath}/create/preview`);
		}
	}, [getContentData, router, storageKey, mode, id, config.managePath, validateFields]);

	const handleSaveDraft = useCallback(() => {
		localStorage.setItem(storageKey, JSON.stringify(getContentData()));
		setAutoSaveStatus("saved");
		setTimeout(() => setAutoSaveStatus("idle"), 2000);
	}, [getContentData, storageKey]);

	const handleDiscard = useCallback(() => {
		setShowDiscardModal(true);
	}, []);

	const confirmDiscard = useCallback(() => {
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

	// Calculate total word count from all text blocks
	const totalWordCount = contentBlocks
		.filter((block) => block.type === "text")
		.reduce((acc, block) => acc + getWordCount(block.content as string), 0);

	return (
		<>
			<div className="relative max-w-[1000px] w-full mx-auto p-4 sm:p-6 md:p-8 pt-8 md:pt-12 flex flex-col gap-6 md:gap-8 md:pl-14">
				{/* Title Section */}
				<section>
					<h3 className="text-white/90 mb-3 font-bold text-base md:text-lg tracking-wide flex items-center gap-2 before:content-[''] before:w-1 before:h-[1.2em] before:bg-linear-to-b before:from-[#ec1d24] before:to-[#d01c22] before:rounded-sm">
						Title <span className="text-[#ec1d24]">*</span>
					</h3>
					<input
						type="text"
						id="title"
						name="title"
						value={title}
						onChange={(e) => {
							setTitle(e.target.value);
							if (validationErrors.title) {
								setValidationErrors((prev) => ({ ...prev, title: "" }));
							}
						}}
						placeholder={`Enter your ${placeholderPrefix} title...`}
						className={`w-full py-3 md:py-4 px-4 md:px-5 bg-[rgba(30,30,30,0.8)] border rounded-lg text-white/90 text-xl md:text-3xl font-bold transition-all duration-300 outline-none placeholder:text-white/50 focus:border-[#ec1d24] focus:shadow-[0_0_0_3px_rgba(236,29,36,0.15)] focus:bg-[rgba(40,40,40,0.6)] ${
							validationErrors.title ? "border-red-500" : "border-white/10"
						}`}
					/>
					{validationErrors.title && (
						<p className="mt-2 text-sm text-red-400 flex items-center gap-1">
							<span>⚠️</span> {validationErrors.title}
						</p>
					)}
					<p className="mt-2 text-xs text-white/40">{title.length} characters</p>
				</section>

				{/* Author Section */}
				<section>
					<h3 className="text-white/90 mb-3 font-bold text-base md:text-lg tracking-wide flex items-center gap-2 before:content-[''] before:w-1 before:h-[1.2em] before:bg-linear-to-b before:from-[#ec1d24] before:to-[#d01c22] before:rounded-sm">
						Author
					</h3>
					<div className="flex items-center gap-3 py-3 md:py-4 px-4 md:px-5 bg-[rgba(30,30,30,0.8)] border border-white/10 rounded-lg max-w-full md:max-w-[700px]">
						{session?.user?.image && (
							<img 
								src={session.user.image} 
								alt={author} 
								className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-[#ec1d24] object-cover"
							/>
						)}
						<span className="text-base md:text-lg text-white/90">{author || "Loading..."}</span>
					</div>
				</section>

				{/* Description Section */}
				<section>
					<h3 className="text-white/90 mb-3 font-bold text-base md:text-lg tracking-wide flex items-center gap-2 before:content-[''] before:w-1 before:h-[1.2em] before:bg-linear-to-b before:from-[#ec1d24] before:to-[#d01c22] before:rounded-sm">
						Description
					</h3>
					<textarea
						id="description"
						name="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder={`Brief description of your ${placeholderPrefix}...`}
						rows={3}
						className="w-full py-3 md:py-4 px-4 md:px-5 bg-[rgba(30,30,30,0.8)] border border-white/10 rounded-lg text-white/90 text-sm md:text-base font-[BentonSansRegular] leading-relaxed transition-all duration-300 outline-none placeholder:text-white/50 focus:border-[#ec1d24] focus:shadow-[0_0_0_3px_rgba(236,29,36,0.15)] focus:bg-[rgba(40,40,40,0.6)] resize-none"
					/>
					<p className="mt-2 text-xs text-white/40">{getWordCount(description)} words</p>
				</section>

				{/* Thumbnail Section */}
				<section>
					<h3 className="text-white/90 mb-3 font-bold text-base md:text-lg tracking-wide flex items-center gap-2 before:content-[''] before:w-1 before:h-[1.2em] before:bg-linear-to-b before:from-[#ec1d24] before:to-[#d01c22] before:rounded-sm">
						Thumbnail <span className="text-[#ec1d24]">*</span>
					</h3>
					<p className="text-xs text-white/50 mb-3">Recommended size: 1200 × 630 pixels (16:9 ratio)</p>
					<div className={validationErrors.thumbnail ? "ring-2 ring-red-500 rounded-xl" : ""}>
						<ThumbnailBlock src={thumbnail.link} onChange={handleThumbnailUpload} />
					</div>
					{validationErrors.thumbnail && (
						<p className="mt-2 text-sm text-red-400 flex items-center gap-1">
							<span>⚠️</span> {validationErrors.thumbnail}
						</p>
					)}
				</section>

				{/* Content Section */}
				<section>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
						<h3 className="text-white/90 font-bold text-base md:text-lg tracking-wide flex items-center gap-2 before:content-[''] before:w-1 before:h-[1.2em] before:bg-linear-to-b before:from-[#ec1d24] before:to-[#d01c22] before:rounded-sm">
							Content
						</h3>
						{totalWordCount > 0 && (
							<span className="text-xs text-white/50 bg-white/5 py-1 px-3 rounded-full">
								{totalWordCount} words total
							</span>
						)}
					</div>
					<div className="mb-4">
						<div className="flex flex-col gap-6">
							{contentBlocks.length === 0 ? (
								<div className="p-8 md:p-12 bg-[rgba(40,40,40,0.4)] border border-white/10 rounded-xl">
									<p className="text-center text-white/50 mb-6 text-sm">Start building your content by adding blocks</p>
									<div className="flex justify-center items-center gap-3 md:gap-4 flex-wrap">
										<button 
											type="button" 
											onClick={() => addBlock("text", -1)}
											className="py-3 md:py-4 px-6 md:px-8 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm md:text-base cursor-pointer transition-all duration-300 flex items-center gap-2 hover:bg-[rgba(236,29,36,0.15)] hover:border-[#ec1d24] hover:text-white hover:-translate-y-0.5"
										>
											📝 Add Text
										</button>
										<button 
											type="button" 
											onClick={() => addBlock("image", -1)}
											className="py-3 md:py-4 px-6 md:px-8 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm md:text-base cursor-pointer transition-all duration-300 flex items-center gap-2 hover:bg-[rgba(236,29,36,0.15)] hover:border-[#ec1d24] hover:text-white hover:-translate-y-0.5"
										>
											🖼️ Add Image
										</button>
										<button 
											type="button" 
											onClick={() => addBlock("embed", -1)}
											className="py-3 md:py-4 px-6 md:px-8 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm md:text-base cursor-pointer transition-all duration-300 flex items-center gap-2 hover:bg-[rgba(236,29,36,0.15)] hover:border-[#ec1d24] hover:text-white hover:-translate-y-0.5"
										>
											🔗 Add Embed
										</button>
									</div>
								</div>
							) : (
								<div className="relative -ml-12 pl-12">
									<DndContext
										sensors={sensors}
										collisionDetection={closestCenter}
										onDragStart={handleDragStart}
										onDragEnd={handleDragEnd}
										modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
									>
									<SortableContext
										items={contentBlocks.map((block) => block.id)}
										strategy={verticalListSortingStrategy}
									>
										{contentBlocks.map((block, index) => (
											<BlockWrapper
												key={block.id}
												id={block.id}
												onAddBlock={(type) => addBlock(type, index)}
												isDragOverlay={false}
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
										))}
									</SortableContext>
									<DragOverlay dropAnimation={null}>
										{activeId ? (() => {
											const activeBlock = contentBlocks.find(b => b.id === activeId);
											if (!activeBlock) return null;
											return (
												<div className="bg-[rgba(40,40,40,0.95)] border-2 border-[#ec1d24] rounded-xl p-4 shadow-2xl opacity-90">
													<div className="text-white/70 text-sm font-medium uppercase tracking-wide">
														{activeBlock.type === "text" && "📝 Text Block"}
														{activeBlock.type === "image" && "🖼️ Image Block"}
														{activeBlock.type === "embed" && "🔗 Embed Block"}
													</div>
												</div>
											);
										})() : null}
									</DragOverlay>
								</DndContext>
								</div>
							)}
						</div>
					</div>
				</section>

				{/* Tags Section */}
				<section>
					<h3 className="text-white/90 mb-2 font-bold text-base md:text-lg tracking-wide flex items-center gap-2 before:content-[''] before:w-1 before:h-[1.2em] before:bg-linear-to-b before:from-[#ec1d24] before:to-[#d01c22] before:rounded-sm">
						Tags
					</h3>
					<p className="text-xs text-white/50 mb-3">Add tags to help readers find your content</p>
					<div className="flex flex-wrap gap-3 items-center">
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
							className="flex items-center justify-center w-8 h-8 bg-white/5 border-2 border-dashed border-white/20 text-white/50 text-xl cursor-pointer rounded-full transition-all duration-300 hover:border-[#ec1d24] hover:text-[#ec1d24] hover:bg-[rgba(236,29,36,0.15)]"
							aria-label="Add new tag"
						>
							+
						</button>
					</div>
				</section>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 py-6 md:py-8 border-t border-white/10 mt-4">
					<button
						type="button"
						onClick={handlePreview}
						className="py-3 md:py-4 px-8 md:px-10 bg-linear-to-br from-[#ec1d24] to-[#d01c22] border-none rounded-lg text-white font-bold text-base md:text-lg cursor-pointer transition-all duration-300 uppercase tracking-wider shadow-[0_4px_15px_rgba(236,29,36,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(236,29,36,0.4)] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-[#ec1d24] focus-visible:outline-offset-2"
					>
						Preview
					</button>
					{mode === "create" ? (
						<button 
							type="button" 
							onClick={handleSaveDraft}
							className="py-3 md:py-4 px-8 md:px-10 bg-white/5 border border-white/20 rounded-lg text-white font-bold text-base md:text-lg cursor-pointer transition-all duration-300 uppercase tracking-wider hover:bg-white/10 hover:border-white/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] focus-visible:outline-2 focus-visible:outline-[#ec1d24] focus-visible:outline-offset-2"
						>
							Save Draft
						</button>
					) : (
						<button
							type="button"
							onClick={handleDiscard}
							className="py-3 md:py-4 px-8 md:px-10 bg-white/5 border border-white/20 rounded-lg text-white font-bold text-base md:text-lg cursor-pointer transition-all duration-300 uppercase tracking-wider hover:bg-white/10 hover:border-white/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] focus-visible:outline-2 focus-visible:outline-[#ec1d24] focus-visible:outline-offset-2"
						>
							Discard Changes
						</button>
					)}
				</div>
			</div>

			{/* Auto-save indicator */}
			<AutoSaveIndicator status={autoSaveStatus} />

			{/* Block undo/redo controls */}
			<UndoRedoControls
				canUndo={canUndoBlocks}
				canRedo={canRedoBlocks}
				onUndo={undoBlocks}
				onRedo={redoBlocks}
			/>

			{/* Discard confirmation modal */}
			<ConfirmationModal
				isOpen={showDiscardModal}
				onClose={() => setShowDiscardModal(false)}
				onConfirm={confirmDiscard}
				title="Discard Changes?"
				message="Are you sure you want to discard all changes? This action cannot be undone."
				confirmText="Discard"
				cancelText="Keep Editing"
				variant="danger"
			/>
		</>
	);
}
