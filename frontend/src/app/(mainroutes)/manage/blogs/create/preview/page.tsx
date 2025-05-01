"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "@/components/main/LoadingSpinner";
import "@/styles/blog.css";
import Image from "next/image";
import parse from "html-react-parser";
import { authClient } from "@/lib/auth/auth-client";

interface TextContentProps {
	content: string;
}

interface ImageContentProps {
	src: { link: string };
}

interface EmbedContentProps {
	url: string;
}

interface BlogContent {
	id: string;
	type: "text" | "image" | "embed";
	content: string | { link: string };
}

interface BlogData {
	title: string;
	author: string;
	content: BlogContent[];
	tags: string[];
	created_at: string;
	thumbnail_path: { link: string };
}

const TextContent: React.FC<TextContentProps> = ({ content }) => (
	<div className="textcontent">{parse(content)}</div>
);

const ImageContent: React.FC<ImageContentProps> = ({ src }) => (
	<Image
		src={src.link}
		alt="blog-image"
		className="contentimages"
		width={100}
		height={100}
	/>
);

const EmbedContent: React.FC<EmbedContentProps> = ({ url }) => {
	if (url.includes("www.youtube.com")) {
		const videoId = url.split("v=")[1];
		return (
			<div className="youtube-preview">
				<iframe
					title="youtube-video"
					src={`https://www.youtube.com/embed/${videoId}`}
					allowFullScreen
					className="video"
				/>
			</div>
		);
	}
	return <div className="embed-preview">{url}</div>;
};

const PreviewPage: React.FC = () => {
	const router = useRouter();
	const [blog, setBlog] = useState<BlogData | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const session = authClient.useSession();
	const token = session?.data?.session.token || null;

	useEffect(() => {
		const storedBlog = localStorage.getItem("create-blog-draft");
		if (storedBlog) {
			console.log("Stored blog:", storedBlog);
			setBlog(JSON.parse(storedBlog));
		}
		setLoading(false);
	}, []);

	const handleEdit = (): void => {
		router.push("/manage/blogs/create");
	};

	const handlePublish = async (): Promise<void> => {
		if (!blog) return;

		try {
			await axios.post("http://127.0.0.1:4000/blogs/create", blog, {
				headers: {
					Authorization: `Bearer ${token}` || "",
				},
			});
			localStorage.removeItem("create-blog-draft");
			router.push("/manage/blogs");
			alert("Blog published successfully!");
		} catch (error) {
			console.error("Error publishing blog:", error);
			alert("Failed to publish blog");
		}
	};

	if (loading) return <LoadingSpinner />;
	if (!blog) return <div>No blog data found</div>;

	return (
		<>
			<div className="contents fade-in">
				<div className="contentsinfo">
					<h1 className="title">{blog.title}</h1>
					<h3 className="byline">
						<span className="colorforby">By: </span>
						{blog.author}
					</h3>
					<h3 className="datecreation">
						<span className="colorforby">Created: </span>
						{new Date(blog.created_at).toLocaleDateString()}
					</h3>
					<span className="tagsspan">
						{blog.tags?.map((tag, index) => (
							<button key={`tag-${index}`} type="button" className="tags">
								{tag}
							</button>
						))}
					</span>
				</div>
				<div className="contentsmain">
					<div className="maincontent">
						{blog.content?.map((block, index) => {
							switch (block.type) {
								case "text":
									return (
										<TextContent
											key={`content-${index}`}
											content={block.content as string}
										/>
									);
								case "image":
									return (
										<ImageContent
											key={`content-${index}`}
											src={block.content as { link: string }}
										/>
									);
								case "embed":
									return (
										<EmbedContent
											key={`content-${index}`}
											url={block.content as string}
										/>
									);
								default:
									return null;
							}
						})}
					</div>
				</div>
			</div>
			<div className="submit-blogdiv">
				<button type="submit" onClick={handlePublish} id="submit-blog">
					Publish
				</button>
				<button type="button" id="submit-blog" onClick={handleEdit}>
					Edit
				</button>
			</div>
		</>
	);
};

export default PreviewPage;
