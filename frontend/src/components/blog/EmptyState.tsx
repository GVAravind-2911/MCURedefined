import { memo } from "react";
import type React from "react";

interface EmptyStateProps {
	title?: string;
	description?: string;
	resetFilters?: () => void;
	showIcon?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
	title = "No posts found",
	description = "Try adjusting your search or filter criteria",
	resetFilters,
	showIcon = true 
}) => {
	return (
		<div className="flex justify-center items-center min-h-[300px] text-white/70 animate-[fadeIn_0.5s_ease]">
			<div className="text-center">
				{showIcon && (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="48"
						height="48"
						className="opacity-50 mb-4 mx-auto"
					>
						<title>No Results</title>
						<path
							fill="currentColor"
							d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
						/>
					</svg>
				)}
				<h3 className="font-[BentonSansBold] text-2xl mb-2.5">{title}</h3>
				<p className="font-[BentonSansRegular] mb-5 text-white/50">{description}</p>
				{resetFilters && (
					<button onClick={resetFilters} className="bg-transparent border border-[#ec1d24]/70 text-[#ec1d24]/90 py-2.5 px-5 rounded-[20px] cursor-pointer font-[BentonSansRegular] transition-all duration-200 hover:bg-[#ec1d24]/10 hover:text-[#ec1d24]" type="button">
						Reset Filters
					</button>
				)}
			</div>
		</div>
	);
};

export default memo(EmptyState);
