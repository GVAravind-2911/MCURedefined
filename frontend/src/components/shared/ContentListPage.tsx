import type React from "react";
import type { ContentConfig } from "@/types/ContentTypes";
import type { BlogList } from "@/types/BlogTypes";
import BlogComponent from "@/components/blog/BlogComponent";
import { BlogProvider } from "@/components/blog/BlogContext";
import ErrorMessage from "@/components/main/ErrorMessage";
import { getContentList } from "@/lib/content/data";
import { getProxyUrl } from "@/lib/config/backend";
import {
	Newspaper,
	Star,
	Sparkles,
	BookOpen,
	TrendingUp,
	FileText,
	PenTool,
	Award,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ContentListPageProps {
	config: ContentConfig;
	heroTitle: string;
	heroDescription: string;
}

export default async function ContentListPage({
	config,
	heroTitle,
	heroDescription,
}: ContentListPageProps): Promise<React.ReactElement> {
	const result = await getContentList<BlogList>(config, 1, 5);

	// Check if we got an error
	if ("hasError" in result) {
		return <ErrorMessage title={result.title} reasons={result.reasons} />;
	}

	const { items, totalPages, tags, authors } = result;

	// Choose icons based on content type
	const isReviews = config.type === "reviews";
	const PrimaryIcon = isReviews ? Star : Newspaper;
	const SecondaryIcon = isReviews ? TrendingUp : BookOpen;
	const TertiaryIcon = isReviews ? FileText : Sparkles;

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
							<PrimaryIcon className="relative w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 text-[#ec1d24]/20 animate-pulse" />
						</div>
						{/* Secondary icons - smaller, staggered */}
						<div className="flex items-center gap-2 sm:gap-3 -mt-2 mr-4 sm:mr-8">
							<SecondaryIcon className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white/15 animate-pulse [animation-delay:300ms]" />
							<TertiaryIcon className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 text-[#ec1d24]/15 animate-pulse [animation-delay:600ms]" />
						</div>
					</div>

					{/* Subtle accent icons - scattered for depth */}
					<div className="absolute top-[20%] right-[35%] sm:right-[40%] hidden md:block opacity-[0.08] animate-pulse [animation-delay:400ms]">
						<PenTool className="w-8 h-8 lg:w-12 lg:h-12 text-white" />
					</div>
					<div className="absolute bottom-[25%] right-[25%] hidden lg:block opacity-[0.06] animate-pulse [animation-delay:800ms]">
						<Award className="w-10 h-10 text-[#ec1d24]" />
					</div>

					{/* Content Container */}
					<div className="relative z-10 px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8">
						<div className="max-w-[1400px] mx-auto w-full">
							{/* Breadcrumb */}
							<div className="flex items-center gap-2 mb-2 text-sm text-white/50">
								<span>Home</span>
								<span>/</span>
								<span className="text-[#ec1d24]">
									{isReviews ? "Reviews" : "Blogs"}
								</span>
							</div>

							{/* Title Row with Badge */}
							<div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-2">
								<h1 className="text-2xl sm:text-3xl md:text-4xl text-white font-[BentonSansBold] leading-tight">
									{heroTitle}
								</h1>
								<div className="flex items-center gap-2 px-3 py-1.5 bg-[#ec1d24] rounded-full">
									<PrimaryIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
									<span className="text-xs sm:text-sm font-[BentonSansBold] text-white">
										{isReviews ? "Reviews" : "Blogs"}
									</span>
								</div>
							</div>

							{/* Description */}
							<p className="text-sm sm:text-base text-white/60 font-[BentonSansRegular] max-w-xl leading-relaxed">
								{heroDescription}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
				<BlogProvider
					initialBlogs={items}
					initialTotalPages={totalPages}
					initialTags={tags}
					initialAuthors={authors}
				>
					<BlogComponent
						path={config.apiPath}
						initialBlogs={items}
						totalPages={totalPages}
						apiUrl={getProxyUrl(config.apiPath)}
						initialTags={tags}
						initialAuthors={authors}
					/>
				</BlogProvider>
			</div>
		</div>
	);
}
