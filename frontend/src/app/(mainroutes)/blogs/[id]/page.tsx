import type { AxiosError } from "axios";
import type { JSX } from "react";
import type { BlogData, ContentBlock, Article } from "@/types/BlogTypes";
import React from "react";
import { notFound } from "next/navigation";
import moment from "moment";
import axios from "axios";
import parse from "html-react-parser";
import ScriptEmbed from "@/components/edit/ScriptEmbed";
import Image from "next/image";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { getUserLikedBlog } from "@/db/blog-likes";
import { getBlogInteractions, incrementBlogView } from "@/db/blog-interactions";
import Link from "next/link";
import ErrorMessage from "@/components/main/ErrorMessage";
import CommentSection from "@/components/comments/DynamicComment";
import FixedSidebar from "@/components/blog/FixedSidebar";
import FloatingActionBar from "@/components/blog/FloatingActionBar";
import BackButton from "@/components/blog/BackButton";
import { getBackendUrl } from "@/lib/config/backend";
import { Clock, Calendar, Eye, Newspaper } from "lucide-react";

interface PageProps {
	params: Promise<{
		id: number;
	}>;
}

interface ErrorState {
	hasError: boolean;
	title: string;
	reasons: string[];
}

// Common error handling function
const handleApiError = (error: unknown): ErrorState => {
	const axiosError = error as AxiosError;

	if (axiosError.code === "ECONNREFUSED") {
		return {
			hasError: true,
			title: "Connection Failed",
			reasons: [
				"The server appears to be offline",
				"Unable to establish connection to the API",
				"Please try again later",
			],
		};
		// biome-ignore lint/style/noUselessElse: <explanation>
	} else if (
		axiosError.code === "ETIMEDOUT" ||
		axiosError.message?.includes("timeout")
	) {
		return {
			hasError: true,
			title: "Connection Timeout",
			reasons: [
				"The server took too long to respond",
				"This may be due to high traffic or server load",
				"Please try refreshing the page",
			],
		};
		// biome-ignore lint/style/noUselessElse: <explanation>
	} else {
		return {
			hasError: true,
			title: "Unable to Load Blog",
			reasons: [
				"The blog may have been removed",
				"Temporary server error",
				"Please try again later",
			],
		};
	}
};

async function getBlogData(id: number): Promise<BlogData | ErrorState> {
	try {
		const response = await axios.get<BlogData>(
			getBackendUrl(`blogs/${id}`),
			{
				timeout: 10000, // 10 second timeout
				headers: {
					"Cache-Control": "no-cache",
				},
			},
		);
		return response.data;
	} catch (error) {
		return handleApiError(error);
	}
}

async function getLatestBlogs(): Promise<Article[] | null> {
	try {
		const response = await axios.get<Article[]>(
			getBackendUrl("blogs/latest"),
			{
				timeout: 5000,
				headers: {
					"Cache-Control": "no-cache",
				},
			},
		);
		return response.data;
	} catch (error) {
		return null;
	}
}

const loadScript = (url: string): JSX.Element => {
	if (url.includes("www.youtube.com")) {
		const regex =
			/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|vi|e(?:mbed)?)\/|\S*?[?&]v=|(?:\S*\?list=))|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
		const match = url.match(regex);
		if (match) {
			const videoId = match[1];
			return (
				<iframe
					src={`https://www.youtube.com/embed/${videoId}`}
					title="youtube-video"
					allowFullScreen
					className="w-full h-full absolute inset-0"
				/>
			);
		}
	}
	return <div className="text-[#ec1d24] text-center py-4">Invalid embed URL</div>;
};

// Calculate estimated reading time
const calculateReadingTime = (content: ContentBlock[]): number => {
	const wordsPerMinute = 200;
	let totalWords = 0;
	
	for (const block of content) {
		if (block.type === "text" && typeof block.content === "string") {
			// Strip HTML tags and count words
			const plainText = block.content.replace(/<[^>]*>/g, " ");
			totalWords += plainText.split(/\s+/).filter(word => word.length > 0).length;
		}
	}
	
	return Math.max(1, Math.ceil(totalWords / wordsPerMinute));
};

export default async function BlogPage(props: PageProps): Promise<JSX.Element> {
	const params = await props.params;
	const blogResult = await getBlogData(params.id);

	// Check if we received an error state instead of a blog
	if ("hasError" in blogResult) {
		return (
			<ErrorMessage title={blogResult.title} reasons={blogResult.reasons} />
		);
	}

	const blog = blogResult;
	const latestBlogs = await getLatestBlogs();
	const session = await auth.api.getSession({ headers: await headers() });

	// Only attempt to get user interactions if blog exists
	const userHasLiked = session?.user
		? await getUserLikedBlog(session.user.id, blog.id)
		: null;
	const totalInteractions = await getBlogInteractions(blog.id);

	if (blog) {
		await incrementBlogView(blog.id);
	}

	if (!blog) {
		notFound();
	}

	const contentElements = blog.content.map(
		(block: ContentBlock, index: number): JSX.Element => {
			const uniqueKey = `${block.id || index}-${block.type}`;

			switch (block.type) {
				case "text":
					return (
						<div key={uniqueKey} className="w-full prose prose-invert prose-lg max-w-none [&_i]:text-[#ec1d24] [&_b_i]:text-[#ec1d24] [&_p]:text-white/85 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_a]:text-[#ec1d24] [&_a:hover]:text-[#ff3d44] [&_blockquote]:border-l-[#ec1d24] [&_blockquote]:bg-white/5 [&_blockquote]:py-2 [&_blockquote]:px-4 [&_blockquote]:rounded-r-lg">
							{parse(block.content)}
						</div>
					);
				case "image":
					return (
						<figure key={uniqueKey} className="w-full flex flex-col items-center my-6 sm:my-8">
							<div className="relative w-full max-w-[600px] flex justify-center overflow-hidden rounded-xl shadow-2xl bg-black/20">
								<Image
									src={block.content.link}
									alt={`blog-image-${index}`}
									className="w-full h-auto object-contain max-h-[60vh]"
									width={600}
									height={400}
									style={{ width: '100%', height: 'auto', maxHeight: '60vh', objectFit: 'contain' }}
								/>
							</div>
						</figure>
					);
				case "embed":
					if (block.content.includes("www.youtube.com")) {
						return (
							<div key={uniqueKey} className="w-full my-6 sm:my-8 flex justify-center">
								<div className="relative w-full max-w-[600px] aspect-video rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
									{loadScript(block.content)}
								</div>
							</div>
						);
					}
					if (block.content.includes("script async")) {
						return <ScriptEmbed key={uniqueKey} content={block.content} />;
					}
					break;
				default:
					return <div key={uniqueKey} />;
			}
		},
	);

	const readingTime = calculateReadingTime(blog.content);

	return (
		<>
			{/* Hero Section with Thumbnail */}
			<div className="relative w-full" data-hero-section>
				{/* Back Button */}
				<BackButton href="/blogs" label="Back to Blogs" />

				{/* Hero Image */}
				<div className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
					<Image
						src={blog.thumbnail_path.link}
						alt={blog.title}
						fill
						priority
						className="object-cover"
					/>
					{/* Gradient Overlay */}
					<div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />
					<div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-transparent" />

					{/* Blog Badge */}
					<div className="absolute top-24 right-4 sm:top-28 sm:right-8 flex items-center gap-2 px-4 py-2 bg-[#ec1d24]/90 backdrop-blur-sm rounded-full">
						<Newspaper className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
						<span className="text-sm sm:text-base font-[BentonSansBold] text-white">Blog</span>
					</div>
				</div>

				{/* Title Overlay */}
				<div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 md:px-8 lg:px-12 pb-8 sm:pb-12 md:pb-16">
					<div className="max-w-5xl">
						{/* Tags */}
						<div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
							{blog.tags.slice(0, 4).map((tag: string) => (
								<Link
									key={tag}
									href={`/blogs?tags=${encodeURIComponent(tag)}`}
									className="text-xs sm:text-sm text-white font-[BentonSansRegular] bg-[#ec1d24] border-none rounded-full py-1 sm:py-1.5 px-3 sm:px-4 transition-all duration-300 inline-flex items-center hover:bg-[#ff3d44] hover:shadow-lg hover:shadow-[#ec1d24]/30 active:scale-95"
									prefetch={false}
								>
									<span className="opacity-70 mr-1">#</span>{tag}
								</Link>
							))}
							{blog.tags.length > 4 && (
								<span className="text-xs sm:text-sm text-white/60 py-1 sm:py-1.5 px-2 font-[BentonSansRegular]">
									+{blog.tags.length - 4} more
								</span>
							)}
						</div>

						{/* Title */}
						<h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-[BentonSansBold] leading-tight mb-4 sm:mb-6 max-w-4xl drop-shadow-lg">
							{blog.title}
						</h1>

						{/* Meta Info Bar */}
						<div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-white/80">
							{/* Author */}
							{blog.author_info ? (
								<Link 
									href={`/profile/${blog.author_info.username}`}
									className="flex items-center gap-2 sm:gap-3 no-underline transition-all duration-200 hover:opacity-80 group"
									prefetch={false}
								>
									{blog.author_info.image && (
										<div className="relative">
											<Image
												src={blog.author_info.image}
												alt={blog.author_info.display_name}
												width={40}
												height={40}
												className="rounded-full border-2 border-[#ec1d24] object-cover w-8 h-8 sm:w-10 sm:h-10 group-hover:border-[#ff3d44] transition-colors"
											/>
										</div>
									)}
									<span className="text-sm sm:text-base font-[BentonSansBold] text-white group-hover:text-[#ec1d24] transition-colors">
										{blog.author_info.display_name}
									</span>
								</Link>
							) : (
								<span className="text-sm sm:text-base font-[BentonSansRegular] text-white/80">
									By {blog.author}
								</span>
							)}

							<span className="hidden sm:block w-px h-5 bg-white/30" />

							{/* Date */}
							<div className="flex items-center gap-1.5 text-white/70">
								<Calendar className="w-4 h-4" />
								<span className="text-xs sm:text-sm font-[BentonSansRegular]">
									{moment(blog.created_at).format("MMM D, YYYY")}
								</span>
							</div>

							{blog.updated_at && (
								<>
									<span className="hidden sm:block w-px h-5 bg-white/30" />
									<div className="flex items-center gap-1.5 text-[#ec1d24]/80">
										<Clock className="w-4 h-4" />
										<span className="text-xs sm:text-sm font-[BentonSansRegular]">
											Updated {moment(blog.updated_at).format("MMM D, YYYY")}
										</span>
									</div>
								</>
							)}

							<span className="hidden sm:block w-px h-5 bg-white/30" />

							{/* Reading Time */}
							<div className="flex items-center gap-1.5 text-white/70">
								<Clock className="w-4 h-4" />
								<span className="text-xs sm:text-sm font-[BentonSansRegular]">
									{readingTime} min read
								</span>
							</div>

							<span className="hidden sm:block w-px h-5 bg-white/30" />

							{/* Views */}
							<div className="flex items-center gap-1.5 text-white/70">
								<Eye className="w-4 h-4" />
								<span className="text-xs sm:text-sm font-[BentonSansRegular]">
									{totalInteractions.views.toLocaleString()} views
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto gap-8 lg:gap-12 relative px-4 sm:px-6 md:px-8 py-8 sm:py-12">
				{/* Article Content */}
				<article className="flex-1 lg:max-w-4xl animate-[fadeInSimple_0.6s_ease]">
					{/* Floating Action Bar - Liquid Glass Effect */}
					<FloatingActionBar
						contentId={blog.id}
						contentType="blog"
						initialLikes={totalInteractions.likes}
						userHasLiked={!!userHasLiked}
						isLoggedIn={!!session?.user}
					/>

					{/* Article Body */}
					<div className="bg-white/2 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 border border-white/5 shadow-xl">
						<div className="text-base sm:text-lg md:text-xl font-[BentonSansBook] text-white/90 leading-relaxed sm:leading-loose space-y-6">
							{contentElements}
						</div>
					</div>

					{/* Tags Section at Bottom */}
					<div data-tags-section className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/10">
						<h3 className="text-sm font-[BentonSansBold] text-white/50 uppercase tracking-wider mb-4">Tags</h3>
						<div className="flex flex-wrap gap-2">
							{blog.tags.map((tag: string) => (
								<Link
									key={tag}
									href={`/blogs?tags=${encodeURIComponent(tag)}`}
									className="text-sm text-white/70 font-[BentonSansRegular] bg-white/5 border border-white/10 rounded-full py-2 px-4 transition-all duration-300 inline-flex items-center hover:bg-[#ec1d24]/10 hover:text-[#ec1d24] hover:border-[#ec1d24]/30 active:scale-95"
									prefetch={false}
								>
									<span className="opacity-50 mr-1">#</span>{tag}
								</Link>
							))}
						</div>
					</div>

					{/* Comments Section */}
					<CommentSection contentId={blog.id} contentType="blog" />
				</article>

				{/* Sidebar */}
				<FixedSidebar latestBlogs={latestBlogs} isReview={false} />
			</div>
		</>
	);
}
