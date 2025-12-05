"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { authClient } from "@/lib/auth/auth-client";
import { useDebounce } from "@/hooks/useDebounce";
import ForumTopicCard from "@/components/forum/ForumTopicCard";
import LoadingSpinner from "@/components/main/LoadingSpinner";

// Lazy load the modal for better initial page load
const CreateTopicModal = dynamic(
	() => import("@/components/forum/CreateTopicModal"),
	{ ssr: false }
);

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
	imageUrl?: string | null;
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
	}, imageData?: { url: string; key: string }) => {
		if (!session?.user) {
			throw new Error("You must be signed in to create a topic");
		}

		const requestBody: any = { title, content };
		
		if (spoilerData?.isSpoiler) {
			requestBody.isSpoiler = true;
			requestBody.spoilerFor = spoilerData.spoilerFor;
			requestBody.spoilerExpiresAt = spoilerData.spoilerExpiresAt?.toISOString();
		}

		// Add image data if provided
		if (imageData) {
			requestBody.imageUrl = imageData.url;
			requestBody.imageKey = imageData.key;
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
					className={`py-2.5 px-4 border rounded-lg font-[BentonSansRegular] font-medium cursor-pointer transition-all duration-300 ease-in-out min-w-10 text-center ${
						i === currentPage 
							? 'bg-[linear-gradient(135deg,#ec1d24,#d01c22)] border-[#ec1d24] text-white font-semibold shadow-[0_4px_15px_rgba(236,29,36,0.3)]' 
							: 'border-white/20 bg-white/5 text-white/80 hover:bg-[rgba(236,29,36,0.1)] hover:border-[rgba(236,29,36,0.5)] hover:-translate-y-0.5 hover:text-white'
					}`}
					onClick={() => handlePageChange(i)}
				>
					{i}
				</button>
			);
		}

		return (
			<div className="flex justify-center items-center mt-10 gap-2 p-5 bg-[rgba(40,40,40,0.3)] border border-white/10 rounded-lg backdrop-blur-[10px]">
				<button
					className="py-2.5 px-4 border border-white/20 rounded-lg bg-white/5 text-white/80 font-[BentonSansRegular] font-medium cursor-pointer transition-all duration-300 ease-in-out min-w-10 text-center hover:bg-[rgba(236,29,36,0.1)] hover:border-[rgba(236,29,36,0.5)] hover:-translate-y-0.5 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
					onClick={() => handlePageChange(currentPage - 1)}
					disabled={currentPage === 1}
				>
					Previous
				</button>
				{pages}
				<button
					className="py-2.5 px-4 border border-white/20 rounded-lg bg-white/5 text-white/80 font-[BentonSansRegular] font-medium cursor-pointer transition-all duration-300 ease-in-out min-w-10 text-center hover:bg-[rgba(236,29,36,0.1)] hover:border-[rgba(236,29,36,0.5)] hover:-translate-y-0.5 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
					onClick={() => handlePageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
				>
					Next
				</button>
			</div>
		);
	};

	return (
		<div className="w-full min-h-screen bg-[linear-gradient(135deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] pt-20 animate-[fadeIn_0.5s_ease]">
			<div className="max-w-[1200px] mx-auto p-8 max-md:p-4">
				{/* Forum Header */}
				<div className="flex justify-between items-center mb-8 p-8 max-md:p-6 bg-[linear-gradient(135deg,rgba(236,29,36,0.1)_0%,rgba(40,40,40,0.4)_100%)] border border-[rgba(236,29,36,0.5)] rounded-xl backdrop-blur-[10px] relative overflow-hidden max-md:flex-col max-md:gap-4 max-md:items-stretch before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[linear-gradient(90deg,transparent,#ec1d24,transparent)]">
					<h1 className="font-[BentonSansBold] text-[2.5rem] max-md:text-[2rem] max-md:text-center text-white m-0 uppercase tracking-[1px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] after:content-[''] after:block after:w-[60px] after:h-[3px] after:bg-[#ec1d24] after:mt-2">Community Forum</h1>
					{session?.user && (
						<button
							className="bg-[linear-gradient(135deg,#ec1d24,#d01c22)] text-white border-none py-3 px-6 rounded-lg font-[BentonSansBold] text-base cursor-pointer transition-all duration-300 ease-in-out no-underline inline-flex items-center gap-2 shadow-[0_4px_15px_rgba(236,29,36,0.3)] uppercase tracking-[0.5px] hover:bg-[linear-gradient(135deg,#ff3a3a,#ec1d24)] hover:-translate-y-[3px] hover:shadow-[0_6px_20px_rgba(236,29,36,0.5)]"
							onClick={() => setIsCreateModalOpen(true)}
						>
							<span>+</span>
							Create Topic
						</button>
					)}
				</div>

				{/* Forum Controls */}
				<div className="flex justify-between items-center mb-8 gap-4 flex-wrap p-5 bg-[rgba(40,40,40,0.3)] border border-white/10 rounded-lg backdrop-blur-[10px] relative z-10 max-md:flex-col max-md:gap-4">
					<form className="flex-1 max-w-[400px] max-md:max-w-none max-md:w-full" onSubmit={handleSearch}>
						<input
							type="text"
							className="w-full py-3 px-4 border border-white/20 rounded-lg bg-white/5 text-white font-[BentonSansRegular] text-base transition-all duration-300 ease-in-out placeholder:text-white/50 focus:outline-none focus:border-[#ec1d24] focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(236,29,36,0.15)]"
							placeholder="Search topics..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</form>

					<div className="flex items-center gap-3 relative z-50" ref={sortDropdownRef}>
						<label className="text-white/80 font-[BentonSansRegular] text-base font-medium">Sort by:</label>
						<div className="relative">
							<button
								type="button"
								className="flex items-center justify-between gap-3 py-2.5 px-3.5 border border-white/20 rounded-lg bg-white/10 text-white font-[BentonSansRegular] text-base cursor-pointer transition-all duration-200 ease-in-out min-w-[140px] hover:bg-white/20 hover:border-[rgba(236,29,36,0.5)] focus:outline-none focus:border-[#ec1d24] focus:shadow-[0_0_0_3px_rgba(236,29,36,0.15)]"
								onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
								aria-expanded={isSortDropdownOpen}
							>
								<span>{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
								<svg 
									className={`shrink-0 transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`}
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
								<div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-[#1a1a1a] border border-white/20 rounded-lg overflow-hidden z-1000 shadow-[0_4px_20px_rgba(0,0,0,0.4)] animate-[dropdownFadeIn_0.15s_ease]">
									{sortOptions.map((option) => (
										<button
											key={option.value}
											type="button"
											className={`block w-full py-2.5 px-3.5 bg-transparent border-none text-white/80 font-[BentonSansRegular] text-base text-left cursor-pointer transition-all duration-150 ease-in-out hover:bg-white/10 hover:text-white ${sortBy === option.value ? 'bg-[rgba(236,29,36,0.15)] text-[#ec1d24]' : ''}`}
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
					<div className="text-[#ff6666] text-center p-4 bg-[rgba(255,102,102,0.1)] rounded-lg mb-8">
						{error}
					</div>
				)}

				{loading ? (
					<LoadingSpinner />
				) : topics.length === 0 ? (
					<div className="text-center py-16 px-8 bg-[rgba(40,40,40,0.3)] border border-white/10 rounded-xl backdrop-blur-[10px]">
						<h3 className="text-[#ec1d24] mb-4 font-[BentonSansBold] text-2xl">No topics found</h3>
						{searchQuery ? (
							<p className="text-white/70 mb-8 text-lg leading-relaxed">Try adjusting your search or clear the search to see all topics.</p>
						) : (
							<>
								<p className="text-white/70 mb-8 text-lg leading-relaxed">Be the first to start a discussion!</p>
								{session?.user && (
									<button
										className="bg-[linear-gradient(135deg,#ec1d24,#d01c22)] text-white border-none py-3 px-6 rounded-lg font-[BentonSansBold] text-base cursor-pointer transition-all duration-300 ease-in-out no-underline inline-flex items-center gap-2 shadow-[0_4px_15px_rgba(236,29,36,0.3)] uppercase tracking-[0.5px] hover:bg-[linear-gradient(135deg,#ff3a3a,#ec1d24)] hover:-translate-y-[3px] hover:shadow-[0_6px_20px_rgba(236,29,36,0.5)]"
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
						<div className="flex flex-col gap-5">
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
					<div className="text-center p-8 bg-white/5 rounded-lg mt-8">
						<p className="text-white/80 mb-4">
							Want to join the discussion?
						</p>
						<button
							className="bg-[linear-gradient(135deg,#ec1d24,#d01c22)] text-white border-none py-3 px-6 rounded-lg font-[BentonSansBold] text-base cursor-pointer transition-all duration-300 ease-in-out no-underline inline-flex items-center gap-2 shadow-[0_4px_15px_rgba(236,29,36,0.3)] uppercase tracking-[0.5px] hover:bg-[linear-gradient(135deg,#ff3a3a,#ec1d24)] hover:-translate-y-[3px] hover:shadow-[0_6px_20px_rgba(236,29,36,0.5)]"
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
