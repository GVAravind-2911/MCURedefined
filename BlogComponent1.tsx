"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import moment from "moment";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import type { BlogList } from "@/types/BlogTypes";
import "@/styles/blogposts.css";
import axios from "axios";
import LoadingSpinner from "./frontend/src/components/LoadingSpinner";

interface BlogComponentProps {
  path: string;
  initialBlogs: BlogList[];
  totalPages: number;
  apiUrl: string;
  initialTags?: string[];
  initialAuthors?: string[];
}

// Use a custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const BlogsComponent: React.FC<BlogComponentProps> = ({
  path,
  initialBlogs,
  totalPages: initialTotalPages,
  apiUrl,
  initialTags = [],
  initialAuthors = []
}) => {
  // URL search params for shareable search links
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const authorDropdownRef = useRef<HTMLDivElement>(null);
  
  // State variables
  const [blogs, setBlogs] = useState<BlogList[]>(initialBlogs);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [cachedPages, setCachedPages] = useState<{ [key: number]: BlogList[] }>({ 1: initialBlogs });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Changed to array for multi-select
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [tags, setTags] = useState<string[]>(initialTags);
  const [authors, setAuthors] = useState<string[]>(initialAuthors);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [showAuthorFilter, setShowAuthorFilter] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Debounced search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  const router = useRouter();

  // Handle clicks outside dropdown to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close tag dropdown if click is outside
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setShowTagFilter(false);
      }
      
      // Close author dropdown if click is outside
      if (authorDropdownRef.current && !authorDropdownRef.current.contains(event.target as Node)) {
        setShowAuthorFilter(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Apply search when debounced query changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
    if (debouncedSearchQuery !== undefined) {
      handleSearch(debouncedSearchQuery, selectedTags, selectedAuthor);
    }
  }, [debouncedSearchQuery]);

  // Fetch tags and authors on component mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Only fetch if we don't have them already
        if (tags.length === 0) {
          const tagsResponse = await axios.get(`${apiUrl}/tags`);
          setTags(tagsResponse.data.tags);
        }
        if (authors.length === 0) {
          const authorsResponse = await axios.get(`${apiUrl}/authors`);
          setAuthors(authorsResponse.data.authors);
        }
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };
    
    fetchFilters();
    
    // Check URL params for search parameters
    const query = searchParams.get('q');
    const tagParam = searchParams.get('tags');
    const author = searchParams.get('author');
    const page = searchParams.get('page');
    
    if (query) {
      setSearchQuery(query);
    }
    
    if (tagParam) {
      // Split comma-separated tags into array
      const tagsArray = tagParam.split(',');
      setSelectedTags(tagsArray);
    }
    
    if (author) {
      setSelectedAuthor(author);
    }
    
    if (page) {
      setCurrentPage(Number(page));
    }
    
    // Combined search with all parameters
    if (query || tagParam || author || page) {
      handleSearch(
        query || "", 
        tagParam ? tagParam.split(',') : [], 
        author || "", 
        Number(page || 1)
      );
    }
  }, [initialTags, initialAuthors, apiUrl]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only apply shortcuts when search is not focused
      if (!isSearchFocused) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
          }
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (currentPage > 1) {
            handlePageChange(currentPage - 1);
          }
        } else if (e.key === 'Home') {
          e.preventDefault();
          if (currentPage !== 1) {
            handlePageChange(1);
          }
        } else if (e.key === 'End') {
          e.preventDefault();
          if (currentPage !== totalPages) {
            handlePageChange(totalPages);
          }
        } else if (e.key === '/' || e.key === 's') {
          e.preventDefault();
          // Focus the search input
          const searchInput = document.querySelector('.search-input') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, totalPages, isSearchFocused]);

  // Function to fetch blogs with search
  const fetchBlogs = useCallback(
    async (page: number, query = "", tags: string[] = [], author = "") => {
      setLoading(true);
      
      let url = `${apiUrl}`;
      
      // Construct search url - now combining multiple parameters
      const hasFilters = query || tags.length > 0 || author;
      
      if (hasFilters) {
        url = `${apiUrl}/search?page=${page}&limit=5`;
        const params = [];
        
        if (query) params.push(`query=${encodeURIComponent(query)}`);
        if (tags.length > 0) params.push(`tags=${encodeURIComponent(tags.join(','))}`);
        if (author) params.push(`author=${encodeURIComponent(author)}`);
        
        url += `&${params.join('&')}`;
      } else {
        url = `${apiUrl}?page=${page}&limit=5`;
      }
      
      try {
        const response = await axios.get(url);
        const newBlogs = response.data.blogs;
        const newTotalPages = response.data.total_pages || Math.ceil(response.data.total / 5);
        
        setCachedPages((prev) => ({ ...prev, [page]: newBlogs }));
        setBlogs(newBlogs);
        setTotalPages(newTotalPages);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        // Show error state
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );

  // Handle search with all filter options
  const handleSearch = (query: string, tags: string[], author: string, page =  1) => {
    setCurrentPage(page);
    setCachedPages({});
    
    // Update URL for shareable links
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (tags.length > 0) params.set('tags', tags.join(','));
    if (author) params.set('author', author);
    if (page > 1) params.set('page', page.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/${path}?${queryString}` : `/${path}`;
    
    // Update URL without triggering navigation
    window.history.pushState({}, "", url);
    
    fetchBlogs(page, query, tags, author);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setSelectedAuthor("");
    setCurrentPage(1);
    setCachedPages({ 1: initialBlogs });
    setBlogs(initialBlogs);
    setTotalPages(initialTotalPages);
    window.history.pushState({}, "", `/${path}`);
  };

  // Handle page change with smooth scrolling
  const handlePageChange = useCallback(
    (page: number) => {
      if (page === currentPage || page < 1 || page > totalPages) return;
      
      setCurrentPage(page);
      
      // Smooth scroll to top of container
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Update URL to include page number
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
      if (selectedAuthor) params.set('author', selectedAuthor);
      params.set('page', page.toString());
      
      const queryString = params.toString();
      const url = `/${path}?${queryString}`;
      
      window.history.pushState({}, "", url);
      
      // Fetch page content
      if (cachedPages[page] && !searchQuery && selectedTags.length === 0 && !selectedAuthor) {
        setBlogs(cachedPages[page]);
      } else {
        fetchBlogs(page, searchQuery, selectedTags, selectedAuthor);
      }
    },
    [currentPage, totalPages, cachedPages, fetchBlogs, searchQuery, selectedTags, selectedAuthor, path]
  );

  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: number,
  ) => {
    e.preventDefault();
    router.push(`/${path}/${id}`);
  };
  
  // Handle tag selection from a blog card
  const handleTagClick = (e: React.MouseEvent<HTMLButtonElement>, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      setSearchQuery("");
      setSelectedAuthor("");
      handleSearch("", newTags, "");
    }
  };
  
  // Toggle a tag in the multi-select dropdown
  const toggleTag = (tag: string) => {
    let newTags: string[];
    if (selectedTags.includes(tag)) {
      newTags = selectedTags.filter(t => t !== tag);
    } else {
      newTags = [...selectedTags, tag];
    }
    setSelectedTags(newTags);
    handleSearch(searchQuery, newTags, selectedAuthor);
  };

  // Generate pagination numbers with better logic for many pages
  const getPaginationNumbers = () => {
    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    // Add ellipsis if needed
    if (currentPage > 4) {
      pages.push("ellipsis1");
    }
    
    // Pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    
    // Add ellipsis if needed
    if (currentPage < totalPages - 3) {
      pages.push("ellipsis2");
    }
    
    // Always show last page if more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Calculate active filters for display
  const activeFilters = [
    searchQuery && { type: 'query', value: searchQuery },
    ...selectedTags.map(tag => ({ type: 'tag', value: tag })),
    selectedAuthor && { type: 'author', value: selectedAuthor }
  ].filter(Boolean);

  return (
    <div className="blogs-container" ref={containerRef}>
      <div className="search-filters">
        <h2 className="section-title">
          <span className="title-text">Explore Posts</span>
          <div className="title-line"/>
        </h2>
        
        <div className="search-bar">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search by title or description..."
            className="search-input"
            aria-label="Search blogs"
          />
          {searchQuery && (
            <button 
              className="search-clear-button"
              onClick={() => setSearchQuery("")}
              type="button"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <title>Clear search</title>
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          )}
          <button 
            className="search-button"
            onClick={() => handleSearch(searchQuery, selectedTags, selectedAuthor)}
            type="button"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
              <title>Search</title>
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
        </div>
        
        <div className="filter-controls">
          <div className="filter-dropdown" ref={tagDropdownRef}>
            <button 
              className={`filter-button ${selectedTags.length > 0 ? 'filter-active' : ''}`} 
              onClick={() => setShowTagFilter(!showTagFilter)}
              type="button"
              aria-haspopup="true"
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
                            setSelectedTags([]);
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
                        role="menuitem"
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
          
          <div className="filter-dropdown" ref={authorDropdownRef}>
            <button 
              className={`filter-button ${selectedAuthor ? 'filter-active' : ''}`} 
              onClick={() => setShowAuthorFilter(!showAuthorFilter)}
              type="button"
              aria-haspopup="true"
              aria-expanded={showAuthorFilter}
            >
              {selectedAuthor || "Filter by Author"} 
              <svg className={`dropdown-icon ${showAuthorFilter ? 'rotated' : ''}`} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
                <title>Filter by Author</title>
                <path fill="currentColor" d="M7 10l5 5 5-5z"/>
              </svg>
            </button>
            {showAuthorFilter && (
              <div className="dropdown-menu" role="menu">
                {authors.length > 0 ? authors.map(author => (
                  <button 
                    key={author} 
                    onClick={() => {
                      setSelectedAuthor(author);
                      setShowAuthorFilter(false);
                      handleSearch(searchQuery, selectedTags, author);
                    }}
                    className={`dropdown-item ${selectedAuthor === author ? 'selected' : ''}`}
                    type="button"
                    role="menuitem"
                  >
                    {author}
                  </button>
                )) : (
                  <div className="dropdown-empty">No authors available</div>
                )}
              </div>
            )}
          </div>
          
          {activeFilters.length > 0 && (
            <button 
              className="reset-button" 
              onClick={resetFilters}
              type="button"
              aria-label="Clear all filters"
            >
              Clear All Filters
            </button>
          )}
        </div>
        
        {activeFilters.length > 0 && (
          <div className="active-filters">
            <span className="active-filters-label">Active filters:</span>
            <div className="filter-tags">
              {activeFilters.map((filter, index) => (
                <span key={`${filter.type}-${filter.value}`} className="filter-tag">
                  <span className="filter-tag-type">
                    {filter.type === 'query' ? 'Search' : filter.type === 'tag' ? 'Tag' : 'Author'}:
                  </span>
                  {filter.value}
                  <button 
                    onClick={() => {
                      if (filter.type === 'query') {
                        setSearchQuery('');
                        handleSearch('', selectedTags, selectedAuthor);
                      } else if (filter.type === 'tag') {
                        const newTags = selectedTags.filter(t => t !== filter.value);
                        setSelectedTags(newTags);
                        handleSearch(searchQuery, newTags, selectedAuthor);
                      } else if (filter.type === 'author') {
                        setSelectedAuthor('');
                        handleSearch(searchQuery, selectedTags, '');
                      }
                    }}
                    className="filter-tag-remove"
                    aria-label={`Remove ${filter.type} filter: ${filter.value}`}
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14">
                      <title>Remove filter</title>
                      <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="blogs-wrapper">
        {loading ? (
          <div className="loading-wrapper">
            <LoadingSpinner />
          </div>
        ) : blogs.length > 0 ? (
          <div className="blogs fade-in">
            <hr className="divider" />
            {blogs.map((blog) => (
              <React.Fragment key={blog.id}>
                <a
                  href={`/${path}/${blog.id}`}
                  className="cardblog"
                  onClick={(e) => handleNavigation(e, blog.id)}
                >
                  <div className="image-container">
                    <Image
                      src={blog.thumbnail_path.link}
                      width={400}
                      height={200}
                      alt={blog.title}
                      className="thumbnailset"
                    />
                  </div>
                  <div className="cardcontent">
                    <h1 className="titleblog">{blog.title}</h1>
                    <h4 className="authorblog">By: {blog.author}</h4>
                    <h4 className="dateblog">
                      Posted:{" "}
                      {moment(blog.created_at).format("dddd, D MMMM, YYYY")}
                    </h4>
                    {blog.updated_at && (
                      <h4 className="dateblog">
                        Updated:{" "}
                        {moment(blog.updated_at).format("dddd, D MMMM, YYYY")}
                      </h4>
                    )}
                    <h3 className="descblog">{blog.description}</h3>
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="blog-tags">
                        {blog.tags.map((tag) => (
                          <button
                            key={`${blog.id}-${tag}`} 
                            className="blog-tag"
                            onClick={(e) => handleTagClick(e, tag)}
                            type="button"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </a>
                <hr className="divider" />
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-content">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
                <title>No Results</title>
                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <h3>No posts found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button onClick={resetFilters} className="reset-button" type="button">
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {totalPages > 1 && blogs.length > 0 && (
          <nav className="pagination-container" aria-label="Pagination">
            <div className="pagination">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage <= 1}
                className="pagination-button first"
                aria-label="First page"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                  <title>First</title>
                  <path fill="currentColor" d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6 1.41-1.41zM6 6h2v12H6V6z"/>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                  <title>Previous</title>
                  <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"/>
                </svg>
                <span className="pagination-text">Previous</span>
              </button>

              <fieldset className="page-numbers" aria-label="Page navigation">
                {getPaginationNumbers().map((page, index) => {
                  if (page === "ellipsis1" || page === "ellipsis2") {
                    return <span key={`${page}-${// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      index}`} className="pagination-ellipsis">...</span>;
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                  <title>Next</title>
                  <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                  <title>Last</title>
                  <path fill="currentColor" d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6-1.41 1.41zM16 6h2v12h-2V6z"/>
                </svg>
              </button>
            </div>
            
            <div className="pagination-info">
              Showing page {currentPage} of {totalPages}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default BlogsComponent;