import { useState, useRef, useEffect, memo, useCallback } from "react";
import type React from "react";

interface TagMultiSelectProps {
	selectedTags: string[];
	tags: string[];
	toggleTag: (tag: string) => void;
	searchQuery: string;
	selectedAuthor: string;
	handleSearch: (query: string, tags: string[], author: string) => void;
}

const TagMultiSelect: React.FC<TagMultiSelectProps> = memo(({
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

	const handleClearTags = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
		handleSearch(searchQuery, [], selectedAuthor);
	}, [handleSearch, searchQuery, selectedAuthor]);

	const handleToggleTag = useCallback((e: React.MouseEvent, tag: string) => {
		e.stopPropagation();
		toggleTag(tag);
	}, [toggleTag]);

	return (
		<div className="relative z-10" ref={tagDropdownRef}>
			<button
				className={`bg-white/10 border border-white/20 text-white py-2 sm:py-2.5 px-3 sm:px-5 rounded-full text-sm sm:text-base cursor-pointer flex items-center gap-1.5 sm:gap-2 font-[BentonSansRegular] transition-all duration-200 hover:bg-white/15 active:scale-95 ${selectedTags.length > 0 ? "bg-[#ec1d24]/20 border-[#ec1d24]/60" : ""}`}
				onClick={() => setShowTagFilter(!showTagFilter)}
				type="button"
				aria-haspopup="menu"
				aria-expanded={showTagFilter}
			>
				{selectedTags.length
					? `${selectedTags.length} Tag${selectedTags.length > 1 ? "s" : ""}`
					: "Tags"}
				<svg
					className={`transition-transform duration-300 ${showTagFilter ? "rotate-180" : ""}`}
					xmlns="http://www.w3.org/2000/svg"
					width="12"
					height="12"
					viewBox="0 0 24 24"
				>
					<title>Filter by Tags</title>
					<path fill="currentColor" d="M7 10l5 5 5-5z" />
				</svg>
			</button>
			{showTagFilter && (
				<div className="absolute top-[calc(100%+8px)] left-0 min-w-[180px] sm:min-w-[220px] max-h-[250px] sm:max-h-[300px] overflow-y-auto bg-[#0a0a0a] border border-white/20 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.8)] z-100 animate-[dropdownFade_0.2s_ease] scrollbar-thin scrollbar-thumb-[#ec1d24]/60 scrollbar-track-[#1a1a1a] pt-0" role="menu">
					{tags.length > 0 ? (
						<>
							<div className="flex justify-between items-center py-2 sm:py-2.5 px-3 sm:px-4 border-b border-white/20 bg-[#1a1a1a] text-xs sm:text-sm text-white/80 font-[BentonSansBold]">
								<span>Select tags</span>
								{selectedTags.length > 0 && (
									<button
										className="bg-none border-none text-[#ec1d24] cursor-pointer p-0 text-xs sm:text-sm font-[BentonSansRegular] transition-colors duration-200 hover:text-[#ff4d4d] hover:underline active:scale-95"
										onClick={handleClearTags}
										type="button"
									>
										Clear
									</button>
								)}
							</div>
							{tags.map((tag) => (
								<button
									key={tag}
									onClick={(e) => handleToggleTag(e, tag)}
									className={`flex items-center w-full text-left py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base border-none cursor-pointer border-b border-b-white/10 transition-all duration-200 ${selectedTags.includes(tag) ? "bg-[#ec1d24] text-white font-[BentonSansBold]" : "bg-transparent text-white/90 hover:bg-white/10 hover:text-white active:bg-white/15"}`}
									type="button"
									role="menuitemcheckbox"
									aria-checked={selectedTags.includes(tag)}
								>
									<span className={`flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 border rounded mr-2 sm:mr-2.5 transition-all duration-200 ${selectedTags.includes(tag) ? "bg-white border-white" : "border-white/50 bg-transparent"}`}>
										{selectedTags.includes(tag) && (
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												width="14"
												height="14"
											>
												<title>Selected</title>
												<path
													fill="#ec1d24"
													d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
												/>
											</svg>
										)}
									</span>
									{tag}
								</button>
							))}
						</>
					) : (
						<div className="py-3 px-4 text-white/50 text-center italic">No tags available</div>
					)}
				</div>
			)}
		</div>
	);
});

TagMultiSelect.displayName = "TagMultiSelect";

export default TagMultiSelect;
