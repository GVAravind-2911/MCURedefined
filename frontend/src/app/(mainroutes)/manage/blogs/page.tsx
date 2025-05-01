import type React from "react";
import type { BlogList } from "@/types/BlogTypes";
import type { AxiosError } from "axios";
import AdminBlogComponent from "@/components/blog/AdminBlogComponent";
import { BlogProvider } from "@/components/blog/BlogContext";
import ErrorMessage from "@/components/ErrorMessage";
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
				"The server appears to be offline",
				"Unable to establish connection to the API",
				"Please try again later",
			],
		};
		// biome-ignore lint/style/noUselessElse: <explanation>
	} else if (
		axiosError.code === "ETIMEDOUT" ||
		axiosError.message?.includes("timeout")
	) {
		return {
			hasError: true,
			title: "Connection Timeout",
			reasons: [
				"The server took too long to respond",
				"This may be due to high traffic or server load",
				"Please try refreshing the page",
			],
		};
		// biome-ignore lint/style/noUselessElse: <explanation>
	} else {
		return {
			hasError: true,
			title: "Unable to Load Blog Management",
			reasons: [
				"The blog service may be temporarily unavailable",
				"Server may be undergoing maintenance",
				"Please try again later",
			],
		};
	}
};

async function getData(): Promise<BlogResponse | ErrorState> {
	try {
		// Make parallel requests to fetch all needed data at once
		const [blogsResponse, tagsResponse, authorsResponse] = await Promise.all([
			axios.get<BlogResponse>("http://127.0.0.1:4000/blogs?page=1&limit=5", {
				headers: {
					"Cache-Control": "no-cache",
					Pragma: "no-cache",
					Expires: "0",
				},
				timeout: 10000, // 10 second timeout
			}),
			axios.get<{ tags: string[] }>("http://127.0.0.1:4000/blogs/tags", {
				headers: {
					"Cache-Control": "no-cache",
					Pragma: "no-cache",
					Expires: "0",
				},
				timeout: 5000, // 5 second timeout
			}),
			axios.get<{ authors: string[] }>("http://127.0.0.1:4000/blogs/authors", {
				headers: {
					"Cache-Control": "no-cache",
					Pragma: "no-cache",
					Expires: "0",
				},
				timeout: 5000, // 5 second timeout
			}),
		]);

		// Combine the responses
		return {
			blogs: blogsResponse.data.blogs,
			total: blogsResponse.data.total,
			total_pages:
				blogsResponse.data.total_pages ||
				Math.ceil(blogsResponse.data.total / 5),
			tags: tagsResponse.data.tags,
			authors: authorsResponse.data.authors,
		};
	} catch (error) {
		return handleApiError(error);
	}
}

export default async function EditBlogPage(): Promise<React.ReactElement> {
	// Fetch all required data at once
	const result = await getData();

	// Check if we got an error
	if ("hasError" in result) {
		return <ErrorMessage title={result.title} reasons={result.reasons} />;
	}

	const { blogs, total_pages, tags, authors } = result;

	return (
		<div className="edit-blog-page">
			<div className="blog-hero">
				<div className="hero-overlay" />
				<div className="hero-content">
					<h1 className="hero-title">Manage Blog Posts</h1>
					<p className="hero-description">
						Create, edit, and manage your blog content. Add new posts, update
						existing content, or remove outdated articles.
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
