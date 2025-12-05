"use client";

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

	return (
		<div className="flex items-center justify-center gap-2 mt-6 p-4 bg-[rgba(18,18,18,0.95)] rounded-[14px] border border-white/10">
			<button
				type="button"
				onClick={() => setCurrentPage(1)}
				disabled={currentPage === 1}
				className="flex items-center justify-center min-w-[38px] h-[38px] px-2 border border-white/10 bg-transparent text-white/70 rounded-md cursor-pointer transition-all duration-[0.25s] text-[0.9rem] hover:enabled:border-[#ec1d24] hover:enabled:text-[#ec1d24] hover:enabled:bg-[#ec1d24]/15 disabled:opacity-40 disabled:cursor-not-allowed"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<polyline points="11 17 6 12 11 7" />
					<polyline points="18 17 13 12 18 7" />
				</svg>
			</button>
			<button
				type="button"
				onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
				disabled={currentPage === 1}
				className="flex items-center justify-center min-w-[38px] h-[38px] px-2 border border-white/10 bg-transparent text-white/70 rounded-md cursor-pointer transition-all duration-[0.25s] text-[0.9rem] hover:enabled:border-[#ec1d24] hover:enabled:text-[#ec1d24] hover:enabled:bg-[#ec1d24]/15 disabled:opacity-40 disabled:cursor-not-allowed"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<polyline points="15 18 9 12 15 6" />
				</svg>
			</button>
			
			<div className="flex gap-1">
				{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
					let pageNum: number;
					if (totalPages <= 5) {
						pageNum = i + 1;
					} else if (currentPage <= 3) {
						pageNum = i + 1;
					} else if (currentPage >= totalPages - 2) {
						pageNum = totalPages - 4 + i;
					} else {
						pageNum = currentPage - 2 + i;
					}
					return (
						<button
							type="button"
							key={pageNum}
							onClick={() => setCurrentPage(pageNum)}
							className={`flex items-center justify-center min-w-[38px] h-[38px] px-2 border border-white/10 bg-transparent text-white/70 rounded-md cursor-pointer transition-all duration-[0.25s] text-[0.9rem] hover:enabled:border-[#ec1d24] hover:enabled:text-[#ec1d24] hover:enabled:bg-[#ec1d24]/15 ${currentPage === pageNum ? "bg-[#ec1d24] border-[#ec1d24] text-white" : ""}`}
						>
							{pageNum}
						</button>
					);
				})}
			</div>

			<button
				type="button"
				onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
				disabled={currentPage === totalPages}
				className="flex items-center justify-center min-w-[38px] h-[38px] px-2 border border-white/10 bg-transparent text-white/70 rounded-md cursor-pointer transition-all duration-[0.25s] text-[0.9rem] hover:enabled:border-[#ec1d24] hover:enabled:text-[#ec1d24] hover:enabled:bg-[#ec1d24]/15 disabled:opacity-40 disabled:cursor-not-allowed"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</button>
			<button
				type="button"
				onClick={() => setCurrentPage(totalPages)}
				disabled={currentPage === totalPages}
				className="flex items-center justify-center min-w-[38px] h-[38px] px-2 border border-white/10 bg-transparent text-white/70 rounded-md cursor-pointer transition-all duration-[0.25s] text-[0.9rem] hover:enabled:border-[#ec1d24] hover:enabled:text-[#ec1d24] hover:enabled:bg-[#ec1d24]/15 disabled:opacity-40 disabled:cursor-not-allowed"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<polyline points="13 17 18 12 13 7" />
					<polyline points="6 17 11 12 6 7" />
				</svg>
			</button>
		</div>
	);
}
