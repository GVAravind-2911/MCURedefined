import type React from "react";
import type { ContentConfig } from "@/types/ContentTypes";
import type { BlogList } from "@/types/BlogTypes";
import BlogComponent from "@/components/blog/BlogComponent";
import { BlogProvider } from "@/components/blog/BlogContext";
import ErrorMessage from "@/components/main/ErrorMessage";
import { getContentList } from "@/lib/content/data";
import { getProxyUrl } from "@/lib/config/backend";

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

  return (
    <div className="flex flex-col w-full max-w-full items-center px-4 sm:px-6 lg:px-0">
      <div className="relative w-full max-w-[1400px] h-[280px] max-md:h-[200px] max-sm:h-[180px] bg-cover bg-center mb-6 sm:mb-8 flex items-center justify-center overflow-hidden rounded-lg sm:rounded-xl bg-linear-to-r from-[#ec1d24]/80 to-black/80">
        <div className="absolute inset-0 w-full bg-linear-to-b from-black/70 to-black/90 z-1" />
        <div className="relative z-2 text-center px-4 sm:px-6 max-w-[800px]">
          <h1 className="font-[BentonSansBold] text-[clamp(22px,5vw,48px)] max-md:text-xl max-sm:text-lg text-white mb-3 sm:mb-4 uppercase tracking-[1px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] after:content-[''] after:block after:w-16 sm:after:w-20 after:h-1 after:bg-[#ec1d24] after:mx-auto after:mt-2 sm:after:mt-3">{heroTitle}</h1>
          <p className="font-[BentonSansRegular] text-[clamp(13px,2vw,18px)] max-md:text-sm max-sm:text-xs text-white/80 max-w-[600px] mx-auto leading-relaxed px-2">{heroDescription}</p>
        </div>
      </div>
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
  );
}
