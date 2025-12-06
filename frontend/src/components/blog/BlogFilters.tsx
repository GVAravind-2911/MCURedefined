import type React from "react";
import { useState, useRef, useEffect, memo, useCallback } from "react";
import TagMultiSelect from "./TagMultiSelect";
import { Search, X, ChevronDown, User, Filter, Tag } from "lucide-react";

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

const BlogFilters: React.FC<BlogFiltersProps> = memo(
	({
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
		const [showAuthorFilter, setShowAuthorFilter] = useState(false);
		const [showMobileFilters, setShowMobileFilters] = useState(false);
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
		const toggleTag = useCallback(
			(tag: string) => {
				let newTags: string[];
				if (selectedTags.includes(tag)) {
					newTags = selectedTags.filter((t) => t !== tag);
				} else {
					newTags = [...selectedTags, tag];
				}
				handleSearch(searchQuery, newTags, selectedAuthor);
			},
			[selectedTags, handleSearch, searchQuery, selectedAuthor],
		);

		const hasActiveFilters = activeFilters.length > 0;

		const handleFormSubmit = (e: React.FormEvent) => {
			e.preventDefault();
			handleSearch(searchQuery, selectedTags, selectedAuthor);
		};

		const AuthorDropdown = ({ fullWidth = false }: { fullWidth?: boolean }) => (
			<div
				className={`relative z-60 ${fullWidth ? "w-full" : ""}`}
				ref={fullWidth ? undefined : authorDropdownRef}
			>
				<button
					type="button"
					className={`flex items-center justify-between gap-2 h-12 px-4 bg-linear-to-r from-white/5 to-white/2 border border-white/15 rounded-xl text-white text-sm cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/25 hover:shadow-lg hover:shadow-black/20 ${fullWidth ? "w-full" : "min-w-40"} ${selectedAuthor ? "border-[#ec1d24]/60 bg-linear-to-r from-[#ec1d24]/15 to-[#ec1d24]/5 shadow-[0_0_20px_rgba(236,29,36,0.15)]" : ""}`}
					onClick={() => setShowAuthorFilter(!showAuthorFilter)}
				>
					<div className="flex items-center gap-2">
						<User
							className={`w-4 h-4 ${selectedAuthor ? "text-[#ec1d24]" : "text-white/50"}`}
						/>
						<span className="truncate">{selectedAuthor || "All Authors"}</span>
					</div>
					<ChevronDown
						className={`w-4 h-4 text-white/50 transition-transform duration-300 shrink-0 ${showAuthorFilter ? "rotate-180 text-[#ec1d24]" : ""}`}
					/>
				</button>
				{showAuthorFilter && (
					<div className="absolute top-full left-0 right-0 mt-2 min-w-[200px] max-h-80 overflow-hidden bg-linear-to-b from-[#1f1f1f] to-[#151515] border border-white/20 rounded-xl shadow-[0_15px_50px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)] z-100">
						{/* Header */}
						<div className="py-3 px-4 bg-linear-to-r from-[#252525] to-[#1f1f1f] border-b border-white/10">
							<span className="text-sm text-white font-[BentonSansBold]">
								Select Author
							</span>
						</div>

						{/* Authors List */}
						<div className="max-h-[260px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
							<button
								type="button"
								className={`flex items-center gap-3 w-full py-3 px-4 text-sm text-left transition-all duration-200 border-b border-white/5 ${
									!selectedAuthor
										? "bg-linear-to-r from-[#ec1d24]/20 to-[#ec1d24]/10 text-white"
										: "text-white/70 hover:bg-white/8 hover:text-white"
								}`}
								onClick={() => {
									handleSearch(searchQuery, selectedTags, "");
									setShowAuthorFilter(false);
								}}
							>
								<div
									className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${!selectedAuthor ? "bg-[#ec1d24] shadow-[0_0_8px_rgba(236,29,36,0.5)]" : "bg-white/30"}`}
								/>
								<span className="font-[BentonSansRegular]">All Authors</span>
							</button>
							{authors.length > 0 ? (
								authors.map((author) => (
									<button
										key={author}
										type="button"
										className={`flex items-center gap-3 w-full py-3 px-4 text-sm text-left transition-all duration-200 border-b border-white/5 last:border-b-0 ${
											selectedAuthor === author
												? "bg-linear-to-r from-[#ec1d24]/20 to-[#ec1d24]/10 text-white"
												: "text-white/70 hover:bg-white/8 hover:text-white"
										}`}
										onClick={() => {
											handleSearch(searchQuery, selectedTags, author);
											setShowAuthorFilter(false);
										}}
									>
										<div
											className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${selectedAuthor === author ? "bg-[#ec1d24] shadow-[0_0_8px_rgba(236,29,36,0.5)]" : "bg-white/30"}`}
										/>
										<span className="font-[BentonSansRegular]">{author}</span>
									</button>
								))
							) : (
								<div className="py-6 px-4 text-white/40 text-center text-sm">
									No authors available
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		);

		return (
			<div className="relative z-40 mb-6 sm:mb-8 animate-[fadeIn_0.5s_ease]">
				{/* Section Header */}
				<h2 className="flex items-center mb-6 sm:mb-8 font-[BentonSansBold] text-white">
					<span className="text-xl sm:text-2xl md:text-[28px] mr-3 sm:mr-4 whitespace-nowrap">
						Explore Posts
					</span>
					<div className="grow h-0.5 sm:h-[3px] bg-linear-to-r from-[#ec1d24] to-transparent" />
				</h2>

				{/* Main Toolbar */}
				<div className="relative bg-linear-to-br from-white/4 via-white/2 to-transparent backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
					<div className="flex flex-col lg:flex-row gap-4">
						{/* Search Section */}
						<form onSubmit={handleFormSubmit} className="flex-1 flex gap-2">
							{/* Search Input */}
							<div className="flex-1 relative">
								<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search posts..."
									className="search-input w-full h-12 pl-12 pr-10 bg-linear-to-r from-white/5 to-white/2 border border-white/15 rounded-xl text-white text-sm placeholder:text-white/35 transition-all duration-300 focus:outline-none focus:border-[#ec1d24]/60 focus:ring-2 focus:ring-[#ec1d24]/25 focus:bg-white/8 focus:shadow-[0_0_20px_rgba(236,29,36,0.1)] font-[BentonSansRegular]"
									aria-label="Search posts"
								/>
								{searchQuery && (
									<button
										type="button"
										className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
										onClick={() =>
											handleSearch("", selectedTags, selectedAuthor)
										}
										aria-label="Clear search"
									>
										<X className="w-4 h-4" />
									</button>
								)}
							</div>

							{/* Search Button */}
							<button
								type="submit"
								className="h-12 px-6 bg-linear-to-br from-[#ec1d24] to-[#c91820] text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#ec1d24]/25 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
							>
								<Search className="w-4 h-4" />
								<span className="hidden sm:inline">Search</span>
							</button>
						</form>

						{/* Desktop Filters */}
						<div className="hidden lg:flex items-center gap-3">
							<TagMultiSelect
								selectedTags={selectedTags}
								tags={tags}
								toggleTag={toggleTag}
								searchQuery={searchQuery}
								selectedAuthor={selectedAuthor}
								handleSearch={handleSearch}
							/>
							<div ref={authorDropdownRef}>
								<AuthorDropdown />
							</div>

							{hasActiveFilters && (
								<button
									type="button"
									className="h-12 px-4 bg-white/5 border border-white/15 rounded-xl text-white/70 text-sm transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 flex items-center gap-2"
									onClick={resetFilters}
								>
									<X className="w-4 h-4" />
									Clear
								</button>
							)}
						</div>

						{/* Mobile Filter Toggle */}
						<div className="flex lg:hidden items-center gap-2">
							<button
								type="button"
								className={`flex-1 h-12 px-4 bg-linear-to-r from-white/5 to-white/2 border border-white/15 rounded-xl text-white text-sm transition-all duration-300 flex items-center justify-center gap-2 ${hasActiveFilters ? "border-[#ec1d24]/60 bg-linear-to-r from-[#ec1d24]/15 to-[#ec1d24]/5 shadow-[0_0_20px_rgba(236,29,36,0.15)]" : "hover:bg-white/10 hover:border-white/25"}`}
								onClick={() => setShowMobileFilters(!showMobileFilters)}
							>
								<Filter
									className={`w-4 h-4 ${hasActiveFilters ? "text-[#ec1d24]" : ""}`}
								/>
								Filters
								{hasActiveFilters && (
									<span className="w-2 h-2 rounded-full bg-[#ec1d24] shadow-[0_0_8px_rgba(236,29,36,0.5)]" />
								)}
							</button>
						</div>
					</div>

					{/* Mobile Filters Panel */}
					{showMobileFilters && (
						<div className="lg:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
							<div className="flex flex-col gap-3">
								<div className="flex items-center gap-2 text-white/70 text-sm">
									<Tag className="w-4 h-4" />
									<span>Tags</span>
								</div>
								<TagMultiSelect
									selectedTags={selectedTags}
									tags={tags}
									toggleTag={toggleTag}
									searchQuery={searchQuery}
									selectedAuthor={selectedAuthor}
									handleSearch={handleSearch}
								/>
							</div>
							<AuthorDropdown fullWidth />

							{hasActiveFilters && (
								<button
									type="button"
									className="h-10 bg-white/5 border border-white/15 rounded-xl text-white/70 text-sm transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 flex items-center justify-center gap-2"
									onClick={resetFilters}
								>
									<X className="w-4 h-4" />
									Clear All Filters
								</button>
							)}
						</div>
					)}
				</div>

				{/* Active Filters Display */}
				{activeFilters.length > 0 && (
					<div className="flex flex-wrap items-center mt-4 py-3 px-4 bg-linear-to-r from-white/4 to-transparent backdrop-blur-sm border border-white/15 rounded-xl gap-2">
						<span className="font-[BentonSansBold] mr-2 text-white/80 text-xs sm:text-sm">
							Active Filters:
						</span>
						<div className="flex flex-wrap gap-2">
							{activeFilters.map((filter) => (
								<span
									key={`${filter.type}-${filter.value}`}
									className="flex items-center bg-linear-to-r from-[#ec1d24]/20 to-[#ec1d24]/10 border border-[#ec1d24]/40 text-white text-sm py-1.5 px-3 rounded-full font-[BentonSansRegular] gap-1.5 shadow-[0_0_12px_rgba(236,29,36,0.15)]"
								>
									<span className="text-[#ec1d24] text-xs uppercase font-[BentonSansBold]">
										{filter.type === "query"
											? "Search"
											: filter.type === "tag"
												? "Tag"
												: "Author"}
										:
									</span>
									<span className="font-medium">{filter.value}</span>
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
										className="flex items-center justify-center text-white/60 ml-1 cursor-pointer p-1 rounded-full hover:text-white hover:bg-white/15 active:scale-90 transition-all duration-200"
										aria-label={`Remove ${filter.type} filter: ${filter.value}`}
										type="button"
									>
										<X className="w-3.5 h-3.5" />
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

BlogFilters.displayName = "BlogFilters";

export default BlogFilters;
