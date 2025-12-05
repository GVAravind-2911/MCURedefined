"use client";

import type { JSX } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import LoadingSpinner from "@/components/main/LoadingSpinner";
import ScriptEmbed from "@/components/edit/ScriptEmbed";
import moment from "moment";
import Image from "next/image";
import parse from "html-react-parser";
import Link from "next/link";
import type { ContentBlock, ContentConfig, ContentData } from "@/types/ContentTypes";
import { getDraftStorageKey } from "@/lib/content/utils";
import { getProxyUrl } from "@/lib/config/backend";
import { authClient } from "@/lib/auth/auth-client";
import { ArrowLeft, Clock, Calendar, Star, Newspaper } from "lucide-react";

interface ContentPreviewProps {
	config: ContentConfig;
	mode: "create" | "edit";
	id?: string;
}

// Calculate reading time
const calculateReadingTime = (content: ContentBlock[]): number => {
	const textContent = content
		.filter((block) => block.type === "text")
		.map((block) => block.content)
		.join(" ");
	const wordCount = textContent.split(/\s+/).length;
	return Math.ceil(wordCount / 200);
};

// YouTube video loader
const loadScript = (url: string): JSX.Element | null => {
	if (url.includes("www.youtube.com")) {
		const regex =
			/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|vi|e(?:mbed)?)\/|\S*?[?&]v=|(?:\S*\?list=))|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
		const match = url.match(regex);
		if (match) {
			const videoId = match[1];
			return (
				<iframe
					src={`https://www.youtube.com/embed/${videoId}`}
					title="YouTube video"
					allowFullScreen
					className="absolute top-0 left-0 w-full h-full border-0"
				/>
			);
		}
	}
	return null;
};

export default function ContentPreview({
	config,
	mode,
	id,
}: ContentPreviewProps): JSX.Element {
	const router = useRouter();
	const [content, setContent] = useState<ContentData | null>(null);
	const [loading, setLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [backButtonOpacity, setBackButtonOpacity] = useState(1);
	const sentinelRef = useRef<HTMLDivElement>(null);
	const session = authClient.useSession();
	const token = session?.data?.session?.token || null;

	const storageKey = getDraftStorageKey(config, mode === "edit" ? id : undefined);

	useEffect(() => {
		const storedContent = localStorage.getItem(storageKey);
		if (storedContent) {
			setContent(JSON.parse(storedContent));
		}
		setLoading(false);
	}, [storageKey]);

	// Track scroll for back button visibility with gradual fade
	useEffect(() => {
		const handleScroll = () => {
			const scrollY = window.scrollY;
			const heroHeight = window.innerHeight * 0.7; // Approximate hero height
			
			// Start fading when 60% through the hero, fully hidden when hitting main content
			const fadeStartPoint = heroHeight * 0.6;
			const fadeEndPoint = heroHeight;
			
			if (scrollY <= fadeStartPoint) {
				setBackButtonOpacity(1);
			} else if (scrollY >= fadeEndPoint) {
				setBackButtonOpacity(0);
			} else {
				// Gradual fade between start and end points
				const fadeProgress = (scrollY - fadeStartPoint) / (fadeEndPoint - fadeStartPoint);
				setBackButtonOpacity(1 - fadeProgress);
			}
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleEdit = (): void => {
		if (mode === "edit" && id) {
			router.push(`${config.managePath}/edit/${id}`);
		} else {
			router.push(`${config.managePath}/create`);
		}
	};

	const handlePublish = async (): Promise<void> => {
		if (!content) return;

		try {
			setIsSaving(true);
			setLoading(true);

			const apiPath =
				mode === "edit"
					? getProxyUrl(`${config.apiPath}/update/${id}`)
					: getProxyUrl(`${config.apiPath}/create`);

			const method = mode === "edit" ? "put" : "post";

			await axios[method](apiPath, content, {
				headers: {
					Authorization: `Bearer ${token}` || "",
				},
			});

			localStorage.removeItem(storageKey);
			router.push(config.managePath);
			alert(
				`${config.singularName.charAt(0).toUpperCase() + config.singularName.slice(1)} ${mode === "edit" ? "saved" : "published"} successfully!`,
			);
		} catch (error) {
			setLoading(false);
			console.error(`Error publishing ${config.singularName}:`, error);

			if (axios.isAxiosError(error)) {
				const statusCode = error.response?.status;

				if (statusCode === 403) {
					alert(
						`You don't have permission to ${mode === "edit" ? "update" : "create"} this ${config.singularName}. Please log in with an admin account.`,
					);
				} else if (statusCode === 401) {
					alert("Your session has expired. Please log in again.");
					router.push("/auth/login");
				} else if (statusCode === 404) {
					alert(
						`${config.singularName.charAt(0).toUpperCase() + config.singularName.slice(1)} not found. It may have been deleted.`,
					);
					router.push(config.managePath);
				} else if (statusCode === 413) {
					alert(
						"Content too large. Please reduce the size of images or content.",
					);
				} else if (error.response?.data?.message) {
					alert(`Error: ${error.response.data.message}`);
				} else {
					alert(
						`Failed to ${mode === "edit" ? "save" : "publish"} ${config.singularName}. Please try again later.`,
					);
				}
			} else {
				alert("An unexpected error occurred. Please try again.");
			}
		} finally {
			setIsSaving(false);
		}
	};

	if (loading) return <LoadingSpinner />;
	if (!content) return (
		<div className="flex justify-center items-center min-h-[50vh] text-xl text-[#ec1d24] font-[BentonSansRegular]">
			No {config.singularName} data found
		</div>
	);

	const isReview = config.singularName === "review";
	const readingTime = calculateReadingTime(content.content || []);

	// Render content blocks with new styling
	const contentElements = (content.content || []).map(
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
									alt={`content-image-${index}`}
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
					return <div key={uniqueKey} className="text-[#ec1d24] text-center py-4">{block.content}</div>;
				default:
					return <div key={uniqueKey} />;
			}
		},
	);

	return (
		<>
			{/* Hero Section with Thumbnail */}
			<div className="relative w-full">
				{/* Back Button - Liquid Glass */}
				<button
					type="button"
					onClick={handleEdit}
					className={`fixed top-24 left-4 z-50 flex items-center gap-2 px-4 py-2.5
						bg-linear-to-br from-white/10 via-white/5 to-transparent
						backdrop-blur-xl backdrop-saturate-150
						rounded-xl
						border border-white/20
						shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]
						text-white/90 hover:text-white
						text-sm font-[BentonSansRegular]
						transition-[box-shadow,border-color,color] duration-300 
						hover:shadow-[0_8px_40px_rgba(236,29,36,0.15),inset_0_1px_0_rgba(255,255,255,0.15)] 
						hover:border-white/30
						group
						${backButtonOpacity === 0 ? "pointer-events-none" : ""}`}
				style={{ opacity: backButtonOpacity, transform: `translateX(${(1 - backButtonOpacity) * -16}px)` }}
				>
					<ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
					<span className="hidden sm:inline">Back to Edit</span>
				</button>

				{/* Hero Image */}
				<div className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
					<Image
						src={content.thumbnail_path?.link || "/images/placeholder.jpg"}
						alt={content.title}
						fill
						priority
						className="object-cover"
					/>
					{/* Gradient Overlay */}
					<div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />
					<div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-transparent" />

					{/* Badges Container */}
					<div className="absolute top-24 right-4 sm:top-28 sm:right-8 flex items-center gap-2">
						{/* Preview Badge */}
						<div className="flex items-center gap-2 px-4 py-2 bg-amber-500/90 backdrop-blur-sm rounded-full">
							<span className="text-sm sm:text-base font-[BentonSansBold] text-white">Preview</span>
						</div>

						{/* Content Type Badge */}
						{isReview ? (
							<div className="flex items-center gap-2 px-4 py-2 bg-[#ec1d24]/90 backdrop-blur-sm rounded-full">
								<Star className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
								<span className="text-sm sm:text-base font-[BentonSansBold] text-white">Review</span>
							</div>
						) : (
							<div className="flex items-center gap-2 px-4 py-2 bg-[#ec1d24]/90 backdrop-blur-sm rounded-full">
								<Newspaper className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
								<span className="text-sm sm:text-base font-[BentonSansBold] text-white">Blog</span>
							</div>
						)}
					</div>
				</div>

				{/* Title Overlay */}
				<div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 md:px-8 lg:px-12 pb-8 sm:pb-12 md:pb-16">
					<div className="max-w-5xl mx-auto">
						{/* Tags */}
						<div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
							{(content.tags || []).slice(0, 4).map((tag: string) => (
								<span
									key={tag}
									className="text-xs sm:text-sm text-white/90 font-[BentonSansRegular] bg-[#ec1d24]/80 rounded-full py-1.5 px-3 sm:px-4 transition-all duration-300 inline-flex items-center"
								>
									<span className="opacity-70 mr-1">#</span>{tag}
								</span>
							))}
						</div>

						{/* Title */}
						<h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-[BentonSansBold] leading-tight mb-4 sm:mb-6 max-w-4xl drop-shadow-lg">
							{content.title}
						</h1>

						{/* Meta Info Bar */}
						<div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-white/80">
							{/* Author */}
							<span className="text-sm sm:text-base font-[BentonSansRegular] text-white/80">
								By {content.author}
							</span>

							<span className="hidden sm:block w-px h-5 bg-white/30" />

							{/* Date */}
							<div className="flex items-center gap-1.5 text-white/70">
								<Calendar className="w-4 h-4" />
								<span className="text-sm font-[BentonSansRegular]">
									{moment(content.created_at || new Date()).format("MMM D, YYYY")}
								</span>
							</div>

							<span className="hidden sm:block w-px h-5 bg-white/30" />

							{/* Reading Time */}
							<div className="flex items-center gap-1.5 text-white/70">
								<Clock className="w-4 h-4" />
								<span className="text-sm font-[BentonSansRegular]">
									{readingTime} min read
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex flex-col w-full max-w-[1200px] mx-auto gap-8 relative px-4 sm:px-6 md:px-8 py-8 sm:py-12">
				{/* Article Content */}
				<article className="flex-1 max-w-4xl mx-auto w-full animate-[fadeInSimple_0.6s_ease]">
					{/* Article Body */}
					<div className="bg-white/2 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 border border-white/5 shadow-xl">
						<div className="text-base sm:text-lg md:text-xl font-[BentonSansBook] text-white/90 leading-relaxed sm:leading-loose space-y-6">
							{contentElements}
						</div>
					</div>

					{/* Tags Section at Bottom */}
					<div ref={sentinelRef} className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/10">
						<h3 className="text-sm font-[BentonSansBold] text-white/50 uppercase tracking-wider mb-4">Tags</h3>
						<div className="flex flex-wrap gap-2">
							{(content.tags || []).map((tag: string) => (
								<span
									key={tag}
									className="text-sm text-white/70 font-[BentonSansRegular] bg-white/5 border border-white/10 rounded-full py-2 px-4 transition-all duration-300 inline-flex items-center hover:bg-[#ec1d24]/10 hover:text-[#ec1d24] hover:border-[#ec1d24]/30"
								>
									<span className="opacity-50 mr-1">#</span>{tag}
								</span>
							))}
						</div>
					</div>
				</article>
			</div>

			{/* Floating Action Bar - Liquid Glass Effect */}
			<div 
				className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-4 py-3 px-6
					bg-linear-to-br from-white/10 via-white/5 to-transparent
					backdrop-blur-xl backdrop-saturate-150
					rounded-2xl
					border border-white/20
					shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]
					transition-all duration-300"
			>
				<button
					type="submit"
					onClick={handlePublish}
					className="px-6 py-2.5 text-base font-[BentonSansBold] text-white bg-[#ec1d24] border-none rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(236,29,36,0.5)] hover:bg-[#ff2a32] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
					disabled={isSaving}
				>
					{isSaving
						? mode === "edit"
							? "Saving..."
							: "Publishing..."
						: mode === "edit"
							? "Save"
							: "Publish"}
				</button>
				<div className="w-px h-6 bg-linear-to-b from-transparent via-white/30 to-transparent" />
				<button
					type="button"
					className="px-6 py-2.5 text-base font-[BentonSansBold] text-white/90 bg-white/10 border border-white/20 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20 hover:text-white"
					onClick={handleEdit}
				>
					Edit
				</button>
			</div>
		</>
	);
}
