import { memo } from "react";
import type React from "react";

interface BlogPaginationProps {
	currentPage: number;
	totalPages: number;
	handlePageChange: (page: number) => void;
	getPaginationNumbers: () => (string | number)[];
}

const BlogPagination: React.FC<BlogPaginationProps> = ({
	currentPage,
	totalPages,
	handlePageChange,
	getPaginationNumbers,
}) => {
	return (
		<nav className="mt-12 flex flex-col items-center" aria-label="Pagination">
			<div className="flex items-center justify-center flex-wrap gap-2 p-0 m-0">
				<button
					onClick={() => handlePageChange(1)}
					disabled={currentPage <= 1}
					className="flex items-center gap-1.5 bg-[#ec1d24]/10 text-[#ec1d24]/80 border border-[#ec1d24]/40 py-2 px-4 rounded-[20px] cursor-pointer font-[BentonSansBold] text-sm transition-all duration-200 hover:not-disabled:bg-[#ec1d24]/20 hover:not-disabled:text-[#ec1d24] disabled:opacity-40 disabled:cursor-not-allowed"
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
					<span className="max-md:hidden">First</span>
				</button>

				<button
					onClick={() => handlePageChange(currentPage - 1)}
					disabled={currentPage <= 1}
					className="flex items-center gap-1.5 bg-[#ec1d24]/10 text-[#ec1d24]/80 border border-[#ec1d24]/40 py-2 px-4 rounded-[20px] cursor-pointer font-[BentonSansBold] text-sm transition-all duration-200 hover:enabled:bg-[#ec1d24]/20 hover:enabled:text-[#ec1d24] disabled:opacity-40 disabled:cursor-not-allowed"
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
					<span className="inline-block">Previous</span>
				</button>

				<fieldset className="flex items-center gap-1.5 border-0 p-0 m-0" aria-label="Page navigation">
					{getPaginationNumbers().map((page, index) => {
						if (page === "ellipsis1" || page === "ellipsis2") {
							return (
								<span
									key={`${page}-${
										// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
										index
									}`}
									className="text-white/50 flex items-center justify-center h-9"
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
								className={`flex items-center justify-center min-w-9 max-md:min-w-[30px] h-9 max-md:h-[30px] max-md:text-xs border-none rounded-full cursor-pointer font-[BentonSansRegular] transition-all duration-200 ${pageNumber === currentPage ? "bg-[#ec1d24] text-white font-[BentonSansBold] scale-110 shadow-[0_0_15px_rgba(236,29,36,0.6)] ring-2 ring-[#ec1d24]/50 ring-offset-1 ring-offset-black" : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"}`}
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
					className="flex items-center gap-1.5 bg-[#ec1d24]/10 text-[#ec1d24]/80 border border-[#ec1d24]/40 py-2 px-4 rounded-[20px] cursor-pointer font-[BentonSansBold] text-sm transition-all duration-200 hover:not-disabled:bg-[#ec1d24]/20 hover:not-disabled:text-[#ec1d24] disabled:opacity-40 disabled:cursor-not-allowed"
					aria-label="Next page"
					type="button"
				>
					<span className="inline-block">Next</span>
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
					className="flex items-center gap-1.5 bg-[#ec1d24]/10 text-[#ec1d24]/80 border border-[#ec1d24]/40 py-2 px-4 rounded-[20px] cursor-pointer font-[BentonSansBold] text-sm transition-all duration-200 hover:not-disabled:bg-[#ec1d24]/20 hover:not-disabled:text-[#ec1d24] disabled:opacity-40 disabled:cursor-not-allowed"
					aria-label="Last page"
					type="button"
				>
					<span className="max-md:hidden">Last</span>
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

			<div className="mt-2.5 text-sm text-white/60">
				Showing page {currentPage} of {totalPages}
			</div>
		</nav>
	);
};

export default memo(BlogPagination);
