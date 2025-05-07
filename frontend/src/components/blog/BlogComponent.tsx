"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { BlogList } from "@/types/BlogTypes";
import "@/styles/blogposts.css";
import LoadingSpinner from "../main/LoadingSpinner";
import BlogFilters from "./BlogFilters";
import BlogCard from "./BlogCard";
import BlogPagination from "./BlogPagination";
import EmptyState from "./EmptyState";
import useBlogSearch from "./hooks/UseBlogSearch";

interface BlogComponentProps {
	path: string;
	initialBlogs: BlogList[];
	totalPages: number;
	apiUrl: string;
	initialTags?: string[];
	initialAuthors?: string[];
}

const BlogsComponent: React.FC<BlogComponentProps> = ({
	path,
	initialBlogs,
	totalPages: initialTotalPages,
	apiUrl,
	initialTags = [],
	initialAuthors = [],
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const router = useRouter();

	const {
		blogs,
		loading,
		currentPage,
		totalPages,
		searchQuery,
		setSearchQuery,
		selectedTags,
		selectedAuthor,
		tags,
		authors,
		handleSearch,
		handlePageChange,
		resetFilters,
		handleTagClick,
		getPaginationNumbers,
		activeFilters,
		isSearchFocused,
	} = useBlogSearch({
		initialBlogs,
		initialTotalPages,
		apiUrl,
		initialTags,
		initialAuthors,
		path,
		containerRef,
	});

	const handleNavigation = (
		e: React.MouseEvent<HTMLAnchorElement>,
		id: number,
	) => {
		e.preventDefault();
		router.push(`/${path}/${id}`);
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isSearchFocused) {
				if (e.key === "ArrowRight" || e.key === "ArrowDown") {
					e.preventDefault();
					if (currentPage < totalPages) handlePageChange(currentPage + 1);
				} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
					e.preventDefault();
					if (currentPage > 1) handlePageChange(currentPage - 1);
				} else if (e.key === "Home") {
					e.preventDefault();
					if (currentPage !== 1) handlePageChange(1);
				} else if (e.key === "End") {
					e.preventDefault();
					if (currentPage !== totalPages) handlePageChange(totalPages);
				} else if (e.key === "/") {
					e.preventDefault();
					const searchInput = document.querySelector(
						".search-input",
					) as HTMLInputElement;
					if (searchInput) searchInput.focus();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [currentPage, totalPages, isSearchFocused, handlePageChange]);

	return (
		<div className="blogs-container" ref={containerRef}>
			<BlogFilters
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery} // Add this line
				selectedTags={selectedTags}
				selectedAuthor={selectedAuthor}
				tags={tags}
				authors={authors}
				activeFilters={activeFilters}
				handleSearch={handleSearch}
				handleTagClick={handleTagClick}
				resetFilters={resetFilters}
				apiUrl={apiUrl}
			/>
			<div className="blogs-wrapper">
				{loading ? (
					<div className="loading-wrapper">
						<LoadingSpinner />
					</div>
				) : blogs.length > 0 ? (
					<div className="blogs fade-in">
						<hr className="divider" />
						{blogs.map((blog) => (
							<React.Fragment key={blog.id}>
								<BlogCard
									blog={blog}
									path={path}
									handleNavigation={handleNavigation}
									handleTagClick={handleTagClick}
								/>
								<hr className="divider" />
							</React.Fragment>
						))}
					</div>
				) : (
					<EmptyState resetFilters={resetFilters} />
				)}

				{totalPages > 1 && blogs.length > 0 && (
					<BlogPagination
						currentPage={currentPage}
						totalPages={totalPages}
						handlePageChange={handlePageChange}
						getPaginationNumbers={getPaginationNumbers}
					/>
				)}
			</div>
		</div>
	);
};

export default BlogsComponent;
