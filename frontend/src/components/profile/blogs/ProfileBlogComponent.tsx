"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { BlogList } from "@/types/BlogTypes";
import "@/styles/blogposts.css";
import LoadingSpinner from "@/components/main/LoadingSpinner";
import BlogFilters from "./ProfileBlogFilters";
import BlogCard from "./ProfileBlogCard";
import BlogPagination from "./ProfileBlogPagination";
import EmptyState from "./ProfileEmptyState";
import useBlogSearch from "./hooks/ProfileUseBlogSearch";
import { useBlogContext } from "./ProfileBlogContext";
import { useEditingContext } from "@/contexts/EditingContext";

interface BlogComponentProps {
	path: string;
	initialBlogs: BlogList[];
	totalPages: number;
	apiUrl: string;
	initialTags?: string[];
	initialAuthors?: string[];
}

const BlogComponent = ({
    path,
    initialBlogs,
    totalPages: initialTotalPages,
    apiUrl,
    initialTags,
    initialAuthors,
}: BlogComponentProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const blogContext = useBlogContext();
	const router = useRouter();

	const { isEditing } = useEditingContext();

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
		isSearchFocused,
		setIsSearchFocused,
		handleSearch,
		handlePageChange,
		resetFilters,
		handleTagClick,
		getPaginationNumbers,
		activeFilters,
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
            // Check if we're in editing mode or if a text field is focused
            const activeElement = document.activeElement;
            const isEditingText = activeElement instanceof HTMLInputElement || 
                                  activeElement instanceof HTMLTextAreaElement || 
                                  activeElement instanceof HTMLSelectElement ||
                                  activeElement?.getAttribute('contenteditable') === 'true';
            
            // Don't process keyboard shortcuts if editing profile or if text input is focused
            if (isEditing || isEditingText || isSearchFocused) {
                return;
            }
            
            // Only handle navigation keys when not in editing mode
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
        };
    
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentPage, totalPages, isSearchFocused, handlePageChange, isEditing]);

	return (
		<div ref={containerRef} className="blog-component">
			<BlogFilters
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				selectedTags={selectedTags}
				selectedAuthor={selectedAuthor}
				tags={tags}
				authors={authors}
				resetFilters={resetFilters}
				handleSearch={handleSearch}
				activeFilters={activeFilters}
				isSearchFocused={isSearchFocused}
				setIsSearchFocused={setIsSearchFocused}
				// Remove any other unused props
			/>

			{loading ? (
				<div className="loading-state">Loading...</div>
			) : blogs.length > 0 ? (
				<>
					<div className="blogs-grid">
						{blogs.map((blog, index) => (
							<BlogCard
								key={blog.id || index}
								blog={blog}
								handleTagClick={handleTagClick}
								path={path}
								handleNavigation={handleNavigation}
							/>
						))}
					</div>

					<BlogPagination
						currentPage={currentPage}
						totalPages={totalPages}
						handlePageChange={handlePageChange}
						getPaginationNumbers={getPaginationNumbers}
					/>
				</>
			) : (
				<EmptyState
					title="No content found"
					description="Try adjusting your search or filters to find what you're looking for."
				/>
			)}
		</div>
	);
};

export default BlogComponent;
