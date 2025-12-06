import type React from "react";
import type {
	ContentConfig,
	ContentListResponse,
	ErrorState,
} from "@/types/ContentTypes";
import type { BlogList } from "@/types/BlogTypes";
import AdminBlogComponent from "@/components/blog/AdminBlogComponent";
import { BlogProvider } from "@/components/blog/BlogContext";
import ErrorMessage from "@/components/main/ErrorMessage";
import { handleApiError } from "@/lib/content/utils";
import {
	getBackendUrl,
	getProxyUrl,
	NO_CACHE_HEADERS,
} from "@/lib/config/backend";
import axios from "axios";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ManageListPageProps {
	config: ContentConfig;
}

async function getData(
	config: ContentConfig,
): Promise<ContentListResponse | ErrorState> {
	try {
		// Make parallel requests to fetch all needed data at once
		const [contentResponse, tagsResponse, authorsResponse] = await Promise.all([
			axios.get<ContentListResponse>(
				getBackendUrl(`${config.apiPath}?page=1&limit=5`),
				{
					headers: NO_CACHE_HEADERS,
					timeout: 10000,
				},
			),
			axios.get<{ tags: string[] }>(getBackendUrl(`${config.apiPath}/tags`), {
				headers: NO_CACHE_HEADERS,
				timeout: 5000,
			}),
			axios.get<{ authors: string[] }>(
				getBackendUrl(`${config.apiPath}/authors`),
				{
					headers: NO_CACHE_HEADERS,
					timeout: 5000,
				},
			),
		]);

		// Combine the responses
		return {
			blogs: contentResponse.data.blogs || [],
			total: contentResponse.data.total || 0,
			total_pages:
				contentResponse.data.total_pages ||
				Math.ceil((contentResponse.data.total || 0) / 5),
			tags: tagsResponse.data.tags || [],
			authors: authorsResponse.data.authors || [],
		};
	} catch (error) {
		return handleApiError(error, config.singularName);
	}
}

export default async function ManageListPage({
	config,
}: ManageListPageProps): Promise<React.ReactElement> {
	const result = await getData(config);

	// Check if we got an error
	if ("hasError" in result) {
		return <ErrorMessage title={result.title} reasons={result.reasons} />;
	}

	const { blogs, total_pages, tags, authors } = result;

	return (
		<div className="flex flex-col w-full max-w-full items-center">
			<div className="relative w-full max-w-[1400px] h-[280px] bg-linear-to-r from-[#ec1d24]/80 to-black/80 bg-cover bg-center mb-8 flex items-center justify-center overflow-hidden rounded-lg">
				<div className="absolute inset-0 bg-black/40" />
				<div className="relative z-2 text-center px-4 max-w-[800px]">
					<h1 className="font-[BentonSansBold] text-[clamp(28px,5vw,48px)] text-white mb-4 uppercase tracking-[1px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] after:content-[''] after:block after:w-[100px] after:h-1 after:bg-[#ec1d24] after:mx-auto after:mt-3">
						{config.heroTitle}
					</h1>
					<p className="font-[BentonSansRegular] text-[clamp(16px,2vw,18px)] text-white/80 max-w-[600px] mx-auto leading-relaxed">
						{config.heroDescription}
					</p>
				</div>
			</div>
			<BlogProvider
				initialBlogs={blogs as BlogList[]}
				initialTotalPages={total_pages || 1}
				initialTags={tags || []}
				initialAuthors={authors || []}
			>
				<AdminBlogComponent
					path={config.apiPath}
					basePath="manage"
					initialBlogs={blogs as BlogList[]}
					totalPages={total_pages || 1}
					apiUrl={getProxyUrl(config.apiPath)}
					initialTags={tags || []}
					initialAuthors={authors || []}
				/>
			</BlogProvider>
		</div>
	);
}
