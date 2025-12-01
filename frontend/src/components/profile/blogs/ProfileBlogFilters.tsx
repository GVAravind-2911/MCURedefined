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

const BlogFilters = memo(({
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
		<div className="search-filters">
			<div className="search-bar">
				<input
					type="text"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onFocus={() => setIsSearchFocused(true)}
					onBlur={() => setIsSearchFocused(false)}
					placeholder="Search by title or description..."
					className="search-input"
					aria-label="Search blogs"
				/>
				{searchQuery && (
					<button
						className="search-clear-button"
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
					className="search-button"
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

			<div className="filter-controls">
				<TagMultiSelect
					selectedTags={selectedTags}
					availableTags={tags}
					onChange={(newTags) =>
						handleSearch(searchQuery, newTags, selectedAuthor)
					}
				/>

				<div className="filter-dropdown" ref={authorDropdownRef}>
					<button
						className={`filter-button ${selectedAuthor ? "filter-active" : ""}`}
						onClick={() => setShowAuthorFilter(!showAuthorFilter)}
						type="button"
						aria-haspopup="true"
						aria-expanded={showAuthorFilter}
					>
						{selectedAuthor || "Filter by Author"}
						<svg
							className={`dropdown-icon ${showAuthorFilter ? "rotated" : ""}`}
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
						<div className="dropdown-menu" role="menu">
							{authors.length > 0 ? (
								authors.map((author) => (
									<button
										key={author}
										onClick={() => {
											handleSearch(searchQuery, selectedTags, author);
											setShowAuthorFilter(false);
										}}
										className={`dropdown-item ${selectedAuthor === author ? "selected" : ""}`}
										type="button"
										role="menuitem"
									>
										{author}
									</button>
								))
							) : (
								<div className="dropdown-empty">No authors available</div>
							)}
						</div>
					)}
				</div>

				{activeFilters.length > 0 && (
					<button
						className="reset-button"
						onClick={resetFilters}
						type="button"
						aria-label="Clear all filters"
					>
						Clear All Filters
					</button>
				)}
			</div>

			{activeFilters.length > 0 && (
				<div className="active-filters">
					<span className="active-filters-label">Active filters:</span>
					<div className="filter-tags">
						{activeFilters.map((filter) => (
							<span
								key={`${filter.type}-${filter.value}`}
								className="filter-tag"
							>
								<span className="filter-tag-type">
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
									className="filter-tag-remove"
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

BlogFilters.displayName = "ProfileBlogFilters";

export default BlogFilters;
