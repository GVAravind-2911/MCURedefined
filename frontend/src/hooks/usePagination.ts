import { useState, useCallback, useMemo } from "react";

export interface PaginationState {
	currentPage: number;
	totalPages: number;
	total: number;
	limit: number;
}

export interface UsePaginationOptions {
	initialPage?: number;
	initialLimit?: number;
	onPageChange?: (page: number) => void;
}

export interface UsePaginationReturn {
	/** Current page number (1-indexed) */
	currentPage: number;
	/** Total number of pages */
	totalPages: number;
	/** Total number of items */
	total: number;
	/** Items per page */
	limit: number;
	/** Whether on the first page */
	isFirstPage: boolean;
	/** Whether on the last page */
	isLastPage: boolean;
	/** Go to a specific page */
	goToPage: (page: number) => void;
	/** Go to next page */
	nextPage: () => void;
	/** Go to previous page */
	previousPage: () => void;
	/** Go to first page */
	firstPage: () => void;
	/** Go to last page */
	lastPage: () => void;
	/** Set pagination data from API response */
	setPaginationData: (data: Partial<PaginationState>) => void;
	/** Set items per page limit */
	setLimit: (limit: number) => void;
	/** Get array of page numbers for pagination UI */
	getPageNumbers: () => (number | "ellipsis")[];
	/** Calculate offset for API requests */
	offset: number;
}

/**
 * Custom hook for managing pagination state.
 * Provides utilities for navigating between pages and generating pagination UI.
 */
export function usePagination({
	initialPage = 1,
	initialLimit = 10,
	onPageChange,
}: UsePaginationOptions = {}): UsePaginationReturn {
	const [currentPage, setCurrentPage] = useState(initialPage);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);
	const [limit, setLimitState] = useState(initialLimit);

	const isFirstPage = currentPage === 1;
	const isLastPage = currentPage >= totalPages;
	const offset = (currentPage - 1) * limit;

	const goToPage = useCallback(
		(page: number) => {
			if (page >= 1 && page <= totalPages && page !== currentPage) {
				setCurrentPage(page);
				onPageChange?.(page);
			}
		},
		[totalPages, currentPage, onPageChange],
	);

	const nextPage = useCallback(() => {
		if (!isLastPage) {
			goToPage(currentPage + 1);
		}
	}, [currentPage, isLastPage, goToPage]);

	const previousPage = useCallback(() => {
		if (!isFirstPage) {
			goToPage(currentPage - 1);
		}
	}, [currentPage, isFirstPage, goToPage]);

	const firstPage = useCallback(() => {
		goToPage(1);
	}, [goToPage]);

	const lastPage = useCallback(() => {
		goToPage(totalPages);
	}, [totalPages, goToPage]);

	const setPaginationData = useCallback((data: Partial<PaginationState>) => {
		if (data.currentPage !== undefined) setCurrentPage(data.currentPage);
		if (data.totalPages !== undefined) setTotalPages(data.totalPages);
		if (data.total !== undefined) setTotal(data.total);
		if (data.limit !== undefined) setLimitState(data.limit);
	}, []);

	const setLimit = useCallback((newLimit: number) => {
		setLimitState(newLimit);
		setCurrentPage(1); // Reset to first page when limit changes
	}, []);

	const getPageNumbers = useCallback((): (number | "ellipsis")[] => {
		const pages: (number | "ellipsis")[] = [];
		const maxVisiblePages = 5;

		if (totalPages <= maxVisiblePages + 2) {
			// Show all pages if there aren't too many
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			// Calculate range around current page
			let startPage = Math.max(2, currentPage - 1);
			let endPage = Math.min(totalPages - 1, currentPage + 1);

			// Adjust if we're near the beginning
			if (currentPage <= 3) {
				endPage = Math.min(totalPages - 1, 4);
			}
			// Adjust if we're near the end
			if (currentPage >= totalPages - 2) {
				startPage = Math.max(2, totalPages - 3);
			}

			// Add ellipsis before middle pages if needed
			if (startPage > 2) {
				pages.push("ellipsis");
			}

			// Add middle pages
			for (let i = startPage; i <= endPage; i++) {
				pages.push(i);
			}

			// Add ellipsis after middle pages if needed
			if (endPage < totalPages - 1) {
				pages.push("ellipsis");
			}

			// Always show last page
			if (totalPages > 1) {
				pages.push(totalPages);
			}
		}

		return pages;
	}, [currentPage, totalPages]);

	return {
		currentPage,
		totalPages,
		total,
		limit,
		isFirstPage,
		isLastPage,
		goToPage,
		nextPage,
		previousPage,
		firstPage,
		lastPage,
		setPaginationData,
		setLimit,
		getPageNumbers,
		offset,
	};
}

export default usePagination;
