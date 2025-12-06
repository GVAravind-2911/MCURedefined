import { useState, useRef, useEffect, memo, useCallback } from "react";
import type React from "react";
import { ChevronDown, Tag, Check, X } from "lucide-react";

interface TagMultiSelectProps {
	selectedTags: string[];
	tags: string[];
	toggleTag: (tag: string) => void;
	searchQuery: string;
	selectedAuthor: string;
	handleSearch: (query: string, tags: string[], author: string) => void;
}

const TagMultiSelect: React.FC<TagMultiSelectProps> = memo(
	({
		selectedTags,
		tags,
		toggleTag,
		searchQuery,
		selectedAuthor,
		handleSearch,
	}) => {
		const [showTagFilter, setShowTagFilter] = useState(false);
		const tagDropdownRef = useRef<HTMLDivElement>(null);

		// Handle clicks outside dropdown to close it
		useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (
					tagDropdownRef.current &&
					!tagDropdownRef.current.contains(event.target as Node)
				) {
					setShowTagFilter(false);
				}
			};

			document.addEventListener("mousedown", handleClickOutside);
			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}, []);

		const handleClearTags = useCallback(
			(e: React.MouseEvent) => {
				e.stopPropagation();
				handleSearch(searchQuery, [], selectedAuthor);
			},
			[handleSearch, searchQuery, selectedAuthor],
		);

		const handleToggleTag = useCallback(
			(e: React.MouseEvent, tag: string) => {
				e.stopPropagation();
				toggleTag(tag);
			},
			[toggleTag],
		);

		return (
			<div className="relative z-60" ref={tagDropdownRef}>
				<button
					type="button"
					className={`flex items-center justify-between gap-2 h-12 px-4 bg-linear-to-r from-white/5 to-white/2 border border-white/15 rounded-xl text-white text-sm cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/25 hover:shadow-lg hover:shadow-black/20 min-w-[130px] ${selectedTags.length > 0 ? "border-[#ec1d24]/60 bg-linear-to-r from-[#ec1d24]/15 to-[#ec1d24]/5 shadow-[0_0_20px_rgba(236,29,36,0.15)]" : ""}`}
					onClick={() => setShowTagFilter(!showTagFilter)}
					aria-haspopup="menu"
					aria-expanded={showTagFilter}
				>
					<div className="flex items-center gap-2">
						<Tag
							className={`w-4 h-4 ${selectedTags.length > 0 ? "text-[#ec1d24]" : "text-white/50"}`}
						/>
						<span className="truncate">
							{selectedTags.length
								? `${selectedTags.length} Tag${selectedTags.length > 1 ? "s" : ""}`
								: "All Tags"}
						</span>
					</div>
					<ChevronDown
						className={`w-4 h-4 transition-transform duration-300 shrink-0 ${showTagFilter ? "rotate-180 text-[#ec1d24]" : "text-white/50"}`}
					/>
				</button>
				{showTagFilter && (
					<div
						className="absolute top-full left-0 mt-2 min-w-60 max-h-80 overflow-hidden bg-linear-to-b from-[#1f1f1f] to-[#151515] border border-white/20 rounded-xl shadow-[0_15px_50px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)] z-100"
						role="menu"
					>
						{/* Header */}
						<div className="sticky top-0 flex justify-between items-center py-3 px-4 bg-linear-to-r from-[#252525] to-[#1f1f1f] border-b border-white/10">
							<span className="text-sm text-white font-[BentonSansBold]">
								Select Tags
							</span>
							{selectedTags.length > 0 && (
								<button
									className="flex items-center gap-1.5 text-[#ec1d24] text-xs font-[BentonSansBold] transition-colors duration-200 hover:text-[#ff4d4d] px-2 py-1 rounded-md hover:bg-[#ec1d24]/10"
									onClick={handleClearTags}
									type="button"
								>
									<X className="w-3 h-3" />
									Clear All
								</button>
							)}
						</div>

						{/* Tags List */}
						<div className="max-h-[260px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
							{tags.length > 0 ? (
								tags.map((tag, index) => (
									<button
										key={tag}
										onClick={(e) => handleToggleTag(e, tag)}
										className={`flex items-center justify-between w-full py-3 px-4 text-sm text-left transition-all duration-200 border-b border-white/5 last:border-b-0 ${
											selectedTags.includes(tag)
												? "bg-linear-to-r from-[#ec1d24]/20 to-[#ec1d24]/10 text-white"
												: "text-white/70 hover:bg-white/8 hover:text-white"
										}`}
										type="button"
										role="menuitemcheckbox"
										aria-checked={selectedTags.includes(tag)}
									>
										<div className="flex items-center gap-3">
											<div
												className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
													selectedTags.includes(tag)
														? "bg-[#ec1d24] border-[#ec1d24] shadow-[0_0_8px_rgba(236,29,36,0.4)]"
														: "border-white/30 group-hover:border-white/50"
												}`}
											>
												{selectedTags.includes(tag) && (
													<Check
														className="w-3 h-3 text-white"
														strokeWidth={3}
													/>
												)}
											</div>
											<span className="font-[BentonSansRegular]">{tag}</span>
										</div>
									</button>
								))
							) : (
								<div className="py-6 px-4 text-white/40 text-center text-sm">
									No tags available
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		);
	},
);

TagMultiSelect.displayName = "TagMultiSelect";

export default TagMultiSelect;
