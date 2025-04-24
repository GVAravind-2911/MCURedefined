import type React from "react";
import type { BlogList } from "@/types/BlogTypes";
import AdminBlogComponent from "@/components/blog/AdminBlogComponent";
import { BlogProvider } from "@/components/blog/BlogContext";
import axios from "axios";
import "@/styles/blogposts.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface BlogResponse {
  blogs: BlogList[];
  total: number;
  total_pages?: number;
  tags?: string[];
  authors?: string[];
}

async function getData(): Promise<BlogResponse> {
  try {
    // Make parallel requests to fetch all needed data at once
    const [blogsResponse, tagsResponse, authorsResponse] = await Promise.all([
      axios.get<BlogResponse>(
        "http://127.0.0.1:4000/blogs?page=1&limit=5",
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      ),
      axios.get<{ tags: string[] }>(
        "http://127.0.0.1:4000/blogs/tags",
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      ),
      axios.get<{ authors: string[] }>(
        "http://127.0.0.1:4000/blogs/authors",
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      )
    ]);

    // Combine the responses
    return {
      blogs: blogsResponse.data.blogs,
      total: blogsResponse.data.total,
      total_pages: blogsResponse.data.total_pages || Math.ceil(blogsResponse.data.total / 5),
      tags: tagsResponse.data.tags,
      authors: authorsResponse.data.authors
    };
  } catch (error) {
    console.error("Failed to fetch blog data:", error);
    
    // Return empty data on error to allow graceful degradation
    return {
      blogs: [],
      total: 0,
      total_pages: 0,
      tags: [],
      authors: []
    };
  }
}

export default async function EditBlogPage(): Promise<React.ReactElement> {
  // Fetch all required data at once
  const { blogs, total_pages, tags, authors } = await getData();

  return (
    <div className="edit-blog-page">
      <div className="blog-hero">
        <div className="hero-overlay"/>
        <div className="hero-content">
          <h1 className="hero-title">Manage Blog Posts</h1>
          <p className="hero-description">
            Create, edit, and manage your blog content. Add new posts, update existing content, 
            or remove outdated articles.
          </p>
        </div>
      </div>
      <BlogProvider
		initialBlogs={blogs}
		initialTotalPages={total_pages}
		initialTags={tags}
		initialAuthors={authors}
		>
      <AdminBlogComponent
        path="blogs"
        initialBlogs={blogs}
        totalPages={total_pages || 1}
        apiUrl="http://127.0.0.1:4000/blogs"
        initialTags={tags || []}
        initialAuthors={authors || []}
      />
	  </BlogProvider>
    </div>
  );
}