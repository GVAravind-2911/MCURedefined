"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { BlogList } from "@/types/BlogTypes";
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
	basePath?: string;
	initialBlogs: BlogList[];
	totalPages: number;
	apiUrl: string;
	initialTags?: string[];
	initialAuthors?: string[];
}

const AdminBlogComponent: React.FC<AdminBlogComponentProps> = ({
	path,
	basePath = "",
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
		basePath,
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
			<div className="flex justify-center items-center min-h-[300px]">
				<LoadingSpinner />
			</div>
		);
	}

	return (
		<div
			className="flex flex-col w-[90%] max-w-[1200px] mx-auto py-8"
			ref={containerRef}
		>
			<div className="flex justify-end w-full max-w-[1200px] mb-4 max-md:justify-center max-md:mb-6">
				<button
					className="flex items-center gap-2 bg-[#ec1d24] text-white py-3 px-5 rounded-lg font-[BentonSansBold] cursor-pointer border-none shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-[#d81921] hover:-translate-y-0.5 hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] [&_svg]:w-5 [&_svg]:h-5 max-md:w-full max-md:justify-center"
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

			<div className="flex flex-col gap-8">
				{loading ? (
					<div className="flex justify-center items-center min-h-[300px]">
						<LoadingSpinner />
					</div>
				) : blogs.length > 0 ? (
					<div className="flex flex-col items-center w-full m-0 p-0 animate-[fadeInSimple_0.3s_ease-in]">
						<hr className="w-full h-px bg-white/10 my-2.5 border-0" />
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
								<hr className="w-full h-px bg-white/10 my-2.5 border-0" />
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
			<dialog
				className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] text-white border-none rounded-lg p-6 min-w-[400px] shadow-[0_10px_30px_rgba(0,0,0,0.8)] border-t-4 border-t-[#e74c3c] backdrop:bg-black/70 max-md:min-w-[calc(100vw-40px)] max-md:max-w-[calc(100vw-40px)] max-md:p-4"
				ref={dialogRef}
			>
				<h2 className="mt-0 text-[#e74c3c] font-[BentonSansBold]">
					Delete Blog Post
				</h2>
				<p className="mb-6 font-[BentonSansRegular]">
					Are you sure you want to delete{" "}
					<span className="font-bold text-[#ec1d24]">
						{blogToDelete?.title}
					</span>
					?
				</p>
				<p className="mb-6 font-[BentonSansRegular]">
					This action cannot be undone.
				</p>
				<div className="flex justify-end gap-3">
					<button
						type="button"
						className="py-2.5 px-5 rounded-md font-[BentonSansRegular] cursor-pointer transition-all duration-200 bg-transparent text-white border border-white/30 hover:bg-white/10 hover:border-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
						onClick={cancelDelete}
						disabled={isDeleting}
					>
						Cancel
					</button>
					<button
						type="button"
						className="py-2.5 px-5 rounded-md font-[BentonSansRegular] cursor-pointer transition-all duration-200 bg-[#e74c3c] text-white border-none hover:bg-[#c0392b] disabled:opacity-50 disabled:cursor-not-allowed"
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
