"use client";

import type { JSX } from "react";
import type { ContentBlock } from "@/types/BlogTypes";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "@/components/main/LoadingSpinner";
import parse from "html-react-parser";
import ScriptEmbed from "@/components/edit/ScriptEmbed";
import moment from "moment";
import Image from "next/image";
import "@/styles/blog.css";
import { authClient } from "@/lib/auth/auth-client";

interface BlogData {
	title: string;
	author: string;
	description: string;
	content: ContentBlock[];
	tags: string[];
	thumbnail_path: { link: string };
	created_at: string;
	updated_at?: string;
}

export default function PreviewPage(): JSX.Element {
	const router = useRouter();
	const params = useParams();
	const id = params?.id as string;
	const [blog, setBlog] = useState<BlogData | null>(null);
	const [loading, setLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const session = authClient.useSession().data?.session;

	useEffect(() => {
		if (id) {
			const storedBlog = localStorage.getItem(`review-${id}`);
			if (storedBlog) {
				setBlog(JSON.parse(storedBlog));
			}
			setLoading(false);
		}
	}, [id]);

	const handleSave = async (): Promise<void> => {
		if (!session || !session.token) {
			alert("You must be logged in to save changes.");
			router.push("/auth/login");
			return;
		}
		if (blog) {
			try {
				setIsSaving(true);
				setLoading(true); // Show loading state while saving
				const response = await axios.put(
					`http://127.0.0.1:4000/reviews/update/${id}`,
					blog,
					{
						headers: {
							Authorization: `Bearer ${session?.token || ""}`,
						},
					},
				);

				localStorage.removeItem(`review-${id}`);
				alert("Blog saved successfully!");
				router.push("/manage/reviews");
			} catch (error) {
				setLoading(false); // Stop loading on error

				// Properly handle different types of errors
				if (axios.isAxiosError(error)) {
					const statusCode = error.response?.status;

					if (statusCode === 403) {
						alert(
							"You don't have permission to update this blog. Please log in with an admin account.",
						);
					} else if (statusCode === 401) {
						alert("Your session has expired. Please log in again.");
						router.push("/auth/login");
					} else if (statusCode === 404) {
						alert("Blog post not found. It may have been deleted.");
						router.push("/manage/reviews");
					} else if (statusCode === 413) {
						alert(
							"Content too large. Please reduce the size of images or content.",
						);
					} else if (error.response?.data?.message) {
						// Server provided an error message
						alert(`Error: ${error.response.data.message}`);
					} else {
						alert("Failed to save review. Please try again later.");
					}
					console.error("API error:", error.response?.data || error.message);
				} else {
					alert("An unexpected error occurred. Please try again.");
					console.error("Unknown error:", error);
				}
			} finally {
				setIsSaving(false);
			}
		}
	};

	const handleEdit = (): void => {
		router.push(`/manage/reviews/edit/${id}`);
	};

	const loadScript = (url: string): JSX.Element => {
		if (url.includes("www.youtube.com")) {
			const regex =
				/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|vi|e(?:mbed)?)\/|\S*?[?&]v=|(?:\S*\?list=))|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
			const match = url.match(regex);
			if (match) {
				const videoId = match[1];
				return (
					<iframe
						src={`https://www.youtube.com/embed/${videoId}`}
						title="youtube-video"
						allowFullScreen
						className="video"
					/>
				);
			}
		}
		return;
	};

	if (loading) return <LoadingSpinner />;
	if (!blog) return <div>No blog data found</div>;

	const contentElements = blog.content.map((block): JSX.Element => {
		if (block.type === "text") {
			return (
				<div key={block.id} className="textcontent">
					{parse(block.content)}
				</div>
			);
		}
		if (block.type === "image") {
			return (
				<Image
					key={block.id}
					src={block.content.link}
					alt="blog-image"
					className="contentimages"
					width={1000}
					height={1000}
				/>
			);
		}
		if (block.type === "embed") {
			if (block.content.includes("www.youtube.com")) {
				return (
					<div key={block.id} className="youtube-preview">
						{loadScript(block.content)}
					</div>
				);
			}
			if (block.content.includes("script async")) {
				return <ScriptEmbed key={block.id} content={block.content} />;
			}
		}
		return <div key={block.id} />;
	});

	return (
		<>
			<div className="contents fade-in">
				<div className="contentsinfo">
					<h1 className="title">{blog?.title}</h1>
					<h3 className="byline">
						<span className="colorforby">By: </span>
						{blog?.author}
					</h3>
					<h3 className="datecreation">
						<span className="colorforby">Posted: </span>
						{moment(new Date()).format("dddd, D MMMM, YYYY")}
					</h3>
					{blog?.updated_at && (
						<h3 className="dateupdate">
							<span className="colorforby">Updated: </span>
							{blog?.updated_at}
						</h3>
					)}
					<span className="tagsspan">
						{blog?.tags?.map((tag) => (
							<button key={tag} type="button" className="tags">
								{tag}
							</button>
						))}
					</span>
				</div>
				<div className="contentsmain">
					<div className="maincontent">{contentElements}</div>
				</div>
			</div>
			<div className="submit-blogdiv">
				<button
					type="submit"
					onClick={handleSave}
					id="submit-blog"
					className="save-button"
					disabled={isSaving}
				>
					{isSaving ? "Saving..." : "Save"}
				</button>
				<button
					type="button"
					id="submit-blog"
					className="edit-button"
					onClick={handleEdit}
				>
					Edit
				</button>
			</div>
		</>
	);
}
