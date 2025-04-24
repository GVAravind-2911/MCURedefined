import type { BlogList } from "@/types/BlogTypes";
import type React from "react";
import BlogComponent from "@/components/blog/BlogComponent";
import ErrorMessage from "@/components/ErrorMessage";
import axios from "axios";
import "@/styles/bloghero.css";
import { BlogProvider } from "@/components/blog/BlogContext";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface BlogResponse {
    blogs: BlogList[];
    total: number;
}

async function getData(page = 1, limit = 5): Promise<BlogResponse | null> {
    try {
        const response = await axios.get<BlogResponse>(
            `http://127.0.0.1:4000/blogs?page=${page}&limit=${limit}`,
            {
                headers: {
                    "Cache-Control": "no-cache",
                    Pragma: "no-cache",
                    Expires: "0",
                },
                timeout: 10000, // 10 second timeout
            },
        );
        return response.data;
    } catch (error) {
        console.error("Failed to fetch blogs:", error);
        return null;
    }
}

async function getTags(): Promise<string[]> {
    try {
        const response = await axios.get(
            "http://127.0.0.1:4000/blogs/tags",
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
            "http://127.0.0.1:4000/blogs/authors",
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

export default async function Blogs(): Promise<React.ReactElement> {
    // Fetch all data in parallel
    const [blogData, tags, authors] = await Promise.all([
        getData(1, 5),
        getTags(),
        getAuthors()
    ]);
    
    // If null was returned, there was a network error
    if (!blogData) {
        return (
            <ErrorMessage 
                title="Unable to Load Page"
                reasons={[
                    "Temporary network disruption",
                    "Server maintenance",
                    "Connection timeout"
                ]}
            />
        );
    }
    
    const { blogs, total } = blogData;
    const totalPages = Math.ceil(total / 5);

    return (
        <div className="blog-page">
        <div className="blog-hero">
            <div className="hero-overlay"/>
            <div className="hero-content">
                <h1 className="hero-title">Redefined Blog</h1>
                <p className="hero-description">
                Explore articles, insights, and the latest news about the Marvel Cinematic Universe. 
                Dive into fan theories, character analyses, and behind-the-scenes information.
                </p>
            </div>
        </div>
        <BlogProvider
                initialBlogs={blogs}
                initialTotalPages={totalPages}
                initialTags={tags}
                initialAuthors={authors}
                >
        <BlogComponent
            path="blogs"
            initialBlogs={blogs}
            totalPages={totalPages}
            apiUrl="http://127.0.0.1:4000/blogs"
            initialTags={tags}
            initialAuthors={authors}
        />
        </BlogProvider>
        </div>
    );
}