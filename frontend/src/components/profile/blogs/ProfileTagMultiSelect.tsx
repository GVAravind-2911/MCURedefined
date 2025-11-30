import { useState, useRef, useEffect } from "react";
import { PiTag } from "react-icons/pi";

interface ProfileTagMultiSelectProps {
	selectedTags: string[];
	availableTags: string[];
	onChange: (tags: string[]) => void;
}

const TagMultiSelect = ({
	selectedTags,
	availableTags,
	onChange,
}: ProfileTagMultiSelectProps) => {
	const [showTagFilter, setShowTagFilter] = useState(false);
	const tagDropdownRef = useRef<HTMLDivElement>(null);

	// Handle clicks outside dropdown to close it
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				tagDropdownRef.current &&
				!tagDropdownRef.current.contains(event.target as Node)
			) {
				setShowTagFilter(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="filter-dropdown" ref={tagDropdownRef}>
			<button
				className={`filter-button ${selectedTags.length > 0 ? "filter-active" : ""}`}
				onClick={() => setShowTagFilter(!showTagFilter)}
				type="button"
				aria-haspopup="true"
				aria-expanded={showTagFilter}
			>
				{selectedTags.length > 0
					? `Tags (${selectedTags.length})`
					: "Filter by Tags"}
				<svg
					className={`dropdown-icon ${showTagFilter ? "rotated" : ""}`}
					xmlns="http://www.w3.org/2000/svg"
					width="12"
					height="12"
					viewBox="0 0 24 24"
				>
					<title>Arrow Down</title>
					<path fill="currentColor" d="M7 10l5 5 5-5z" />
				</svg>
			</button>

			{showTagFilter && (
				<div className="dropdown-menu multi-select" role="menu">
					{availableTags.length > 0 ? (
						<>
							<div className="dropdown-header">
								<span>Select multiple tags</span>
								{selectedTags.length > 0 && (
									<button
										className="clear-selection-button"
										onClick={(e) => {
											e.stopPropagation();
											onChange([]);
										}}
										type="button"
									>
										Clear
									</button>
								)}
							</div>
							{availableTags.map((tag) => (
								<button
									key={tag}
									onClick={(e) => {
										e.stopPropagation();
										// Toggle the tag in the selected list
										const newTags = selectedTags.includes(tag)
											? selectedTags.filter((t) => t !== tag)
											: [...selectedTags, tag];
										onChange(newTags);
									}}
									className={`dropdown-item multi-select-item ${selectedTags.includes(tag) ? "selected" : ""}`}
									type="button"
									role="menuitemcheckbox"
									aria-checked={selectedTags.includes(tag)}
								>
									<span className="checkbox" />
									<PiTag className="tag-icon" />
									{tag}
								</button>
							))}
						</>
					) : (
						<div className="dropdown-empty">No tags available</div>
					)}
				</div>
			)}
		</div>
	);
};

export default TagMultiSelect;
