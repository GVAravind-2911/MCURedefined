import { memo } from "react";
import type React from "react";
import { Search, RefreshCw } from "lucide-react";

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
		<div className="flex justify-center items-center min-h-[250px] sm:min-h-[350px] animate-[fadeIn_0.5s_ease] px-4">
			<div className="text-center max-w-md">
				{showIcon && (
					<div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
						<Search className="w-8 h-8 sm:w-10 sm:h-10 text-white/30" />
					</div>
				)}
				<h3 className="font-[BentonSansBold] text-xl sm:text-2xl mb-2 text-white/80">{title}</h3>
				<p className="font-[BentonSansRegular] mb-6 text-white/40 text-sm sm:text-base leading-relaxed">{description}</p>
				{resetFilters && (
					<button 
						onClick={resetFilters} 
						className="inline-flex items-center gap-2 bg-[#ec1d24]/10 border border-[#ec1d24]/30 text-[#ec1d24] py-2.5 px-5 rounded-full cursor-pointer font-[BentonSansRegular] text-sm sm:text-base transition-all duration-200 hover:bg-[#ec1d24]/20 hover:border-[#ec1d24]/50 active:scale-95 group" 
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
