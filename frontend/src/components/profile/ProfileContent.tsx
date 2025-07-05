"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { BlogList } from "@/types/BlogTypes";
import type { Project } from "@/types/ProjectTypes";
import ProfileTabs from "./ProfileTabs";
import BlogComponent from "./blogs/ProfileBlogComponent";
import ProjectsGrid from "./ProjectsGrid";
import { BlogProvider } from "./blogs/ProfileBlogContext";
import ErrorMessage from "@/components/main/ErrorMessage";

interface LikedContentResponse {
	blogs?: BlogList[];
	reviews?: BlogList[]; // Changed from 'blogs' to 'reviews'
	projects?: Project[];
	total: number;
	total_pages?: number;
}

interface LikedContentOverview {
	blogs: { items: any[]; total: number };
	reviews: { items: any[]; total: number };
	projects: { items: any[]; total: number };
}

interface ProfileMetadata {
	blogs: { tags: string[]; authors: string[] };
	reviews: { tags: string[]; authors: string[] };
}

interface ProfileContentProps {
	session: {
		user: {
			id: string;
			name: string;
			email: string;
			image?: string;
		};
		session: {
			id: string;
			userId: string;
			expiresAt: Date;
			token: string;
			createdAt: Date;
			updatedAt: Date;
		};
	};
	likedContent?: LikedContentOverview | null;
	metadata?: ProfileMetadata | null;
	isLoading?: boolean;
	onRefresh?: () => Promise<void>;
}

export default function ProfileContent({ 
	session, 
	likedContent: initialLikedContent,
	metadata: initialMetadata,
	isLoading: contextLoading = false,
	onRefresh
}: ProfileContentProps) {
	const [activeTab, setActiveTab] = useState<"blogs" | "reviews" | "projects">("blogs");
	const [loading, setLoading] = useState<{ [key: string]: boolean }>({
		blogs: false,
		reviews: false,
		projects: false,
	});
	const [content, setContent] = useState<{
		[key: string]: LikedContentResponse;
	}>({
		blogs: { blogs: initialLikedContent?.blogs.items || [], total: initialLikedContent?.blogs.total || 0 },
		reviews: { reviews: initialLikedContent?.reviews.items || [], total: initialLikedContent?.reviews.total || 0 },
		projects: { projects: initialLikedContent?.projects.items || [], total: initialLikedContent?.projects.total || 0 },
	});
	const [tags, setTags] = useState<{ [key: string]: string[] }>({
		blogs: initialMetadata?.blogs.tags || [],
		reviews: initialMetadata?.reviews.tags || [],
	});
	const [authors, setAuthors] = useState<{ [key: string]: string[] }>({
		blogs: initialMetadata?.blogs.authors || [],
		reviews: initialMetadata?.reviews.authors || [],
	});
	const [errors, setErrors] = useState<{ [key: string]: boolean }>({
		blogs: false,
		reviews: false,
		projects: false,
	});

	// Function to reload data for the current tab
	const handleReload = () => {
		if (onRefresh) {
			onRefresh();
		} else {
			// Fallback to individual tab reload
			setLoading((prev) => ({
				...prev,
				[activeTab]: true,
			}));
			setErrors((prev) => ({
				...prev,
				[activeTab]: false,
			}));
			// Fetch fresh data
			fetchTabData(activeTab);
		}
	};

	// Function to fetch data for a specific tab
	const fetchTabData = async (tabType: "blogs" | "reviews" | "projects") => {
		try {
			setLoading((prev) => ({ ...prev, [tabType]: true }));
			setErrors((prev) => ({ ...prev, [tabType]: false }));

			// Fetch content data
			const contentRes = await fetch(`/api/user/liked?type=${tabType}&page=1&limit=10`);
			if (!contentRes.ok) {
				throw new Error(`Failed to fetch ${tabType} content`);
			}
			const contentData = await contentRes.json();

			setContent((prev) => ({
				...prev,
				[tabType]: contentData,
			}));

			// Fetch tags and authors for blogs and reviews
			if (tabType === "blogs" || tabType === "reviews") {
				const [tagsRes, authorsRes] = await Promise.all([
					fetch(`/api/user/liked/tags?type=${tabType}`),
					fetch(`/api/user/liked/authors?type=${tabType}`)
				]);

				if (tagsRes.ok && authorsRes.ok) {
					const [tagsData, authorsData] = await Promise.all([
						tagsRes.json(),
						authorsRes.json()
					]);

					setTags((prev) => ({
						...prev,
						[tabType]: tagsData.tags || [],
					}));
					setAuthors((prev) => ({
						...prev,
						[tabType]: authorsData.authors || [],
					}));
				}
			}
		} catch (error) {
			console.error(`Error fetching ${tabType} data:`, error);
			setErrors((prev) => ({
				...prev,
				[tabType]: true,
			}));
		} finally {
			setLoading((prev) => ({
				...prev,
				[tabType]: false,
			}));
		}
	};

	// Update content when initialLikedContent changes
	useEffect(() => {
		if (initialLikedContent) {
			setContent({
				blogs: { 
					blogs: initialLikedContent.blogs.items || [], 
					total: initialLikedContent.blogs.total || 0,
					total_pages: Math.ceil((initialLikedContent.blogs.total || 0) / 5)
				},
				reviews: { 
					reviews: initialLikedContent.reviews.items || [], 
					total: initialLikedContent.reviews.total || 0,
					total_pages: Math.ceil((initialLikedContent.reviews.total || 0) / 5)
				},
				projects: { 
					projects: initialLikedContent.projects.items || [], 
					total: initialLikedContent.projects.total || 0,
					total_pages: Math.ceil((initialLikedContent.projects.total || 0) / 5)
				},
			});
		}
	}, [initialLikedContent]);

	// Update metadata when initialMetadata changes
	useEffect(() => {
		if (initialMetadata) {
			setTags({
				blogs: initialMetadata.blogs.tags || [],
				reviews: initialMetadata.reviews.tags || [],
			});
			setAuthors({
				blogs: initialMetadata.blogs.authors || [],
				reviews: initialMetadata.reviews.authors || [],
			});
		}
	}, [initialMetadata]);

	return (
		<div className="blogs-container">
			<div className="section-title">
				<span className="title-text">Your Liked Content</span>
				<div className="title-line" />
			</div>

			<ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

			{(loading[activeTab] || contextLoading) ? (
				<div className="loading-wrapper">
					<div className="loading-spinner" />
				</div>
			) : errors[activeTab] ? (
				<ErrorMessage
					title={`Error Loading ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
					reasons={[
						"Unable to connect to the server",
						"The server might be temporarily unavailable",
						"Your network connection might be unstable",
					]}
					onReload={handleReload}
				/>
			) : (
				<div className="liked-content fade-in">
					{activeTab === "blogs" &&
						(content.blogs.blogs && content.blogs.blogs.length > 0 ? (
							<BlogProvider
								initialBlogs={content.blogs.blogs}
								initialTags={tags.blogs}
								initialAuthors={authors.blogs}
								initialTotalPages={content.blogs.total_pages || 1}
							>
								<BlogComponent
									path="blogs"
									initialBlogs={content.blogs.blogs}
									totalPages={content.blogs.total_pages || 1}
									apiUrl="/api/user/liked?type=blogs"
									initialTags={tags.blogs}
									initialAuthors={authors.blogs}
								/>
							</BlogProvider>
						) : (
							<div className="no-results">
								<div className="no-results-content">
									<h3>No liked blogs found</h3>
									<p>Blogs you like will appear here</p>
								</div>
							</div>
						))}

					{activeTab === "reviews" &&
						(content.reviews.reviews && content.reviews.reviews.length > 0 ? (
							<BlogProvider
								initialBlogs={content.reviews.reviews}
								initialTags={tags.reviews}
								initialAuthors={authors.reviews}
								initialTotalPages={content.reviews.total_pages || 1}
							>
								<BlogComponent
									path="reviews"
									initialBlogs={content.reviews.reviews}
									totalPages={content.reviews.total_pages || 1}
									apiUrl="/api/user/liked?type=reviews"
									initialTags={tags.reviews}
									initialAuthors={authors.reviews}
								/>
							</BlogProvider>
						) : (
							<div className="no-results">
								<div className="no-results-content">
									<h3>No liked reviews found</h3>
									<p>Reviews you like will appear here</p>
								</div>
							</div>
						))}

					{activeTab === "projects" &&
						(content.projects.projects &&
						content.projects.projects.length > 0 ? (
							<ProjectsGrid projects={content.projects.projects} />
						) : (
							<div className="no-results">
								<div className="no-results-content">
									<h3>No liked projects found</h3>
									<p>Projects you like will appear here</p>
								</div>
							</div>
						))}
				</div>
			)}
		</div>
	);
}
