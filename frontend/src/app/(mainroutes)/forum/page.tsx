"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { useDebounce } from "@/hooks/useDebounce";
import ForumTopicCard from "@/components/forum/ForumTopicCard";
import CreateTopicModal from "@/components/forum/CreateTopicModal";
import LoadingSpinner from "@/components/main/LoadingSpinner";
import "@/styles/forum.css";

interface ForumTopic {
	id: string;
	title: string;
	content: string;
	userId: string;
	username: string;
	userImage: string | null;
	createdAt: string;
	likeCount: number;
	commentCount: number;
	pinned: boolean;
	locked: boolean;
	isSpoiler?: boolean;
	spoilerFor?: string;
	spoilerExpiresAt?: string;
	userHasLiked?: boolean;
}

interface ForumResponse {
	topics: ForumTopic[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export default function ForumPage(): React.ReactElement {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	
	const [topics, setTopics] = useState<ForumTopic[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState("latest");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
	const sortDropdownRef = useRef<HTMLDivElement>(null);

	// Debounce search query for 400ms to reduce API calls
	const debouncedSearchQuery = useDebounce(searchQuery, 400);

	const sortOptions = [
		{ value: "latest", label: "Latest" },
		{ value: "popular", label: "Most Popular" },
		{ value: "oldest", label: "Oldest" },
	];

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
				setIsSortDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const fetchTopics = async (page = 1, search = "", sort = "latest") => {
		try {
			setLoading(true);
			setError("");

			const params = new URLSearchParams({
				page: page.toString(),
				limit: "10",
				sortBy: sort,
				...(search && { search }),
			});

			const response = await fetch(`/api/forum/topics?${params}`);
			
			if (!response.ok) {
				throw new Error("Failed to fetch topics");
			}

			const data: ForumResponse = await response.json();
			setTopics(data.topics);
			setTotalPages(data.pagination.totalPages);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTopics(currentPage, debouncedSearchQuery, sortBy);
	}, [currentPage, debouncedSearchQuery, sortBy]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		// Search is now handled by debounce, but keep form handler for explicit submit
		setCurrentPage(1);
	};

	const handleSortChange = (newSort: string) => {
		setSortBy(newSort);
		setCurrentPage(1);
	};

	const handleTopicClick = (topicId: string) => {
		router.push(`/forum/${topicId}`);
	};

	const handleLikeToggle = async (topicId: string) => {
		if (!session?.user) return;

		try {
			const response = await fetch("/api/forum/topics/like", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ topicId }),
			});

			if (response.ok) {
				const result = await response.json();
				setTopics((prevTopics) =>
					prevTopics.map((topic) =>
						topic.id === topicId
							? {
									...topic,
									userHasLiked: result.liked,
									likeCount: topic.likeCount + (result.liked ? 1 : -1),
							  }
							: topic
					)
				);
			}
		} catch (err) {
			console.error("Error toggling like:", err);
		}
	};

	const handleCreateTopic = async (title: string, content: string, spoilerData?: {
		isSpoiler: boolean;
		spoilerFor?: string;
		spoilerExpiresAt?: Date;
	}) => {
		if (!session?.user) {
			throw new Error("You must be signed in to create a topic");
		}

		const requestBody: any = { title, content };
		
		if (spoilerData?.isSpoiler) {
			requestBody.isSpoiler = true;
			requestBody.spoilerFor = spoilerData.spoilerFor;
			requestBody.spoilerExpiresAt = spoilerData.spoilerExpiresAt?.toISOString();
		}

		const response = await fetch("/api/forum/topics", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Failed to create topic");
		}

		// Refresh topics list
		await fetchTopics(1, searchQuery, sortBy);
		setCurrentPage(1);
	};

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	const renderPagination = () => {
		if (totalPages <= 1) return null;

		const pages = [];
		const maxVisiblePages = 5;
		let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
		let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

		if (endPage - startPage + 1 < maxVisiblePages) {
			startPage = Math.max(1, endPage - maxVisiblePages + 1);
		}

		for (let i = startPage; i <= endPage; i++) {
			pages.push(
				<button
					key={i}
					className={`pagination-button ${i === currentPage ? "active" : ""}`}
					onClick={() => handlePageChange(i)}
				>
					{i}
				</button>
			);
		}

		return (
			<div className="forum-pagination">
				<button
					className="pagination-button"
					onClick={() => handlePageChange(currentPage - 1)}
					disabled={currentPage === 1}
				>
					Previous
				</button>
				{pages}
				<button
					className="pagination-button"
					onClick={() => handlePageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
				>
					Next
				</button>
			</div>
		);
	};

	return (
		<div className="forum-page fade-in">
			<div className="forum-container">
				<div className="forum-header">
					<h1 className="forum-title">Community Forum</h1>
					{session?.user && (
						<button
							className="create-topic-button"
							onClick={() => setIsCreateModalOpen(true)}
						>
							<span>+</span>
							Create Topic
						</button>
					)}
				</div>

				<div className="forum-controls">
					<form className="forum-search" onSubmit={handleSearch}>
						<input
							type="text"
							className="forum-search-input"
							placeholder="Search topics..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</form>

					<div className="forum-sort" ref={sortDropdownRef}>
						<label className="forum-sort-label">Sort by:</label>
						<div className="forum-sort-dropdown">
							<button
								type="button"
								className="forum-sort-trigger"
								onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
								aria-expanded={isSortDropdownOpen}
							>
								<span>{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
								<svg 
									className={`forum-sort-arrow ${isSortDropdownOpen ? 'open' : ''}`}
									width="12" 
									height="12" 
									viewBox="0 0 24 24" 
									fill="none" 
									stroke="currentColor" 
									strokeWidth="2"
								>
									<polyline points="6,9 12,15 18,9"></polyline>
								</svg>
							</button>
							{isSortDropdownOpen && (
								<div className="forum-sort-menu">
									{sortOptions.map((option) => (
										<button
											key={option.value}
											type="button"
											className={`forum-sort-option ${sortBy === option.value ? 'selected' : ''}`}
											onClick={() => {
												handleSortChange(option.value);
												setIsSortDropdownOpen(false);
											}}
										>
											{option.label}
										</button>
									))}
								</div>
							)}
						</div>
					</div>
				</div>

				{error && (
					<div style={{ 
						color: "#ff6666", 
						textAlign: "center", 
						padding: "1rem",
						backgroundColor: "rgba(255, 102, 102, 0.1)",
						borderRadius: "8px",
						marginBottom: "2rem"
					}}>
						{error}
					</div>
				)}

				{loading ? (
					<div className="forum-loading">
						<LoadingSpinner />
					</div>
				) : topics.length === 0 ? (
					<div className="forum-empty">
						<h3>No topics found</h3>
						{searchQuery ? (
							<p>Try adjusting your search or clear the search to see all topics.</p>
						) : (
							<>
								<p>Be the first to start a discussion!</p>
								{session?.user && (
									<button
										className="create-topic-button"
										onClick={() => setIsCreateModalOpen(true)}
									>
										Create the first topic
									</button>
								)}
							</>
						)}
					</div>
				) : (
					<>
						<div className="forum-topics">
							{topics.map((topic) => (
								<ForumTopicCard
									key={topic.id}
									topic={topic}
									onTopicClick={handleTopicClick}
									onLikeToggle={handleLikeToggle}
									isAuthenticated={!!session?.user}
								/>
							))}
						</div>
						{renderPagination()}
					</>
				)}

				{!session?.user && (
					<div style={{
						textAlign: "center",
						padding: "2rem",
						backgroundColor: "rgba(255, 255, 255, 0.05)",
						borderRadius: "8px",
						marginTop: "2rem"
					}}>
						<p style={{ color: "rgba(255, 255, 255, 0.8)", marginBottom: "1rem" }}>
							Want to join the discussion?
						</p>
						<button
							className="create-topic-button"
							onClick={() => router.push("/auth")}
						>
							Sign In to Participate
						</button>
					</div>
				)}
			</div>

			<CreateTopicModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSubmit={handleCreateTopic}
			/>
		</div>
	);
}
