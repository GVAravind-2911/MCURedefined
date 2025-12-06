import type React from "react";
import { useState, useRef, useEffect, memo, useCallback } from "react";
import TagMultiSelect from "./ProfileTagMultiSelect";

interface ProfileBlogFiltersProps {
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
	resetFilters: () => void;
	isSearchFocused: boolean;
	setIsSearchFocused: (isFocused: boolean) => void;
}

const BlogFilters = memo(
	({
		searchQuery,
		setSearchQuery,
		selectedTags,
		selectedAuthor,
		tags,
		authors,
		resetFilters,
		handleSearch,
		activeFilters,
		isSearchFocused,
		setIsSearchFocused,
	}: ProfileBlogFiltersProps) => {
		const [showAuthorFilter, setShowAuthorFilter] = useState(false);
		const authorDropdownRef = useRef<HTMLDivElement>(null);

		// Handle clicks outside author dropdown to close it
		useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
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

		return (
			<div className="mb-6 animate-[fadeIn_0.5s_ease]">
				<div className="relative flex mb-4 rounded-[30px] overflow-hidden bg-white/10 border border-white/20 transition-shadow duration-300 focus-within:shadow-[0_0_0_2px_rgba(236,29,36,0.5)]">
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onFocus={() => setIsSearchFocused(true)}
						onBlur={() => setIsSearchFocused(false)}
						placeholder="Search by title or description..."
						className="grow py-3 px-5 border-none bg-transparent text-white text-base font-[BentonSansRegular] w-full outline-none placeholder:text-white/60"
						aria-label="Search blogs"
					/>
					{searchQuery && (
						<button
							className="absolute right-[50px] top-1/2 -translate-y-1/2 bg-transparent border-none text-white/60 cursor-pointer flex items-center justify-center p-0 w-6 h-6 mr-[1.5%] hover:text-white"
							onClick={() => handleSearch("", selectedTags, selectedAuthor)}
							type="button"
							aria-label="Clear search"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								width="16"
								height="16"
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
						className="bg-transparent text-white/70 border-none py-2.5 px-5 cursor-pointer flex items-center justify-center transition-all duration-200 border-l border-l-white/20 hover:bg-[#ec1d24]/20 hover:text-white"
						onClick={() =>
							handleSearch(searchQuery, selectedTags, selectedAuthor)
						}
						type="button"
						aria-label="Search"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="18"
							height="18"
						>
							<title>Search</title>
							<path
								fill="currentColor"
								d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
							/>
						</svg>
					</button>
				</div>

				<div className="flex gap-4 flex-wrap mt-4 max-md:flex-col max-md:gap-2">
					<TagMultiSelect
						selectedTags={selectedTags}
						availableTags={tags}
						onChange={(newTags) =>
							handleSearch(searchQuery, newTags, selectedAuthor)
						}
					/>

					<div className="relative z-10 max-md:w-full" ref={authorDropdownRef}>
						<button
							className={`bg-white/10 border border-white/20 text-white py-2.5 px-5 rounded-[20px] cursor-pointer flex items-center gap-2 font-[BentonSansRegular] transition-all duration-200 hover:bg-white/15 max-md:w-full max-md:justify-between ${selectedAuthor ? "bg-[#ec1d24]/20 border-[#ec1d24]/60" : ""}`}
							onClick={() => setShowAuthorFilter(!showAuthorFilter)}
							type="button"
							aria-haspopup="true"
							aria-expanded={showAuthorFilter}
						>
							{selectedAuthor || "Filter by Author"}
							<svg
								className={`transition-transform duration-200 ${showAuthorFilter ? "rotate-180" : ""}`}
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
							<div
								className="absolute top-full left-0 mt-2 bg-[#1a1a1a] border border-white/20 rounded-xl overflow-hidden min-w-[200px] max-h-[300px] overflow-y-auto scrollbar-thin z-20 shadow-lg max-md:w-full"
								role="menu"
							>
								{authors.length > 0 ? (
									authors.map((author) => (
										<button
											key={author}
											onClick={() => {
												handleSearch(searchQuery, selectedTags, author);
												setShowAuthorFilter(false);
											}}
											className={`w-full text-left py-3 px-4 border-none bg-transparent text-white/80 font-[BentonSansRegular] cursor-pointer transition-all duration-200 hover:bg-white/10 hover:text-white ${selectedAuthor === author ? "bg-[#ec1d24]/20 text-white" : ""}`}
											type="button"
											role="menuitem"
										>
											{author}
										</button>
									))
								) : (
									<div className="py-3 px-4 text-white/50 font-[BentonSansRegular] text-sm">
										No authors available
									</div>
								)}
							</div>
						)}
					</div>

					{activeFilters.length > 0 && (
						<button
							className="bg-transparent border border-red-500/50 text-red-400 py-2 px-4 rounded-[20px] cursor-pointer font-[BentonSansRegular] text-sm transition-all duration-200 hover:bg-red-500/20 hover:text-red-300 max-md:w-full"
							onClick={resetFilters}
							type="button"
							aria-label="Clear all filters"
						>
							Clear All Filters
						</button>
					)}
				</div>

				{activeFilters.length > 0 && (
					<div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/10">
						<span className="text-white/60 font-[BentonSansRegular] text-sm">
							Active filters:
						</span>
						<div className="flex flex-wrap gap-2">
							{activeFilters.map((filter) => (
								<span
									key={`${filter.type}-${filter.value}`}
									className="inline-flex items-center gap-2 bg-[#ec1d24]/20 border border-[#ec1d24]/40 text-white py-1.5 px-3 rounded-full text-sm font-[BentonSansRegular]"
								>
									<span className="text-[#ec1d24] font-[BentonSansBold]">
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
										className="bg-transparent border-none text-white/60 cursor-pointer p-0 flex items-center justify-center hover:text-white transition-colors duration-200"
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
	},
);

BlogFilters.displayName = "ProfileBlogFilters";

export default BlogFilters;
