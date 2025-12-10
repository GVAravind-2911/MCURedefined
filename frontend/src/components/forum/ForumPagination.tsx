"use client";

import { memo } from "react";
import type React from "react";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";

interface ForumPaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

const ForumPagination: React.FC<ForumPaginationProps> = ({
	currentPage,
	totalPages,
	onPageChange,
}) => {
	// Generate pagination numbers with ellipsis
	const getPaginationNumbers = (): (string | number)[] => {
		const pages: (string | number)[] = [];
		const maxVisiblePages = 5;

		if (totalPages <= maxVisiblePages + 2) {
			// Show all pages
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			if (currentPage <= 3) {
				// Near the start
				for (let i = 2; i <= 4; i++) {
					pages.push(i);
				}
				pages.push("ellipsis1");
				pages.push(totalPages);
			} else if (currentPage >= totalPages - 2) {
				// Near the end
				pages.push("ellipsis1");
				for (let i = totalPages - 3; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				// In the middle
				pages.push("ellipsis1");
				pages.push(currentPage - 1);
				pages.push(currentPage);
				pages.push(currentPage + 1);
				pages.push("ellipsis2");
				pages.push(totalPages);
			}
		}

		return pages;
	};

	if (totalPages <= 1) return null;

	return (
		<nav
			className="mt-8 sm:mt-10 md:mt-12 flex flex-col items-center"
			aria-label="Pagination"
		>
			{/* Pagination Container */}
			<div className="inline-flex items-center gap-1 sm:gap-1.5 p-2 sm:p-2.5 bg-white/3 backdrop-blur-sm border border-white/10 rounded-2xl">
				{/* First Page */}
				<button
					onClick={() => onPageChange(1)}
					disabled={currentPage <= 1}
					className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 text-white/60 transition-all duration-300 hover:enabled:bg-[#ec1d24]/15 hover:enabled:border-[#ec1d24]/30 hover:enabled:text-[#ec1d24] disabled:opacity-30 disabled:cursor-not-allowed"
					aria-label="First page"
					type="button"
				>
					<ChevronsLeft className="w-4 h-4 sm:w-5 sm:h-5" />
				</button>

				{/* Previous Page */}
				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage <= 1}
					className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 text-white/60 transition-all duration-300 hover:enabled:bg-[#ec1d24]/15 hover:enabled:border-[#ec1d24]/30 hover:enabled:text-[#ec1d24] disabled:opacity-30 disabled:cursor-not-allowed"
					aria-label="Previous page"
					type="button"
				>
					<ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
				</button>

				{/* Page Numbers */}
				<div className="flex items-center gap-1 sm:gap-1.5 px-1 sm:px-2">
					{getPaginationNumbers().map((page, index) => {
						if (page === "ellipsis1" || page === "ellipsis2") {
							return (
								<span
									key={`${page}-${index}`}
									className="text-white/40 flex items-center justify-center w-6 sm:w-8 text-sm"
								>
									•••
								</span>
							);
						}

						const pageNumber = page as number;
						const isActive = pageNumber === currentPage;

						return (
							<button
								type="button"
								key={pageNumber}
								onClick={() => onPageChange(pageNumber)}
								className={`flex items-center justify-center min-w-9 h-9 sm:min-w-10 sm:h-10 px-2 text-sm font-[BentonSansRegular] rounded-xl transition-all duration-300 ${
									isActive
										? "bg-linear-to-br from-[#ec1d24] to-[#c91820] text-white font-[BentonSansBold] shadow-lg shadow-[#ec1d24]/30"
										: "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white"
								}`}
								aria-label={`Page ${pageNumber}`}
								aria-current={isActive ? "page" : undefined}
							>
								{pageNumber}
							</button>
						);
					})}
				</div>

				{/* Next Page */}
				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage >= totalPages}
					className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 text-white/60 transition-all duration-300 hover:enabled:bg-[#ec1d24]/15 hover:enabled:border-[#ec1d24]/30 hover:enabled:text-[#ec1d24] disabled:opacity-30 disabled:cursor-not-allowed"
					aria-label="Next page"
					type="button"
				>
					<ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
				</button>

				{/* Last Page */}
				<button
					onClick={() => onPageChange(totalPages)}
					disabled={currentPage >= totalPages}
					className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 text-white/60 transition-all duration-300 hover:enabled:bg-[#ec1d24]/15 hover:enabled:border-[#ec1d24]/30 hover:enabled:text-[#ec1d24] disabled:opacity-30 disabled:cursor-not-allowed"
					aria-label="Last page"
					type="button"
				>
					<ChevronsRight className="w-4 h-4 sm:w-5 sm:h-5" />
				</button>
			</div>

			{/* Page info text */}
			<p className="mt-3 text-sm text-white/50 font-[BentonSansRegular]">
				Page {currentPage} of {totalPages}
			</p>
		</nav>
	);
};

export default memo(ForumPagination);
