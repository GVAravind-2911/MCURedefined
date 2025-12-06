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
				<div className="relative w-full h-[30vh] sm:h-[35vh] md:h-[40vh] overflow-hidden">
					{/* Gradient Background */}
					<div className="absolute inset-0 bg-linear-to-br from-[#ec1d24]/30 via-black/90 to-black" />
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-[#ec1d24]/20 via-transparent to-transparent" />

					{/* Animated Grid Pattern */}
					<div
						className="absolute inset-0 opacity-10"
						style={{
							backgroundImage:
								"linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
							backgroundSize: "50px 50px",
						}}
					/>

					{/* Decorative Floating Icons - Right Side Cluster */}
					<div className="absolute right-[5%] sm:right-[8%] md:right-[12%] top-[15%] flex flex-col items-end gap-3 sm:gap-4">
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
						<BookOpen className="w-8 h-8 lg:w-12 lg:h-12 text-white" />
					</div>
					<div className="absolute bottom-[25%] right-[25%] hidden lg:block opacity-[0.06] animate-pulse [animation-delay:800ms]">
						<Sparkles className="w-10 h-10 text-[#ec1d24]" />
					</div>

					{/* Badge */}
					<div className="absolute top-20 right-4 sm:top-24 sm:right-8 flex items-center gap-2 px-4 py-2 bg-[#ec1d24]/90 backdrop-blur-sm rounded-full shadow-lg shadow-[#ec1d24]/20">
						<PrimaryIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
						<span className="text-sm sm:text-base font-[BentonSansBold] text-white">
							{isReviews ? "Reviews" : "Blogs"}
						</span>
					</div>
				</div>

				{/* Title Overlay */}
				<div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 md:px-8 lg:px-12 pb-8 sm:pb-12">
					<div className="max-w-[1400px] mx-auto">
						{/* Breadcrumb */}
						<div className="flex items-center gap-2 mb-4 text-sm text-white/50">
							<span>Home</span>
							<span>/</span>
							<span className="text-[#ec1d24]">
								{isReviews ? "Reviews" : "Blogs"}
							</span>
						</div>

						{/* Title */}
						<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-[BentonSansBold] leading-tight mb-3 sm:mb-4 drop-shadow-lg">
							{heroTitle}
						</h1>

						{/* Description */}
						<p className="text-base sm:text-lg text-white/70 font-[BentonSansRegular] max-w-2xl">
							{heroDescription}
						</p>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12">
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
