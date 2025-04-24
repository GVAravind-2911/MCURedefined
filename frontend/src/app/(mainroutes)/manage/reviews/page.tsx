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
          "http://127.0.0.1:4000/reviews?page=1&limit=5",
          {
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        ),
        axios.get<{ tags: string[] }>(
          "http://127.0.0.1:4000/reviews/tags",
          {
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        ),
        axios.get<{ authors: string[] }>(
          "http://127.0.0.1:4000/reviews/authors",
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
        blogs: blogsResponse.data.blogs || [], // Use reviews instead of blogs
        total: blogsResponse.data.total || 0, 
        total_pages: blogsResponse.data.total_pages || Math.ceil((blogsResponse.data.total || 0) / 5),
        tags: tagsResponse.data.tags || [],
        authors: authorsResponse.data.authors || []
      };
    } catch (error) {
      console.error("Failed to fetch review data:", error);
      
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
            <h1 className="hero-title">Manage Reviews</h1>
            <p className="hero-description">
              Create, edit, and manage your review content. Add new reviews, update existing content, 
              or remove outdated reviews.
            </p>
          </div>
        </div>
        <BlogProvider
          initialBlogs={blogs || []}
          initialTotalPages={total_pages || 1}
          initialTags={tags || []}
          initialAuthors={authors || []}
          >
        <AdminBlogComponent
          path="reviews"  // Changed from "blogs" to "reviews"
          initialBlogs={blogs || []}
          totalPages={total_pages || 1}
          apiUrl="http://127.0.0.1:4000/reviews"
          initialTags={tags || []}
          initialAuthors={authors || []}
        />
        </BlogProvider>
      </div>
    );
  }