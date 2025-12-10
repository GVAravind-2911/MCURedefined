"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { authClient } from "@/lib/auth/auth-client";
import { useDebounce } from "@/hooks/useDebounce";
import ForumTopicCard from "@/components/forum/ForumTopicCard";
import ForumFilters from "@/components/forum/ForumFilters";
import ForumPagination from "@/components/forum/ForumPagination";
import EmptyForumState from "@/components/forum/EmptyForumState";
import LoadingSpinner from "@/components/main/LoadingSpinner";
import { MessageSquare, Users, TrendingUp, Plus, Hash, Heart } from "lucide-react";

// Lazy load the modal for better initial page load
const CreateTopicModal = dynamic(
	() => import("@/components/forum/CreateTopicModal"),
	{ ssr: false },
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

	// Debounce search query for 400ms to reduce API calls
	const debouncedSearchQuery = useDebounce(searchQuery, 400);

	const sortOptions = [
		{ value: "latest", label: "Latest" },
		{ value: "popular", label: "Most Popular" },
		{ value: "oldest", label: "Oldest" },
	];

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
							: topic,
					),
				);
			}
		} catch (err) {
			console.error("Error toggling like:", err);
		}
	};

	const handleCreateTopic = async (
		title: string,
		content: string,
		spoilerData?: {
			isSpoiler: boolean;
			spoilerFor?: string;
			spoilerExpiresAt?: Date;
		},
		imageData?: { url: string; key: string },
	) => {
		if (!session?.user) {
			throw new Error("You must be signed in to create a topic");
		}

		const requestBody: any = { title, content };

		if (spoilerData?.isSpoiler) {
			requestBody.isSpoiler = true;
			requestBody.spoilerFor = spoilerData.spoilerFor;
			requestBody.spoilerExpiresAt =
				spoilerData.spoilerExpiresAt?.toISOString();
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

	const handleClearSearch = () => {
		setSearchQuery("");
		setCurrentPage(1);
	};

	return (
		<div className="flex flex-col w-full min-h-screen">
			{/* Hero Section */}
			<div className="relative w-full" data-hero-section>
				{/* Hero Background */}
				<div className="relative w-full overflow-hidden">
					{/* Gradient Background */}
					<div className="absolute inset-0 bg-linear-to-br from-[#ec1d24]/30 via-black/95 to-black" />
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-[#ec1d24]/15 via-transparent to-transparent" />

					{/* Animated Grid Pattern */}
					<div
						className="absolute inset-0 opacity-[0.05]"
						style={{
							backgroundImage:
								"linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
							backgroundSize: "40px 40px",
						}}
					/>

					{/* Decorative Floating Icons - Right Side Cluster */}
					<div className="absolute right-[5%] sm:right-[8%] md:right-[12%] top-[15%] hidden sm:flex flex-col items-end gap-3 sm:gap-4">
						{/* Primary icon - larger, more prominent */}
						<div className="relative">
							<div className="absolute inset-0 bg-[#ec1d24]/20 blur-xl rounded-full animate-pulse" />
							<MessageSquare className="relative w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 text-[#ec1d24]/20 animate-pulse" />
						</div>
						{/* Secondary icons - smaller, staggered */}
						<div className="flex items-center gap-2 sm:gap-3 -mt-2 mr-4 sm:mr-8">
							<Users className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white/15 animate-pulse [animation-delay:300ms]" />
							<TrendingUp className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 text-[#ec1d24]/15 animate-pulse [animation-delay:600ms]" />
						</div>
					</div>

					{/* Subtle accent icons - scattered for depth */}
					<div className="absolute top-[20%] right-[35%] sm:right-[40%] hidden md:block opacity-[0.08] animate-pulse [animation-delay:400ms]">
						<Hash className="w-8 h-8 lg:w-12 lg:h-12 text-white" />
					</div>
					<div className="absolute bottom-[25%] right-[25%] hidden lg:block opacity-[0.06] animate-pulse [animation-delay:800ms]">
						<Heart className="w-10 h-10 text-[#ec1d24]" />
					</div>

					{/* Content Container */}
					<div className="relative z-10 px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8">
						<div className="max-w-[1400px] mx-auto w-full">
							{/* Breadcrumb */}
							<div className="flex items-center gap-2 mb-2 text-sm text-white/50">
								<span>Home</span>
								<span>/</span>
								<span className="text-[#ec1d24]">Forum</span>
							</div>

							{/* Title Row with Badge and Create Button */}
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
								<div className="flex flex-wrap items-center gap-3 sm:gap-4">
									<h1 className="text-2xl sm:text-3xl md:text-4xl text-white font-[BentonSansBold] leading-tight">
										Community Forum
									</h1>
									<div className="flex items-center gap-2 px-3 py-1.5 bg-[#ec1d24] rounded-full">
										<MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
										<span className="text-xs sm:text-sm font-[BentonSansBold] text-white">
											Forum
										</span>
									</div>
								</div>

								{/* Create Topic Button */}
								{session?.user && (
									<button
										className="inline-flex items-center gap-2 h-12 px-6 bg-linear-to-br from-[#ec1d24] to-[#c91820] text-white font-[BentonSansBold] text-sm rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#ec1d24]/25 hover:-translate-y-0.5 active:translate-y-0"
										onClick={() => setIsCreateModalOpen(true)}
									>
										<Plus className="w-5 h-5" />
										<span>Create Topic</span>
									</button>
								)}
							</div>

							{/* Description */}
							<p className="text-sm sm:text-base text-white/60 font-[BentonSansRegular] max-w-xl leading-relaxed">
								Join the conversation! Share your thoughts, theories, and
								opinions about the Marvel Cinematic Universe with fellow fans.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
				{/* Filters */}
				<ForumFilters
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					sortBy={sortBy}
					sortOptions={sortOptions}
					onSortChange={handleSortChange}
					onSearch={handleSearch}
					onClearSearch={handleClearSearch}
					hasActiveFilters={!!searchQuery}
				/>

				{/* Error Message */}
				{error && (
					<div className="text-[#ff6666] text-center p-4 bg-[rgba(255,102,102,0.1)] rounded-lg mb-8 border border-[#ff6666]/20">
						{error}
					</div>
				)}

				{/* Content */}
				<div className="flex flex-col gap-8">
					{loading ? (
						<div className="flex justify-center items-center min-h-[300px]">
							<LoadingSpinner />
						</div>
					) : topics.length === 0 ? (
						<EmptyForumState
							title="No topics found"
							description={
								searchQuery
									? "Try adjusting your search or clear the search to see all topics."
									: "Be the first to start a discussion!"
							}
							isSearchResult={!!searchQuery}
							onResetFilters={searchQuery ? handleClearSearch : undefined}
							showCreateButton={!searchQuery && !!session?.user}
							onCreateClick={() => setIsCreateModalOpen(true)}
						/>
					) : (
						<>
							<div className="flex flex-col gap-4 sm:gap-5 w-full animate-[fadeIn_0.3s_ease-in]">
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

							<ForumPagination
								currentPage={currentPage}
								totalPages={totalPages}
								onPageChange={handlePageChange}
							/>
						</>
					)}
				</div>

				{/* Sign in prompt for non-authenticated users */}
				{!session?.user && (
					<div className="mt-10 p-6 sm:p-8 bg-white/2 backdrop-blur-sm border border-white/8 rounded-2xl text-center">
						<div className="flex items-center justify-center gap-3 mb-4">
							<div className="w-12 h-12 rounded-full bg-[#ec1d24]/10 flex items-center justify-center">
								<MessageSquare className="w-6 h-6 text-[#ec1d24]" />
							</div>
						</div>
						<h3 className="text-xl font-[BentonSansBold] text-white mb-2">
							Want to join the discussion?
						</h3>
						<p className="text-white/60 font-[BentonSansRegular] mb-6 max-w-md mx-auto">
							Sign in to create topics, comment on discussions, and connect
							with other Marvel fans.
						</p>
						<button
							className="inline-flex items-center gap-2.5 bg-linear-to-br from-[#ec1d24] to-[#c91820] text-white py-3 px-6 rounded-xl cursor-pointer font-[BentonSansBold] text-sm sm:text-base transition-all duration-300 hover:shadow-lg hover:shadow-[#ec1d24]/25 hover:-translate-y-0.5 active:translate-y-0"
							onClick={() => router.push("/auth")}
							type="button"
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
