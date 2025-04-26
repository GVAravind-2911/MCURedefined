import type { BlogList } from "@/types/BlogTypes";
import type React from "react";
import BlogComponent from "@/components/blog/BlogComponent";
import ErrorMessage from "@/components/ErrorMessage";
import axios, { type AxiosError } from "axios";
import "@/styles/bloghero.css";
import { BlogProvider } from "@/components/blog/BlogContext";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface BlogResponse {
    blogs: BlogList[];
    total: number;
}

interface ErrorState {
    hasError: boolean;
    title: string;
    reasons: string[];
}

// Common error handling function
const handleApiError = (error: unknown): ErrorState => {
    const axiosError = error as AxiosError;
    
    if (axiosError.code === "ECONNREFUSED") {
        return {
            hasError: true,
            title: "Connection Failed",
            reasons: [
                "The blog server appears to be offline",
                "Unable to establish connection to the API",
                "Please try again later"
            ]
        };
    // biome-ignore lint/style/noUselessElse: <explanation>
    } else if (axiosError.code === "ETIMEDOUT" || axiosError.message?.includes("timeout")) {
        return {
            hasError: true,
            title: "Connection Timeout",
            reasons: [
                "The server took too long to respond",
                "This may be due to high traffic or server load",
                "Please try refreshing the page"
            ]
        };
    // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
        return {
            hasError: true,
            title: "Unable to Load Page",
            reasons: [
                "Temporary network disruption",
                "Server maintenance",
                "Connection error"
            ]
        };
    }
};

async function getData(page = 1, limit = 5): Promise<BlogResponse | ErrorState> {
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
        return handleApiError(error);
    }
}

async function getTags(): Promise<string[] | ErrorState> {
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
        return handleApiError(error);
    }
}

async function getAuthors(): Promise<string[] | ErrorState> {
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
        return handleApiError(error);
    }
}

export default async function Blogs(): Promise<React.ReactElement> {
    // Fetch all data in parallel
    const [blogData, tags, authors] = await Promise.all([
        getData(1, 5),
        getTags(),
        getAuthors()
    ]);
    
    // Check if any of the responses are error states
    if ('hasError' in blogData) {
        return (
            <ErrorMessage 
                title={blogData.title}
                reasons={blogData.reasons}
            />
        );
    }
    
    if ('hasError' in tags) {
        return (
            <ErrorMessage 
                title={tags.title}
                reasons={tags.reasons}
            />
        );
    }
    
    if ('hasError' in authors) {
        return (
            <ErrorMessage 
                title={authors.title}
                reasons={authors.reasons}
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