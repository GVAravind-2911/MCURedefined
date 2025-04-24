import type { BlogList } from "@/types/BlogTypes";
import type React from "react";
import BlogsComponent from "@/components/blog/BlogComponent";
import axios from "axios";
import { BlogProvider } from "@/components/blog/BlogContext";
import "@/styles/bloghero.css";
import "@/styles/blogposts.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface BlogResponse {
	blogs: BlogList[];
	total: number;
}

async function getTags(): Promise<string[]> {
    try {
        const response = await axios.get(
            "http://127.0.0.1:4000/reviews/tags",
            {
                headers: {
                    "Cache-Control": "no-cache",
                },
                timeout: 5000,
            }
        );
        return response.data.tags || [];
    } catch (error) {
        console.error("Failed to fetch tags:", error);
        return [];
    }
}

async function getAuthors(): Promise<string[]> {
    try {
        const response = await axios.get(
            "http://127.0.0.1:4000/reviews/authors",
            {
                headers: {
                    "Cache-Control": "no-cache",
                },
                timeout: 5000,
            }
        );
        return response.data.authors || [];
    } catch (error) {
        console.error("Failed to fetch authors:", error);
        return [];
    }
}

async function getData(page = 1, limit = 5): Promise<BlogResponse> {
	try {
		const response = await axios.get<BlogResponse>(
			`http://127.0.0.1:4000/reviews?page=${page}&limit=${limit}`,
			{
				headers: {
					"Cache-Control": "no-cache",
					Pragma: "no-cache",
					Expires: "0",
				},
			},
		);
		console.log(response.data);
		return response.data;
	} catch (error) {
		console.error("Failed to fetch blogs:", error);
		throw new Error("Failed to fetch blogs");
	}
}

export default async function Blogs(): Promise<React.ReactElement> {
	// Always fetch page 1 initially from server
	const [blogData, tags, authors] = await Promise.all([
        getData(1, 5),
        getTags(),
        getAuthors()
    ]);
	const { blogs, total } = blogData;
    const totalPages = Math.ceil(total / 5);

	return (
	<div className="blog-page">
      <div className="blog-hero">
        <div className="hero-overlay"/>
        <div className="hero-content">
          <h1 className="hero-title">Redefined Reviews</h1>
          <p className="hero-description">
            Explore in-depth reviews of Marvel Cinematic Universe films, shows, and streaming content.
            Read critical analysis, ratings, and fan perspectives on your favorite Marvel productions.
          </p>
        </div>
      </div>
      <BlogProvider
        initialBlogs={blogs}
        initialTotalPages={totalPages}
        initialTags={tags}
        initialAuthors={authors}
      >
        <BlogsComponent
          path="reviews"
          initialBlogs={blogs}
          totalPages={totalPages}
          apiUrl="http://127.0.0.1:4000/reviews"
          initialTags={tags}
          initialAuthors={authors}
        />
      </BlogProvider>
    </div>
	);
}
