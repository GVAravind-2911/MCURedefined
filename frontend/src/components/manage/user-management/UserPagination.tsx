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
		<div className="pagination">
			<button
				type="button"
				onClick={() => setCurrentPage(1)}
				disabled={currentPage === 1}
				className="pagination-btn"
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
				className="pagination-btn"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<polyline points="15 18 9 12 15 6" />
				</svg>
			</button>
			
			<div className="pagination-pages">
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
							className={`pagination-btn page-num ${currentPage === pageNum ? "active" : ""}`}
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
				className="pagination-btn"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</button>
			<button
				type="button"
				onClick={() => setCurrentPage(totalPages)}
				disabled={currentPage === totalPages}
				className="pagination-btn"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<polyline points="13 17 18 12 13 7" />
					<polyline points="6 17 11 12 6 7" />
				</svg>
			</button>
		</div>
	);
}
