import type React from "react";
import type { ContentConfig } from "@/types/ContentTypes";
import type { BlogList } from "@/types/BlogTypes";
import BlogComponent from "@/components/blog/BlogComponent";
import { BlogProvider } from "@/components/blog/BlogContext";
import ErrorMessage from "@/components/main/ErrorMessage";
import { getContentList } from "@/lib/content/data";
import { getProxyUrl } from "@/lib/config/backend";
import "@/styles/bloghero.css";
import "@/styles/blogposts.css";

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
    <div className="blog-page">
      <div className="blog-hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">{heroTitle}</h1>
          <p className="hero-description">{heroDescription}</p>
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
