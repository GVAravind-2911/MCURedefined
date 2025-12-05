import { useState, useRef, useEffect, memo, useCallback } from "react";
import { PiTag } from "react-icons/pi";

interface ProfileTagMultiSelectProps {
	selectedTags: string[];
	availableTags: string[];
	onChange: (tags: string[]) => void;
}

const TagMultiSelect = memo(({
	selectedTags,
	availableTags,
	onChange,
}: ProfileTagMultiSelectProps) => {
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

	return (
		<div className="relative z-10 max-md:w-full" ref={tagDropdownRef}>
			<button
				className={`bg-white/10 border border-white/20 text-white py-2.5 px-5 rounded-[20px] cursor-pointer flex items-center gap-2 font-[BentonSansRegular] transition-all duration-200 hover:bg-white/15 max-md:w-full max-md:justify-between ${selectedTags.length > 0 ? "bg-[#ec1d24]/20 border-[#ec1d24]/60" : ""}`}
				onClick={() => setShowTagFilter(!showTagFilter)}
				type="button"
				aria-haspopup="true"
				aria-expanded={showTagFilter}
			>
				{selectedTags.length > 0
					? `Tags (${selectedTags.length})`
					: "Filter by Tags"}
				<svg
					className={`transition-transform duration-200 ${showTagFilter ? "rotate-180" : ""}`}
					xmlns="http://www.w3.org/2000/svg"
					width="12"
					height="12"
					viewBox="0 0 24 24"
				>
					<title>Arrow Down</title>
					<path fill="currentColor" d="M7 10l5 5 5-5z" />
				</svg>
			</button>

			{showTagFilter && (
				<div className="absolute top-full left-0 mt-2 bg-[#1a1a1a] border border-white/20 rounded-xl overflow-hidden min-w-[220px] max-h-[300px] overflow-y-auto scrollbar-thin z-20 shadow-lg max-md:w-full" role="menu">
					{availableTags.length > 0 ? (
						<>
							<div className="flex items-center justify-between py-2.5 px-4 border-b border-white/10 bg-white/5">
								<span className="text-white/60 text-sm font-[BentonSansRegular]">Select multiple tags</span>
								{selectedTags.length > 0 && (
									<button
										className="bg-transparent border-none text-[#ec1d24] text-xs font-[BentonSansBold] cursor-pointer hover:text-[#ff4444] transition-colors duration-200"
										onClick={(e) => {
											e.stopPropagation();
											onChange([]);
										}}
										type="button"
									>
										Clear
									</button>
								)}
							</div>
							{availableTags.map((tag) => (
								<button
									key={tag}
									onClick={(e) => {
										e.stopPropagation();
										// Toggle the tag in the selected list
										const newTags = selectedTags.includes(tag)
											? selectedTags.filter((t) => t !== tag)
											: [...selectedTags, tag];
										onChange(newTags);
									}}
									className={`w-full text-left py-3 px-4 border-none bg-transparent text-white/80 font-[BentonSansRegular] cursor-pointer transition-all duration-200 flex items-center gap-2.5 hover:bg-white/10 hover:text-white ${selectedTags.includes(tag) ? "bg-[#ec1d24]/20 text-white" : ""}`}
									type="button"
									role="menuitemcheckbox"
									aria-checked={selectedTags.includes(tag)}
								>
									<span className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${selectedTags.includes(tag) ? "bg-[#ec1d24] border-[#ec1d24]" : "border-white/40"}`}>
										{selectedTags.includes(tag) && (
											<svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
												<path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
											</svg>
										)}
									</span>
									<PiTag className="text-[#ec1d24] text-sm" />
									{tag}
								</button>
							))}
						</>
					) : (
						<div className="py-3 px-4 text-white/50 font-[BentonSansRegular] text-sm">No tags available</div>
					)}
				</div>
			)}
		</div>
	);
});

TagMultiSelect.displayName = "ProfileTagMultiSelect";

export default TagMultiSelect;
