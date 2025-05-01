import type React from "react";

interface ProfileBlogPaginationProps {
	currentPage: number;
	totalPages: number;
	handlePageChange: (page: number) => void;
	getPaginationNumbers: () => (string | number)[];
}

const BlogPagination: React.FC<ProfileBlogPaginationProps> = ({
	currentPage,
	totalPages,
	handlePageChange,
	getPaginationNumbers,
}) => {
	return (
		<nav className="pagination-container" aria-label="Pagination">
			<div className="pagination">
				<button
					onClick={() => handlePageChange(1)}
					disabled={currentPage <= 1}
					className="pagination-button first"
					aria-label="First page"
					type="button"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
					>
						<title>First</title>
						<path
							fill="currentColor"
							d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6 1.41-1.41zM6 6h2v12H6V6z"
						/>
					</svg>
					<span className="pagination-text">First</span>
				</button>

				<button
					onClick={() => handlePageChange(currentPage - 1)}
					disabled={currentPage <= 1}
					className="pagination-button prev"
					aria-label="Previous page"
					type="button"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
					>
						<title>Previous</title>
						<path
							fill="currentColor"
							d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"
						/>
					</svg>
					<span className="pagination-text">Previous</span>
				</button>

				<fieldset className="page-numbers" aria-label="Page navigation">
					{getPaginationNumbers().map((page, index) => {
						if (page === "ellipsis1" || page === "ellipsis2") {
							return (
								<span
									key={`${page}-${
										// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
										index
									}`}
									className="pagination-ellipsis"
								>
									...
								</span>
							);
						}

						const pageNumber = page as number;
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
				</fieldset>

				<button
					onClick={() => handlePageChange(currentPage + 1)}
					disabled={currentPage >= totalPages}
					className="pagination-button next"
					aria-label="Next page"
					type="button"
				>
					<span className="pagination-text">Next</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
					>
						<title>Next</title>
						<path
							fill="currentColor"
							d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"
						/>
					</svg>
				</button>

				<button
					onClick={() => handlePageChange(totalPages)}
					disabled={currentPage >= totalPages}
					className="pagination-button last"
					aria-label="Last page"
					type="button"
				>
					<span className="pagination-text">Last</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
					>
						<title>Last</title>
						<path
							fill="currentColor"
							d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6-1.41 1.41zM16 6h2v12h-2V6z"
						/>
					</svg>
				</button>
			</div>

			<div className="pagination-info">
				Showing page {currentPage} of {totalPages}
			</div>
		</nav>
	);
};

export default BlogPagination;
