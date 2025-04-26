import { useState, useRef, useEffect } from "react";
import type React from "react";

interface TagMultiSelectProps {
  selectedTags: string[];
  tags: string[];
  toggleTag: (tag: string) => void;
  searchQuery: string;
  selectedAuthor: string;
  handleSearch: (query: string, tags: string[], author: string) => void;
}

const TagMultiSelect: React.FC<TagMultiSelectProps> = ({ 
  selectedTags, 
  tags,
  toggleTag,
  searchQuery,
  selectedAuthor,
  handleSearch
}) => {
  const [showTagFilter, setShowTagFilter] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
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
        className={`filter-button ${selectedTags.length > 0 ? 'filter-active' : ''}`} 
        onClick={() => setShowTagFilter(!showTagFilter)}
        type="button"
        aria-haspopup="menu"
        aria-expanded={showTagFilter}
      >
        {selectedTags.length ? `${selectedTags.length} Tag${selectedTags.length > 1 ? 's' : ''} Selected` : "Filter by Tags"} 
        <svg className={`dropdown-icon ${showTagFilter ? 'rotated' : ''}`} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
          <title>Filter by Tags</title>
          <path fill="currentColor" d="M7 10l5 5 5-5z"/>
        </svg>
      </button>
      {showTagFilter && (
        <div className="dropdown-menu multi-select" role="menu">
          {tags.length > 0 ? (
            <>
              <div className="dropdown-header">
                <span>Select multiple tags</span>
                {selectedTags.length > 0 && (
                  <button 
                    className="clear-selection-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSearch(searchQuery, [], selectedAuthor);
                    }}
                    type="button"
                  >
                    Clear
                  </button>
                )}
              </div>
              {tags.map(tag => (
                <button 
                  key={tag} 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent closing dropdown
                    toggleTag(tag);
                  }}
                  className={`dropdown-item multi-select-item ${selectedTags.includes(tag) ? 'selected' : ''}`}
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={selectedTags.includes(tag)}
                >
                  <span className="checkbox">
                    {selectedTags.includes(tag) && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                        <title>Selected</title>
                        <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                  </span>
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