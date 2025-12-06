import {
	useState,
	useEffect,
	useCallback,
	type RefObject,
	useMemo,
	useRef,
} from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useDebounce } from "@/hooks";
import type { BlogList } from "@/types/BlogTypes";
import { useBlogContext } from "../BlogContext";

interface UseBlogSearchProps {
	initialBlogs: BlogList[];
	initialTotalPages: number;
	apiUrl: string;
	initialTags: string[];
	initialAuthors: string[];
	path: string;
	basePath?: string;
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
	basePath = "",
	containerRef,
}: UseBlogSearchProps) => {
	const searchParams = useSearchParams();
	const blogContext = useBlogContext();

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
			let url = `${apiUrl}/search?page=${page}&limit=5`;
			const params = [];

			if (query) params.push(`query=${encodeURIComponent(query)}`);
			if (tags.length > 0)
				params.push(`tags=${encodeURIComponent(tags.join(","))}`);
			if (author) params.push(`author=${encodeURIComponent(author)}`);

			if (params.length > 0) {
				url += `&${params.join("&")}`;
			} else {
				url = `${apiUrl}?page=${page}&limit=5`;
			}

			try {
				const response = await axios.get(url);
				// Handle both 'blogs' and 'reviews' keys from API response
				const newBlogs = response.data.blogs || response.data.reviews || [];
				const newTotalPages =
					response.data.total_pages || Math.ceil(response.data.total / 5);

				blogContext.setBlogs(newBlogs);
				blogContext.setTotalPages(newTotalPages);
				setCachedPages((prev) => ({ ...prev, [page]: newBlogs }));
			} catch (error) {
				blogContext.setBlogs([]);
			} finally {
				setLoading(false);
			}
		},
		[apiUrl, blogContext],
	);

	const handleSearch = useCallback(
		(query: string, tags: string[], author: string, page = 1) => {
			setSearchQuery(query);
			setSelectedTags(tags);
			setSelectedAuthor(author);
			setCurrentPage(page);

			const params = new URLSearchParams();
			if (query) params.set("q", query);
			if (tags.length > 0) params.set("tags", tags.join(","));
			if (author) params.set("author", author);
			if (page > 1) params.set("page", page.toString());

			const urlPath = basePath ? `/${basePath}/${path}` : `/${path}`;
			const url = params.toString() ? `${urlPath}?${params}` : urlPath;
			window.history.pushState({}, "", url);

			fetchBlogs(page, query, tags, author);
		},
		[path, basePath, fetchBlogs],
	);

	const resetFilters = useCallback(() => {
		setSearchQuery("");
		setSelectedTags([]);
		setSelectedAuthor("");
		setCurrentPage(1);
		blogContext.setBlogs(initialBlogs);
		blogContext.setTotalPages(initialTotalPages);
		const urlPath = basePath ? `/${basePath}/${path}` : `/${path}`;
		window.history.pushState({}, "", urlPath);
	}, [initialBlogs, initialTotalPages, path, basePath, blogContext]);

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

			const urlPath = basePath ? `/${basePath}/${path}` : `/${path}`;
			const url = `${urlPath}?${params}`;
			window.history.pushState({}, "", url);

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
			path,
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
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const query = searchParams?.get("q") || "";
		const tags = searchParams?.get("tags")?.split(",") || [];
		const author = searchParams?.get("author") || "";
		const page = Number(searchParams?.get("page") || 1);

		const matchesServer =
			query === "" && tags.length === 0 && author === "" && page === 1;
		if (!matchesServer) {
			fetchBlogs(page, query, tags, author);
		}

		setInitialLoadComplete(true);
	}, []); // on mount only

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
