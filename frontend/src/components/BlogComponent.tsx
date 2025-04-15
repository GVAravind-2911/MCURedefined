"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import moment from "moment";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { BlogList } from "@/types/BlogTypes";
import "@/styles/blogposts.css";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner";

interface BlogComponentProps {
	path: string;
	initialBlogs: BlogList[];
	totalPages: number;
	apiUrl: string;
}

const BlogsComponent: React.FC<BlogComponentProps> = ({
	path,
	initialBlogs,
	totalPages,
	apiUrl,
}) => {
	const [blogs, setBlogs] = useState<BlogList[]>(initialBlogs);
	const [currentPage, setCurrentPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [cachedPages, setCachedPages] = useState<{ [key: number]: BlogList[] }>(
		{ 1: initialBlogs },
	);
	const router = useRouter();

	// Function to fetch blogs with caching
	const fetchBlogs = useCallback(
		async (page: number) => {
			if (cachedPages[page]) {
				setBlogs(cachedPages[page]); // Load from cache
				return;
			}

			setLoading(true);
			try {
				const response = await axios.get(`${apiUrl}?page=${page}&limit=5`);
				const newBlogs = response.data.blogs;

				setCachedPages((prev) => ({ ...prev, [page]: newBlogs }));
				setBlogs(newBlogs);
			} catch (error) {
				console.error("Error fetching blogs:", error);
			} finally {
				setLoading(false);
			}
		},
		[apiUrl, cachedPages],
	);

	// Preload adjacent pages for better UX
	useEffect(() => {
		const preloadPages = [currentPage + 1].filter(
			(page) => page <= totalPages && !cachedPages[page],
		);

		if (preloadPages.length === 0) return;

		const preloadBlogs = async () => {
			for (const page of preloadPages) {
				try {
					const response = await axios.get(`${apiUrl}?page=${page}&limit=3`);
					setCachedPages((prev) => ({ ...prev, [page]: response.data.blogs }));
				} catch (error) {
					console.error("Error preloading blogs:", error);
				}
			}
		};

		const timer = setTimeout(() => {
			preloadBlogs();
		}, 1000);

		return () => clearTimeout(timer);
	}, [currentPage, totalPages, cachedPages, apiUrl]);

	// Handle page change
	const handlePageChange = useCallback(
		(page: number) => {
			if (page === currentPage || page < 1 || page > totalPages) return;

			setCurrentPage(page);

			if (cachedPages[page]) {
				setBlogs(cachedPages[page]);
			} else {
				setLoading(true);
				fetchBlogs(page);
			}
		},
		[currentPage, totalPages, cachedPages, fetchBlogs],
	);

	const handleNavigation = (
		e: React.MouseEvent<HTMLAnchorElement>,
		id: number,
	) => {
		e.preventDefault();
		router.push(`/${path}/${id}`);
	};

	return (
		<div className="blogs-wrapper">
			<div className="blogs fade-in">
				<hr className="divider" />
				{loading ? (
					<LoadingSpinner />
				) : (
					blogs.map((blog) => (
						<React.Fragment key={blog.id}>
							<a
								href={`/${path}/${blog.id}`}
								className="cardblog"
								onClick={(e) => handleNavigation(e, blog.id)}
							>
								<div className="image-container">
									<Image
										src={blog.thumbnail_path.link}
										width={400}
										height={200}
										alt="Thumbnail"
										className="thumbnailset"
									/>
								</div>
								<div className="cardcontent">
									<h1 className="titleblog">{blog.title}</h1>
									<h4 className="authorblog">By: {blog.author}</h4>
									<h4 className="dateblog">
										Posted:{" "}
										{moment(blog.created_at).format("dddd, D MMMM, YYYY")}
									</h4>
									{blog.updated_at && (
										<h4 className="dateblog">
											Updated:{" "}
											{moment(blog.updated_at).format("dddd, D MMMM, YYYY")}
										</h4>
									)}
									<h3 className="descblog">{blog.description}</h3>
								</div>
							</a>
							<hr className="divider" />
						</React.Fragment>
					))
				)}
			</div>

			{totalPages > 1 && (
				<div className="pagination">
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage <= 1}
						className="pagination-button"
						aria-label="Previous page"
						type="button"
					>
						Previous
					</button>

					<div className="page-numbers">
						{[...Array(totalPages)].map((_, index) => {
							const pageNumber = index + 1;
							return (
								<button
									type="button"
									key={pageNumber}
									onClick={() => handlePageChange(pageNumber)}
									className={`page-number ${pageNumber === currentPage ? "active" : ""}`}
									aria-label={`Page ${pageNumber}`}
									aria-current={pageNumber === currentPage ? "page" : undefined}
								>
									{pageNumber}
								</button>
							);
						})}
					</div>

					<button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage >= totalPages}
						className="pagination-button"
						aria-label="Next page"
						type="button"
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
};

export default BlogsComponent;
