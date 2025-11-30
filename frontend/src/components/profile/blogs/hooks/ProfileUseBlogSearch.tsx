import {
	useState,
	useEffect,
	useCallback,
	type RefObject,
	useMemo,
	useRef,
} from "react";
import { useSearchParams, usePathname } from "next/navigation";
import axios from "axios";
import useDebounce from "./ProfileUseDebounce";
import type { BlogList } from "@/types/BlogTypes";
import { useBlogContext } from "../ProfileBlogContext";

interface ProfileUseBlogSearchProps {
	initialBlogs: BlogList[];
	initialTotalPages: number;
	apiUrl: string;
	initialTags: string[];
	initialAuthors: string[];
	path: string;
	containerRef: RefObject<HTMLDivElement>;
}

interface ActiveFilter {
	type: string;
	value: string;
}

const useBlogSearch = ({
	initialBlogs,
	initialTotalPages,
	apiUrl,
	initialTags,
	initialAuthors,
	path,
	containerRef,
}: ProfileUseBlogSearchProps) => {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const blogContext = useBlogContext();

	const isProfileContext = pathname.includes("/profile");

	const [searchQuery, setSearchQuery] = useState(searchParams?.get("q") || "");
	const [selectedTags, setSelectedTags] = useState(
		searchParams?.get("tags")?.split(",") || [],
	);
	const [selectedAuthor, setSelectedAuthor] = useState(
		searchParams?.get("author") || "",
	);
	const [currentPage, setCurrentPage] = useState(
		Number(searchParams?.get("page") || 1),
	);
	const [loading, setLoading] = useState(false);
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const [initialLoadComplete, setInitialLoadComplete] = useState(false);
	const [cachedPages, setCachedPages] = useState<{ [key: number]: BlogList[] }>(
		{
			[currentPage]: blogContext.blogs,
		},
	);

	const hasTyped = useRef(false);
	const debouncedSearchQuery = useDebounce(searchQuery, 500);

	const fetchBlogs = useCallback(
		async (page: number, query = "", tags: string[] = [], author = "") => {
			setLoading(true);

			try {
				let url: string;

				// Special handling for liked content in profile
				if (apiUrl.includes("/api/user/liked")) {
					// Build search URL for liked content
					url = "/api/user/liked/search?";
					const params = [];
					params.push(
						`type=${apiUrl.includes("type=reviews") ? "reviews" : "blogs"}`,
					);
					params.push(`page=${page}`);
					params.push("limit=5");
					if (query) params.push(`query=${encodeURIComponent(query)}`);
					if (tags.length > 0)
						params.push(`tags=${encodeURIComponent(tags.join(","))}`);
					if (author) params.push(`author=${encodeURIComponent(author)}`);

					url += params.join("&");
				} else {
					// Regular content search (non-profile context)
					if (query || tags.length > 0 || author) {
						url = `/${path}/search?page=${page}&limit=5`;

						const params = [];
						if (query) params.push(`query=${encodeURIComponent(query)}`);
						if (tags.length > 0)
							params.push(`tags=${encodeURIComponent(tags.join(","))}`);
						if (author) params.push(`author=${encodeURIComponent(author)}`);

						if (params.length > 0) {
							url += `&${params.join("&")}`;
						}
					} else {
						url = `/${path}?page=${page}&limit=5`;
					}
				}

				const response = await axios.get(url);
				const newBlogs = response.data.blogs;
				const newTotalPages =
					response.data.total_pages || Math.ceil(response.data.total / 5);

				blogContext.setBlogs(newBlogs);
				blogContext.setTotalPages(newTotalPages);
				setCachedPages((prev) => ({ ...prev, [page]: newBlogs }));
			} catch (error) {
				console.error("Error fetching blogs:", error);
				blogContext.setBlogs([]);
			} finally {
				setLoading(false);
			}
		},
		[apiUrl, blogContext, path],
	);

	const handleSearch = useCallback(
		(query: string, tags: string[], author: string, page = 1) => {
			setSearchQuery(query);
			setSelectedTags(tags);
			setSelectedAuthor(author);
			setCurrentPage(page);

			// Build URL parameters
			const params = new URLSearchParams();
			if (query) params.set("q", query);
			if (tags.length > 0) params.set("tags", tags.join(","));
			if (author) params.set("author", author);
			if (page > 1) params.set("page", page.toString());

			// Keep the same pathname when updating URL params to avoid navigation
			// This is critical to fix the issue where it navigates away from profile
			const currentPath = window.location.pathname;
			const urlWithParams = params.toString()
				? `${currentPath}?${params}`
				: currentPath;
			window.history.pushState({}, "", urlWithParams);

			// Fetch filtered results
			fetchBlogs(page, query, tags, author);
		},
		[fetchBlogs],
	);

	const resetFilters = useCallback(() => {
		setSearchQuery("");
		setSelectedTags([]);
		setSelectedAuthor("");
		setCurrentPage(1);
		blogContext.setBlogs(initialBlogs);
		blogContext.setTotalPages(initialTotalPages);

		// Update URL without navigation - preserve the current pathname
		window.history.pushState({}, "", pathname);
	}, [initialBlogs, initialTotalPages, pathname, blogContext]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const handlePageChange = useCallback(
		(page: number) => {
			if (page === currentPage || page < 1 || page > blogContext.totalPages)
				return;

			setCurrentPage(page);
			if (containerRef.current) {
				containerRef.current.scrollIntoView({ behavior: "smooth" });
			}

			const params = new URLSearchParams();
			if (searchQuery) params.set("q", searchQuery);
			if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
			if (selectedAuthor) params.set("author", selectedAuthor);
			params.set("page", page.toString());

			const currentPath = window.location.pathname;
			const urlWithParams = params.toString()
				? `${currentPath}?${params}`
				: currentPath;
			window.history.pushState({}, "", urlWithParams);

			if (
				cachedPages[page] &&
				!searchQuery &&
				selectedTags.length === 0 &&
				!selectedAuthor
			) {
				blogContext.setBlogs(cachedPages[page]);
			} else {
				fetchBlogs(page, searchQuery, selectedTags, selectedAuthor);
			}
		},
		[
			currentPage,
			searchQuery,
			selectedTags,
			selectedAuthor,
			pathname,
			blogContext.totalPages,
			containerRef,
			cachedPages,
			fetchBlogs,
			blogContext,
		],
	);

	const handleTagClick = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>, tag: string) => {
			e.preventDefault();
			e.stopPropagation();
			if (!selectedTags.includes(tag)) {
				handleSearch("", [...selectedTags, tag], "");
			}
		},
		[selectedTags, handleSearch],
	);

	const getPaginationNumbers = useCallback(() => {
		const pages = [];
		pages.push(1);
		if (currentPage > 4) pages.push("ellipsis1");
		for (
			let i = Math.max(2, currentPage - 1);
			i <= Math.min(blogContext.totalPages - 1, currentPage + 1);
			i++
		) {
			pages.push(i);
		}
		if (currentPage < blogContext.totalPages - 3) pages.push("ellipsis2");
		if (blogContext.totalPages > 1) pages.push(blogContext.totalPages);
		return pages;
	}, [currentPage, blogContext.totalPages]);

	const activeFilters = useMemo(() => {
		return [
			searchQuery && { type: "query", value: searchQuery },
			...selectedTags.map((tag) => ({ type: "tag", value: tag })),
			selectedAuthor && { type: "author", value: selectedAuthor },
		].filter(Boolean) as ActiveFilter[];
	}, [searchQuery, selectedTags, selectedAuthor]);

	// Initial load logic
	useEffect(() => {
		if (!initialLoadComplete) {
			const q = searchParams?.get("q") || "";
			const tagsParam = searchParams?.get("tags");
			const tags = tagsParam ? tagsParam.split(",") : [];
			const author = searchParams?.get("author") || "";
			const page = Number(searchParams?.get("page") || 1);

			if (q || tags.length > 0 || author || page > 1) {
				// Set state values from URL parameters
				setSearchQuery(q);
				setSelectedTags(tags);
				setSelectedAuthor(author);
				setCurrentPage(page);

				// Fetch data based on URL parameters
				fetchBlogs(page, q, tags, author);
			}

			setInitialLoadComplete(true);
		}
	}, [initialLoadComplete, searchParams, fetchBlogs]);

	// Debounce-triggered fetch
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (initialLoadComplete && hasTyped.current) {
			handleSearch(debouncedSearchQuery, selectedTags, selectedAuthor, 1);
		}
	}, [debouncedSearchQuery]);

	return {
		blogs: blogContext.blogs,
		loading,
		currentPage,
		totalPages: blogContext.totalPages,
		searchQuery,
		setSearchQuery: (val: string) => {
			hasTyped.current = true;
			setSearchQuery(val);
		},
		selectedTags,
		selectedAuthor,
		tags: blogContext.tags,
		authors: blogContext.authors,
		isSearchFocused,
		setIsSearchFocused,
		handleSearch,
		handlePageChange,
		resetFilters,
		handleTagClick,
		getPaginationNumbers,
		activeFilters,
		fetchBlogs,
		initialLoadComplete,
	};
};

export default useBlogSearch;
