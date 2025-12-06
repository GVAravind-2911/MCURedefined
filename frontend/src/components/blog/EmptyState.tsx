import { memo } from "react";
import type React from "react";
import { Search, RefreshCw, FileX } from "lucide-react";

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
	showIcon = true,
}) => {
	return (
		<div className="flex justify-center items-center min-h-[300px] sm:min-h-[400px] animate-[fadeIn_0.5s_ease]">
			<div className="text-center max-w-md px-6 py-10 bg-white/2 backdrop-blur-sm border border-white/8 rounded-2xl">
				{showIcon && (
					<div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6">
						{/* Background glow */}
						<div className="absolute inset-0 bg-[#ec1d24]/10 blur-xl rounded-full" />
						{/* Icon container */}
						<div className="relative w-full h-full rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
							<FileX className="w-10 h-10 sm:w-12 sm:h-12 text-white/25" />
						</div>
					</div>
				)}
				<h3 className="font-[BentonSansBold] text-xl sm:text-2xl mb-3 text-white">
					{title}
				</h3>
				<p className="font-[BentonSansRegular] mb-8 text-white/50 text-sm sm:text-base leading-relaxed">
					{description}
				</p>
				{resetFilters && (
					<button
						onClick={resetFilters}
						className="inline-flex items-center gap-2.5 bg-linear-to-br from-[#ec1d24] to-[#c91820] text-white py-3 px-6 rounded-xl cursor-pointer font-[BentonSansBold] text-sm sm:text-base transition-all duration-300 hover:shadow-lg hover:shadow-[#ec1d24]/25 hover:-translate-y-0.5 active:translate-y-0 group"
						type="button"
					>
						<RefreshCw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" />
						Reset Filters
					</button>
				)}
			</div>
		</div>
	);
};

export default memo(EmptyState);
