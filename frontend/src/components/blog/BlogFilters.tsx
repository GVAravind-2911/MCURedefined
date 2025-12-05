import type React from "react";
import { useState, useRef, useEffect, memo, useCallback } from "react";
import TagMultiSelect from "./TagMultiSelect";

interface BlogFiltersProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	selectedTags: string[];
	selectedAuthor: string;
	tags: string[];
	authors: string[];
	activeFilters: Array<{ type: string; value: string }>;
	handleSearch: (
		query: string,
		tags: string[],
		author: string,
		page?: number,
	) => void;
	handleTagClick: (e: React.MouseEvent<HTMLButtonElement>, tag: string) => void;
	resetFilters: () => void;
	apiUrl: string;
}

const BlogFilters: React.FC<BlogFiltersProps> = memo(({
	searchQuery,
	setSearchQuery,
	selectedTags,
	selectedAuthor,
	tags,
	authors,
	activeFilters,
	handleSearch,
	resetFilters,
	apiUrl,
}) => {
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const [showAuthorFilter, setShowAuthorFilter] = useState(false);
	const authorDropdownRef = useRef<HTMLDivElement>(null);

	// Handle clicks outside author dropdown to close it
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			// Close author dropdown if click is outside
			if (
				authorDropdownRef.current &&
				!authorDropdownRef.current.contains(event.target as Node)
			) {
				setShowAuthorFilter(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Function to toggle a tag in the multi-select dropdown
	const toggleTag = useCallback((tag: string) => {
		let newTags: string[];
		if (selectedTags.includes(tag)) {
			newTags = selectedTags.filter((t) => t !== tag);
		} else {
			newTags = [...selectedTags, tag];
		}
		handleSearch(searchQuery, newTags, selectedAuthor);
	}, [selectedTags, handleSearch, searchQuery, selectedAuthor]);

	return (
		<div className="mb-4 sm:mb-6 md:mb-8 animate-[fadeIn_0.5s_ease]">
			<h2 className="flex items-center mb-4 sm:mb-6 md:mb-8 font-[BentonSansBold] text-white">
				<span className="text-xl sm:text-2xl md:text-[28px] mr-3 sm:mr-4 whitespace-nowrap">Explore Posts</span>
				<div className="grow h-0.5 sm:h-[3px] bg-linear-to-r from-[#ec1d24] to-transparent" />
			</h2>

			<div className="relative flex mb-3 sm:mb-4 rounded-full overflow-hidden bg-white/10 border border-white/20 transition-shadow duration-300 focus-within:shadow-[0_0_0_2px_rgba(236,29,36,0.5)]">
				<input
					type="text"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onFocus={() => setIsSearchFocused(true)}
					onBlur={() => setIsSearchFocused(false)}
					placeholder="Search posts..."
					className="grow py-2.5 sm:py-3 px-4 sm:px-5 border-none bg-transparent text-white text-sm sm:text-base font-[BentonSansRegular] w-full outline-none placeholder:text-white/60"
					aria-label="Search blogs"
				/>
				{searchQuery && (
					<button
						className="absolute right-[45px] sm:right-[50px] top-1/2 -translate-y-1/2 bg-transparent border-none text-white/60 cursor-pointer flex items-center justify-center p-0 w-5 h-5 sm:w-6 sm:h-6 hover:text-white active:scale-90"
						onClick={() => handleSearch("", selectedTags, selectedAuthor)}
						type="button"
						aria-label="Clear search"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="14"
							height="14"
						>
							<title>Clear search</title>
							<path
								fill="currentColor"
								d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
							/>
						</svg>
					</button>
				)}
				<button
					className="bg-transparent text-white/70 border-none py-2 sm:py-2.5 px-3 sm:px-5 cursor-pointer flex items-center justify-center transition-all duration-200 border-l border-l-white/20 hover:bg-[#ec1d24]/20 hover:text-white active:bg-[#ec1d24]/30"
					onClick={() =>
						handleSearch(searchQuery, selectedTags, selectedAuthor)
					}
					type="button"
					aria-label="Search"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="16"
						height="16"
						className="sm:w-[18px] sm:h-[18px]"
					>
						<title>Search</title>
						<path
							fill="currentColor"
							d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
						/>
					</svg>
				</button>
			</div>

			<div className="flex gap-2 sm:gap-3 md:gap-4 flex-wrap mt-3 sm:mt-4">
				<TagMultiSelect
					selectedTags={selectedTags}
					tags={tags}
					toggleTag={toggleTag}
					searchQuery={searchQuery}
					selectedAuthor={selectedAuthor}
					handleSearch={handleSearch}
				/>

				<div className="relative z-10" ref={authorDropdownRef}>
					<button
						className={`bg-white/10 border border-white/20 text-white py-2 sm:py-2.5 px-3 sm:px-5 rounded-full text-sm sm:text-base cursor-pointer flex items-center gap-1.5 sm:gap-2 font-[BentonSansRegular] transition-all duration-200 hover:bg-white/15 active:scale-95 ${selectedAuthor ? "bg-[#ec1d24]/20 border-[#ec1d24]/60" : ""}`}
						onClick={() => setShowAuthorFilter(!showAuthorFilter)}
						type="button"
						aria-haspopup="true"
						aria-expanded={showAuthorFilter}
					>
						{selectedAuthor || "Filter by Author"}
						<svg
							className={`transition-transform duration-300 ${showAuthorFilter ? "rotate-180" : ""}`}
							xmlns="http://www.w3.org/2000/svg"
							width="12"
							height="12"
							viewBox="0 0 24 24"
						>
							<title>Filter by Author</title>
							<path fill="currentColor" d="M7 10l5 5 5-5z" />
						</svg>
					</button>
					{showAuthorFilter && (
						<div className="absolute top-[calc(100%+8px)] left-0 min-w-[180px] sm:min-w-[220px] max-h-[250px] sm:max-h-[300px] overflow-y-auto bg-[#0a0a0a] border border-white/20 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.8)] z-100 animate-[dropdownFade_0.2s_ease] scrollbar-thin scrollbar-thumb-[#ec1d24]/60 scrollbar-track-[#1a1a1a]" role="menu">
							{authors.length > 0 ? (
								authors.map((author) => (
									<button
										key={author}
										onClick={() => {
											handleSearch(searchQuery, selectedTags, author);
											setShowAuthorFilter(false);
										}}
										className={`block w-full text-left py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base border-none cursor-pointer border-b border-b-white/10 transition-all duration-200 ${selectedAuthor === author ? "bg-[#ec1d24] text-white font-[BentonSansBold]" : "bg-transparent text-white/90 hover:bg-white/10 hover:text-white active:bg-white/15"}`}
										type="button"
										role="menuitem"
									>
										{author}
									</button>
								))
							) : (
								<div className="py-3 px-4 text-white/50 text-center italic">No authors available</div>
							)}
						</div>
					)}
				</div>

				{activeFilters.length > 0 && (
					<button
						className="bg-transparent border border-[#ec1d24]/70 text-[#ec1d24]/90 py-2 sm:py-2.5 px-3 sm:px-5 rounded-full text-sm sm:text-base cursor-pointer font-[BentonSansRegular] transition-all duration-200 hover:bg-[#ec1d24]/10 hover:text-[#ec1d24] active:bg-[#ec1d24]/20"
						onClick={resetFilters}
						type="button"
						aria-label="Clear all filters"
					>
						Clear All
					</button>
				)}
			</div>

			{activeFilters.length > 0 && (
				<div className="flex flex-wrap items-center my-2 sm:my-3 py-2 px-2.5 sm:px-3 bg-white/5 rounded-lg gap-2">
					<span className="font-bold mr-1.5 sm:mr-2.5 text-white/70 text-xs sm:text-sm">Active:</span>
					<div className="flex flex-wrap gap-1.5 sm:gap-2">
						{activeFilters.map((filter) => (
							<span
								key={`${filter.type}-${filter.value}`}
								className="flex items-center bg-[#ec1d24]/20 border border-[#ec1d24]/40 text-white text-sm py-1.5 px-2.5 rounded-[20px] font-[BentonSansRegular]"
							>
								<span className="font-bold mr-1.5 text-[#ec1d24]/90">
									{filter.type === "query"
										? "Search"
										: filter.type === "tag"
											? "Tag"
											: "Author"}
									:
								</span>
								{filter.value}
								<button
									onClick={() => {
										if (filter.type === "query") {
											handleSearch("", selectedTags, selectedAuthor);
										} else if (filter.type === "tag") {
											const newTags = selectedTags.filter(
												(t) => t !== filter.value,
											);
											handleSearch(searchQuery, newTags, selectedAuthor);
										} else if (filter.type === "author") {
											handleSearch(searchQuery, selectedTags, "");
										}
									}}
									className="flex items-center justify-center bg-transparent border-none text-white/60 ml-2 cursor-pointer p-0 rounded-full w-5 h-5 hover:text-white hover:bg-white/10"
									aria-label={`Remove ${filter.type} filter: ${filter.value}`}
									type="button"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										width="14"
										height="14"
									>
										<title>Remove filter</title>
										<path
											fill="currentColor"
											d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
										/>
									</svg>
								</button>
							</span>
						))}
					</div>
				</div>
			)}
		</div>
	);
});

BlogFilters.displayName = "BlogFilters";

export default BlogFilters;
