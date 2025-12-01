"use client";

import type { JSX } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "@/components/main/LoadingSpinner";
import ScriptEmbed from "@/components/edit/ScriptEmbed";
import moment from "moment";
import Image from "next/image";
import parse from "html-react-parser";
import type { ContentBlock, ContentConfig, ContentData } from "@/types/ContentTypes";
import { getDraftStorageKey } from "@/lib/content/utils";
import { getProxyUrl } from "@/lib/config/backend";
import { authClient } from "@/lib/auth/auth-client";
import "@/styles/blog.css";

interface ContentPreviewProps {
	config: ContentConfig;
	mode: "create" | "edit";
	id?: string;
}

interface TextContentProps {
	content: string;
}

interface ImageContentProps {
	src: { link: string };
}

interface EmbedContentProps {
	url: string;
}

const TextContent: React.FC<TextContentProps> = ({ content }) => (
	<div className="textcontent">{parse(content)}</div>
);

const ImageContent: React.FC<ImageContentProps> = ({ src }) => (
	<Image
		src={src.link}
		alt="content-image"
		className="contentimages"
		width={1000}
		height={1000}
	/>
);

const EmbedContent: React.FC<EmbedContentProps> = ({ url }) => {
	if (url.includes("www.youtube.com")) {
		const regex =
			/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|vi|e(?:mbed)?)\/|\S*?[?&]v=|(?:\S*\?list=))|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
		const match = url.match(regex);
		if (match) {
			const videoId = match[1];
			return (
				<div className="youtube-preview">
					<iframe
						src={`https://www.youtube.com/embed/${videoId}`}
						title="youtube-video"
						allowFullScreen
						className="video"
					/>
				</div>
			);
		}
	}
	if (url.includes("script async")) {
		return <ScriptEmbed content={url} />;
	}
	return <div className="embed-preview">{url}</div>;
};

export default function ContentPreview({
	config,
	mode,
	id,
}: ContentPreviewProps): JSX.Element {
	const router = useRouter();
	const [content, setContent] = useState<ContentData | null>(null);
	const [loading, setLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const session = authClient.useSession();
	const token = session?.data?.session?.token || null;

	const storageKey = getDraftStorageKey(config, mode === "edit" ? id : undefined);

	useEffect(() => {
		const storedContent = localStorage.getItem(storageKey);
		if (storedContent) {
			setContent(JSON.parse(storedContent));
		}
		setLoading(false);
	}, [storageKey]);

	const handleEdit = (): void => {
		if (mode === "edit" && id) {
			router.push(`${config.managePath}/edit/${id}`);
		} else {
			router.push(`${config.managePath}/create`);
		}
	};

	const handlePublish = async (): Promise<void> => {
		if (!content) return;

		try {
			setIsSaving(true);
			setLoading(true);

			const apiPath =
				mode === "edit"
					? getProxyUrl(`${config.apiPath}/update/${id}`)
					: getProxyUrl(`${config.apiPath}/create`);

			const method = mode === "edit" ? "put" : "post";

			await axios[method](apiPath, content, {
				headers: {
					Authorization: `Bearer ${token}` || "",
				},
			});

			localStorage.removeItem(storageKey);
			router.push(config.managePath);
			alert(
				`${config.singularName.charAt(0).toUpperCase() + config.singularName.slice(1)} ${mode === "edit" ? "saved" : "published"} successfully!`,
			);
		} catch (error) {
			setLoading(false);
			console.error(`Error publishing ${config.singularName}:`, error);

			if (axios.isAxiosError(error)) {
				const statusCode = error.response?.status;

				if (statusCode === 403) {
					alert(
						`You don't have permission to ${mode === "edit" ? "update" : "create"} this ${config.singularName}. Please log in with an admin account.`,
					);
				} else if (statusCode === 401) {
					alert("Your session has expired. Please log in again.");
					router.push("/auth/login");
				} else if (statusCode === 404) {
					alert(
						`${config.singularName.charAt(0).toUpperCase() + config.singularName.slice(1)} not found. It may have been deleted.`,
					);
					router.push(config.managePath);
				} else if (statusCode === 413) {
					alert(
						"Content too large. Please reduce the size of images or content.",
					);
				} else if (error.response?.data?.message) {
					alert(`Error: ${error.response.data.message}`);
				} else {
					alert(
						`Failed to ${mode === "edit" ? "save" : "publish"} ${config.singularName}. Please try again later.`,
					);
				}
			} else {
				alert("An unexpected error occurred. Please try again.");
			}
		} finally {
			setIsSaving(false);
		}
	};

	if (loading) return <LoadingSpinner />;
	if (!content) return <div>No {config.singularName} data found</div>;

	const renderContent = (block: ContentBlock, index: number): JSX.Element => {
		switch (block.type) {
			case "text":
				return <TextContent key={block.id || index} content={block.content} />;
			case "image":
				return <ImageContent key={block.id || index} src={block.content} />;
			case "embed":
				return <EmbedContent key={block.id || index} url={block.content} />;
		}
	};

	return (
		<div className="preview-container">
			<div className="contents preview-content fade-in">
				<div className="contentsinfo">
					<h1 className="title">{content.title}</h1>
					<h3 className="byline">
						<span className="colorforby">By: </span>
						{content.author}
					</h3>
					<h3 className="datecreation">
						<span className="colorforby">
							{mode === "edit" ? "Posted: " : "Created: "}
						</span>
						{moment(content.created_at || new Date()).format(
							"dddd, D MMMM, YYYY",
						)}
					</h3>
					{content.updated_at && (
						<h3 className="dateupdate">
							<span className="colorforby">Updated: </span>
							{content.updated_at}
						</h3>
					)}
					<span className="tagsspan">
						{content.tags?.map((tag, index) => (
							<button key={`tag-${index}`} type="button" className="tags">
								{tag}
							</button>
						))}
					</span>
				</div>
				<div className="contentsmain">
					<div className="maincontent">
						{content.content?.map((block, index) => renderContent(block, index))}
					</div>
				</div>
			</div>
			<div className="preview-actions">
				<button
					type="submit"
					onClick={handlePublish}
					className="preview-publish-btn"
					disabled={isSaving}
				>
					{isSaving
						? mode === "edit"
							? "Saving..."
							: "Publishing..."
						: mode === "edit"
							? "Save"
							: "Publish"}
				</button>
				<button
					type="button"
					className="preview-edit-btn"
					onClick={handleEdit}
				>
					Edit
				</button>
			</div>
		</div>
	);
}
