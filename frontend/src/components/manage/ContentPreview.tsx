"use client";

import type { JSX } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
	<div className="w-full [&_i]:text-[#ec1d24] [&_b_i]:text-[#ec1d24]">{parse(content)}</div>
);

const ImageContent: React.FC<ImageContentProps> = ({ src }) => (
	<Image
		src={src.link}
		alt="content-image"
		className="ml-[25%] mt-[5%] mb-[5%] w-1/2 h-1/2 object-contain rounded-[5px] justify-center self-center"
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
				<div className="w-[75%] h-[350px] mt-10 flex justify-center ml-[12.5%]">
					<iframe
						src={`https://www.youtube.com/embed/${videoId}`}
						title="youtube-video"
						allowFullScreen
						className="w-[90%] h-[90%]"
					/>
				</div>
			);
		}
	}
	if (url.includes("script async")) {
		return <ScriptEmbed content={url} />;
	}
	return <div className="text-[#ec1d24] text-center py-4">{url}</div>;
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
	const [stickyProgress, setStickyProgress] = useState(1); // 1 = fully sticky, 0 = not sticky
	const sentinelRef = useRef<HTMLDivElement>(null);
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

	// Track scroll progress for gradual footer transition
	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				// Use intersection ratio for gradual transition
				// When ratio is 0, footer is fully sticky; when 1, fully shrunk
				setStickyProgress(1 - entry.intersectionRatio);
			},
			{ 
				threshold: Array.from({ length: 51 }, (_, i) => i / 50) // 0, 0.02, 0.04, ... 1.0 (finer steps)
			}
		);

		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [loading, content]);

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
	if (!content) return (
		<div className="flex justify-center items-center min-h-[50vh] text-xl text-[#ec1d24] font-[BentonSansRegular]">
			No {config.singularName} data found
		</div>
	);

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
		<div className="flex flex-col w-full min-h-screen">
			<div className="w-[60%] mx-auto mb-[25px] mt-[1%] rounded-[5px] animate-[fadeInSimple_1s_ease] max-md:w-[90%] max-[480px]:w-[90%]">
				<div className="after:content-[''] after:block after:w-[60%] after:h-0.5 after:bg-linear-to-r after:from-transparent after:via-[#ec1d24]/70 after:to-transparent after:mx-auto after:my-8">
					<h1 className="text-[70px] max-md:text-5xl ml-[3%] mt-[3%] text-white font-[BentonSansBold] text-center">{content.title}</h1>
					<div className="flex flex-col items-center py-3 px-5 my-4 mx-auto rounded-lg bg-[rgba(40,40,40,0.3)] w-fit max-md:w-[90%]">
						<h3 className="text-lg my-[0.5%] tracking-[0.03em] font-[BentonSansRegular] text-[#ec1d24]">
							<span className="font-[BentonSansRegular]">By: </span>
							{content.author}
						</h3>
						<h3 className="text-xl text-[#ec1d24] text-center my-[0.5%] tracking-[0.03em] font-[BentonSansRegular]">
							<span className="font-[BentonSansRegular]">
								{mode === "edit" ? "Posted: " : "Created: "}
							</span>
							{moment(content.created_at || new Date()).format(
								"dddd, D MMMM, YYYY",
							)}
						</h3>
						{content.updated_at && (
							<h3 className="text-xl text-[#ec1d24] text-center my-[0.5%] tracking-[0.03em] font-[BentonSansRegular]">
								<span className="font-[BentonSansRegular]">Updated: </span>
								{content.updated_at}
							</h3>
						)}
					</div>
					<span className="my-5 flex flex-wrap justify-center gap-2.5">
						{content.tags?.map((tag, index) => (
							<button 
								key={`tag-${index}`} 
								type="button" 
								className="text-base text-white font-[BentonSansRegular] bg-[#ec1d24]/80 border-none rounded-[20px] py-1.5 px-4 transition-all duration-300 inline-flex items-center before:content-['#'] before:mr-1 before:opacity-70 hover:-translate-y-[3px] hover:shadow-[0_4px_8px_rgba(236,29,36,0.4)] hover:bg-[#ec1d24] cursor-default"
							>
								{tag}
							</button>
						))}
					</span>
				</div>
				<div className="mx-[2.5%] mt-[2.5%] mb-[5%] w-[96%] rounded-[5px] flex flex-col justify-center p-[2%]">
					<div className="text-lg [word-spacing:0.1em] font-[BentonSansBook] whitespace-pre-line pb-[2%] text-white leading-[2.5] mb-[2%] w-full items-center">
						{content.content?.map((block, index) => renderContent(block, index))}
					</div>
				</div>
			</div>
			{/* Sentinel element to detect when we've scrolled past the content */}
			<div ref={sentinelRef} className="h-[100px]" />
			<div 
				className="flex justify-center gap-4 py-6 px-4 sticky bottom-0"
				style={{
					width: `${20 + (stickyProgress * 80)}%`,
					margin: '0 auto',
					backgroundColor: `rgba(30, 30, 30, ${stickyProgress * 0.8})`,
					backdropFilter: stickyProgress > 0.1 ? 'blur(8px)' : 'none',
					borderTop: `1px solid rgba(236, 29, 36, ${stickyProgress * 0.3})`,
					borderRadius: stickyProgress < 0.5 ? '25px 25px 0 0' : '0',
					transition: 'width 0.15s ease-out, background-color 0.15s ease-out, border-top 0.15s ease-out, border-radius 0.2s ease-out',
				}}
			>
				<button
					type="submit"
					onClick={handlePublish}
					className="px-8 py-3 text-lg font-[BentonSansBold] text-white bg-[#ec1d24] border-none rounded-[25px] cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(236,29,36,0.5)] hover:bg-[#ff2a32] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
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
					className="px-8 py-3 text-lg font-[BentonSansBold] text-[#ec1d24] bg-transparent border-2 border-[#ec1d24] rounded-[25px] cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ec1d24]/10 hover:shadow-[0_4px_12px_rgba(236,29,36,0.3)]"
					onClick={handleEdit}
				>
					Edit
				</button>
			</div>
		</div>
	);
}
