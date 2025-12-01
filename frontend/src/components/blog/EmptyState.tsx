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
		<div className="no-results">
			<div className="no-results-content">
				{showIcon && (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="48"
						height="48"
					>
						<title>No Results</title>
						<path
							fill="currentColor"
							d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
						/>
					</svg>
				)}
				<h3>{title}</h3>
				<p>{description}</p>
				{resetFilters && (
					<button onClick={resetFilters} className="reset-button" type="button">
						Reset Filters
					</button>
				)}
			</div>
		</div>
	);
};

export default memo(EmptyState);
