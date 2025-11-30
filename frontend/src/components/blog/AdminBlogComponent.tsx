"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { BlogList } from "@/types/BlogTypes";
import "@/styles/blogposts.css";
import LoadingSpinner from "../main/LoadingSpinner";
import BlogFilters from "./BlogFilters";
import AdminBlogCard from "./AdminBlogCard";
import BlogPagination from "./BlogPagination";
import EmptyState from "./EmptyState";
import useBlogSearch from "./hooks/UseBlogSearch";
import axios from "axios";
import { authClient } from "@/lib/auth/auth-client";

interface AdminBlogComponentProps {
	path: string;
	initialBlogs: BlogList[];
	totalPages: number;
	apiUrl: string;
	initialTags?: string[];
	initialAuthors?: string[];
}

const AdminBlogComponent: React.FC<AdminBlogComponentProps> = ({
	path,
	initialBlogs,
	totalPages: initialTotalPages,
	apiUrl,
	initialTags = [],
	initialAuthors = [],
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [blogToDelete, setBlogToDelete] = useState<{
		id: number;
		title: string;
	} | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const dialogRef = useRef<HTMLDialogElement>(null);

	// Get the session token at the component level, not inside the callback
	const session = authClient.useSession();
	const authToken = session.data?.session?.token || "";

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
		fetchBlogs,
		initialLoadComplete,
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

	const handleAddNewBlog = useCallback(() => {
		router.push(`/manage/${path}/create `);
	}, [router, path]);

	const handleEdit = useCallback(
		(id: number) => {
			router.push(`/manage/${path}/edit/${id}`);
		},
		[router, path],
	);

	const handleDelete = useCallback((id: number, title: string) => {
		setBlogToDelete({ id, title });
		setDeleteDialogOpen(true);
		if (dialogRef.current) {
			dialogRef.current.showModal();
		}
	}, []);

	const confirmDelete = useCallback(async () => {
		if (!blogToDelete) return;

		setIsDeleting(true);
		try {
			const response = await axios.delete(`${apiUrl}/${blogToDelete.id}`, {
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});

			// Check if status code is 200 (success)
			if (response.status === 200) {
				// Close dialog and reset state
				if (dialogRef.current) {
					dialogRef.current.close();
				}
				setDeleteDialogOpen(false);
				setBlogToDelete(null);

				// Refresh the current page
				fetchBlogs(currentPage, searchQuery, selectedTags, selectedAuthor);

				// Show confirmation toast or notification
				alert(`"${blogToDelete.title}" has been deleted.`);
			} else {
				// Handle unexpected status codes
				console.error(`Unexpected status code: ${response.status}`);
				alert(
					"Something went wrong while deleting the blog. Please try again.",
				);
			}
		} catch (error) {
			console.error("Error deleting blog:", error);

			// Handle specific error status codes
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 403) {
					alert("You don't have permission to delete this blog post.");
				} else if (error.response?.status === 404) {
					alert("Blog post not found. It may have been already deleted.");

					// Close dialog since post doesn't exist anyway
					if (dialogRef.current) {
						dialogRef.current.close();
					}
					setDeleteDialogOpen(false);
					setBlogToDelete(null);

					// Refresh to show current state
					fetchBlogs(currentPage, searchQuery, selectedTags, selectedAuthor);
				} else {
					alert("Failed to delete blog. Please try again.");
				}
			} else {
				alert("Failed to delete blog. Please try again.");
			}
		} finally {
			setIsDeleting(false);
		}
	}, [
		blogToDelete,
		apiUrl,
		currentPage,
		fetchBlogs,
		searchQuery,
		selectedTags,
		selectedAuthor,
		authToken,
	]);

	const cancelDelete = useCallback(() => {
		if (dialogRef.current) {
			dialogRef.current.close();
		}
		setDeleteDialogOpen(false);
		setBlogToDelete(null);
	}, []);

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
				} else if (e.key === "/" || e.key === "s") {
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

	if (!initialLoadComplete || loading) {
		return (
			<div className="loading-wrapper">
				<LoadingSpinner />
			</div>
		);
	}

	return (
		<div className="blogs-container" ref={containerRef}>
			<div className="add-blog-button-container">
				<button
					className="add-blog-button"
					onClick={handleAddNewBlog}
					type="button"
					aria-label={`Add new ${path.charAt(0).toUpperCase() + path.slice(1, -1)} post`}
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>Add</title>
						<path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
					</svg>
					Add New {path.charAt(0).toUpperCase() + path.slice(1, -1)} Post
				</button>
			</div>
			<BlogFilters
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
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
								<AdminBlogCard
									blog={blog}
									path={path}
									handleNavigation={handleNavigation}
									handleTagClick={handleTagClick}
									handleEdit={handleEdit}
									handleDelete={handleDelete}
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

			{/* Delete Confirmation Dialog */}
			<dialog className="delete-confirmation-dialog" ref={dialogRef}>
				<h2>Delete Blog Post</h2>
				<p>
					Are you sure you want to delete{" "}
					<span className="delete-blog-title">{blogToDelete?.title}</span>?
				</p>
				<p>This action cannot be undone.</p>
				<div className="delete-dialog-buttons">
					<button
						type="button"
						className="delete-dialog-button cancel"
						onClick={cancelDelete}
						disabled={isDeleting}
					>
						Cancel
					</button>
					<button
						type="button"
						className="delete-dialog-button confirm"
						onClick={confirmDelete}
						disabled={isDeleting}
					>
						{isDeleting ? "Deleting..." : "Delete"}
					</button>
				</div>
			</dialog>
		</div>
	);
};

export default AdminBlogComponent;
