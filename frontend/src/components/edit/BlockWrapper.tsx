"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface BlockWrapperProps {
	id: string;
	children: React.ReactNode;
	onAddBlock: (type: "text" | "image" | "embed") => void;
	isDragOverlay?: boolean;
}

const BlockWrapper: React.FC<BlockWrapperProps> = ({
	id,
	children,
	onAddBlock,
	isDragOverlay = false,
}) => {
	const [showAddBlock, setShowAddBlock] = useState<boolean>(false);

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	// Constrain horizontal transform to prevent infinite scrolling
	const constrainedTransform = transform
		? {
				...transform,
				x: 0, // Prevent horizontal movement
			}
		: null;

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(constrainedTransform),
		transition,
		opacity: isDragging ? 0.4 : 1,
		zIndex: isDragging ? 0 : "auto",
		position: "relative",
	};

	const toggleAddBlock = useCallback(() => {
		setShowAddBlock((prev) => !prev);
	}, []);

	const handleAddBlock = useCallback(
		(type: "text" | "image" | "embed") => {
			onAddBlock(type);
			setShowAddBlock(false);
		},
		[onAddBlock],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent, type: "text" | "image" | "embed") => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				handleAddBlock(type);
			}
		},
		[handleAddBlock],
	);

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`relative mb-6 group/block ${isDragging ? "pointer-events-none" : ""}`}
		>
			{/* Drag Handle */}
			<div
				{...attributes}
				{...listeners}
				className={`absolute -left-11 top-1/2 -translate-y-1/2 w-8 h-12 hidden md:flex flex-col items-center justify-center gap-0.5 cursor-grab active:cursor-grabbing transition-opacity duration-200 touch-none z-10 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 ${isDragging ? "opacity-0" : "opacity-0 group-hover/block:opacity-100"}`}
				title="Drag to reorder"
			>
				<span className="w-4 h-0.5 bg-white/40 rounded-full" />
				<span className="w-4 h-0.5 bg-white/40 rounded-full" />
				<span className="w-4 h-0.5 bg-white/40 rounded-full" />
			</div>

			{children}

			{/* Add Block Button & Menu */}
			<div className="absolute left-0 right-0 -bottom-[15px] h-[30px] z-10 flex items-center justify-center">
				{/* Visible Add Button */}
				<button
					type="button"
					onClick={toggleAddBlock}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							toggleAddBlock();
						}
					}}
					className={`w-7 h-7 rounded-full border-2 border-dashed flex items-center justify-center text-lg font-light transition-all duration-300 ${
						showAddBlock
							? "bg-[rgba(236,29,36,0.2)] border-[#ec1d24] text-[#ec1d24] rotate-45"
							: "bg-white/5 border-white/20 text-white/50 opacity-0 group-hover/block:opacity-100 hover:border-[#ec1d24] hover:text-[#ec1d24] hover:bg-[rgba(236,29,36,0.1)]"
					}`}
					aria-label={showAddBlock ? "Close add menu" : "Add new block"}
					aria-expanded={showAddBlock}
				>
					+
				</button>

				{/* Add Block Menu */}
				{showAddBlock && (
					<div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-linear-to-br from-[rgba(50,50,50,0.98)] to-[rgba(30,30,30,0.98)] border border-white/20 rounded-lg p-2 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-[10px] flex flex-col sm:flex-row gap-2">
						<button
							type="button"
							onClick={() => handleAddBlock("text")}
							onKeyDown={(e) => handleKeyDown(e, "text")}
							className="py-2 px-4 bg-white/5 border border-white/10 rounded-md text-white/70 text-sm cursor-pointer transition-all duration-300 whitespace-nowrap hover:bg-[rgba(236,29,36,0.15)] hover:border-[#ec1d24] hover:text-white flex items-center gap-2"
						>
							<span>📝</span> Text
						</button>
						<button
							type="button"
							onClick={() => handleAddBlock("image")}
							onKeyDown={(e) => handleKeyDown(e, "image")}
							className="py-2 px-4 bg-white/5 border border-white/10 rounded-md text-white/70 text-sm cursor-pointer transition-all duration-300 whitespace-nowrap hover:bg-[rgba(236,29,36,0.15)] hover:border-[#ec1d24] hover:text-white flex items-center gap-2"
						>
							<span>🖼️</span> Image
						</button>
						<button
							type="button"
							onClick={() => handleAddBlock("embed")}
							onKeyDown={(e) => handleKeyDown(e, "embed")}
							className="py-2 px-4 bg-white/5 border border-white/10 rounded-md text-white/70 text-sm cursor-pointer transition-all duration-300 whitespace-nowrap hover:bg-[rgba(236,29,36,0.15)] hover:border-[#ec1d24] hover:text-white flex items-center gap-2"
						>
							<span>🔗</span> Embed
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default BlockWrapper;
