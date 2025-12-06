"use client";

import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";

interface UserPaginationProps {
	currentPage: number;
	totalPages: number;
	setCurrentPage: (page: number) => void;
}

export default function UserPagination({
	currentPage,
	totalPages,
	setCurrentPage,
}: UserPaginationProps) {
	if (totalPages <= 1) return null;

	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		const maxVisible = 5;

		if (totalPages <= maxVisible + 2) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
		} else {
			pages.push(1);

			if (currentPage <= 3) {
				for (let i = 2; i <= 4; i++) pages.push(i);
				pages.push("...");
			} else if (currentPage >= totalPages - 2) {
				pages.push("...");
				for (let i = totalPages - 3; i < totalPages; i++) pages.push(i);
			} else {
				pages.push("...");
				for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
				pages.push("...");
			}

			pages.push(totalPages);
		}

		return pages;
	};

	return (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8 p-4 sm:p-5 bg-white/2 backdrop-blur-sm rounded-2xl border border-white/10">
			{/* Page Info */}
			<div className="text-sm text-white/50 order-2 sm:order-1">
				Page <span className="text-white font-medium">{currentPage}</span> of{" "}
				<span className="text-white font-medium">{totalPages}</span>
			</div>

			{/* Pagination Controls */}
			<div className="flex items-center gap-1.5 order-1 sm:order-2">
				{/* First Page */}
				<button
					type="button"
					onClick={() => setCurrentPage(1)}
					disabled={currentPage === 1}
					className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/60 transition-all duration-300 hover:enabled:bg-[#ec1d24]/15 hover:enabled:border-[#ec1d24]/50 hover:enabled:text-[#ec1d24] disabled:opacity-30 disabled:cursor-not-allowed"
					title="First page"
				>
					<ChevronsLeft className="w-4 h-4" />
				</button>

				{/* Previous Page */}
				<button
					type="button"
					onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
					className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/60 transition-all duration-300 hover:enabled:bg-[#ec1d24]/15 hover:enabled:border-[#ec1d24]/50 hover:enabled:text-[#ec1d24] disabled:opacity-30 disabled:cursor-not-allowed"
					title="Previous page"
				>
					<ChevronLeft className="w-4 h-4" />
				</button>

				{/* Page Numbers */}
				<div className="flex items-center gap-1">
					{getPageNumbers().map((page, index) =>
						page === "..." ? (
							<span
								key={`ellipsis-${index}`}
								className="w-10 h-10 flex items-center justify-center text-white/30"
							>
								•••
							</span>
						) : (
							<button
								type="button"
								key={page}
								onClick={() => setCurrentPage(page as number)}
								className={`flex items-center justify-center min-w-10 h-10 px-3 rounded-xl text-sm font-medium transition-all duration-300 ${
									currentPage === page
										? "bg-linear-to-br from-[#ec1d24] to-[#c91820] text-white shadow-lg shadow-[#ec1d24]/25 scale-105"
										: "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20"
								}`}
							>
								{page}
							</button>
						),
					)}
				</div>

				{/* Next Page */}
				<button
					type="button"
					onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
					disabled={currentPage === totalPages}
					className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/60 transition-all duration-300 hover:enabled:bg-[#ec1d24]/15 hover:enabled:border-[#ec1d24]/50 hover:enabled:text-[#ec1d24] disabled:opacity-30 disabled:cursor-not-allowed"
					title="Next page"
				>
					<ChevronRight className="w-4 h-4" />
				</button>

				{/* Last Page */}
				<button
					type="button"
					onClick={() => setCurrentPage(totalPages)}
					disabled={currentPage === totalPages}
					className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/60 transition-all duration-300 hover:enabled:bg-[#ec1d24]/15 hover:enabled:border-[#ec1d24]/50 hover:enabled:text-[#ec1d24] disabled:opacity-30 disabled:cursor-not-allowed"
					title="Last page"
				>
					<ChevronsRight className="w-4 h-4" />
				</button>
			</div>

			{/* Quick Jump (Desktop only) */}
			<div className="hidden lg:flex items-center gap-2 order-3">
				<span className="text-sm text-white/50">Go to:</span>
				<input
					type="number"
					min={1}
					max={totalPages}
					placeholder="#"
					className="w-16 h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm text-center placeholder:text-white/30 focus:outline-none focus:border-[#ec1d24]/50 focus:ring-2 focus:ring-[#ec1d24]/20 transition-all duration-300"
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							const value = parseInt((e.target as HTMLInputElement).value);
							if (value >= 1 && value <= totalPages) {
								setCurrentPage(value);
								(e.target as HTMLInputElement).value = "";
							}
						}
					}}
				/>
			</div>
		</div>
	);
}
