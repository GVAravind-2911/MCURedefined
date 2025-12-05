import type { AxiosError } from "axios";
import type { JSX } from "react";
import type { BlogData, ContentBlock, Article } from "@/types/BlogTypes";
import React from "react";
import { notFound } from "next/navigation";
import moment from "moment";
import axios from "axios";
import parse from "html-react-parser";
import ScriptEmbed from "@/components/edit/ScriptEmbed";
import Image from "next/image";
import { auth } from "@/lib/auth/auth";
import ContentLikeButton from "@/components/shared/ContentLikeButton";
import ContentShareButton from "@/components/shared/ContentShareButton";
import { headers } from "next/headers";
import { getUserLikedBlog } from "@/db/blog-likes";
import { getBlogInteractions, incrementBlogView } from "@/db/blog-interactions";
import Link from "next/link";
import ErrorMessage from "@/components/main/ErrorMessage";
import CommentSection from "@/components/comments/DynamicComment";
import FixedSidebar from "@/components/blog/FixedSidebar";
import { getBackendUrl } from "@/lib/config/backend";

interface PageProps {
	params: Promise<{
		id: number;
	}>;
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
			title: "Unable to Load Blog",
			reasons: [
				"The blog may have been removed",
				"Temporary server error",
				"Please try again later",
			],
		};
	}
};

async function getBlogData(id: number): Promise<BlogData | ErrorState> {
	try {
		const response = await axios.get<BlogData>(
			getBackendUrl(`blogs/${id}`),
			{
				timeout: 10000, // 10 second timeout
				headers: {
					"Cache-Control": "no-cache",
				},
			},
		);
		return response.data;
	} catch (error) {
		return handleApiError(error);
	}
}

async function getLatestBlogs(): Promise<Article[] | null> {
	try {
		const response = await axios.get<Article[]>(
			getBackendUrl("blogs/latest"),
			{
				timeout: 5000,
				headers: {
					"Cache-Control": "no-cache",
				},
			},
		);
		return response.data;
	} catch (error) {
		return null;
	}
}

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
					className="w-[90%] h-[90%]"
				/>
			);
		}
	}
	return <div className="text-[#ec1d24] text-center py-4">Invalid embed URL</div>;
};

export default async function BlogPage(props: PageProps): Promise<JSX.Element> {
	const params = await props.params;
	const blogResult = await getBlogData(params.id);

	// Check if we received an error state instead of a blog
	if ("hasError" in blogResult) {
		return (
			<ErrorMessage title={blogResult.title} reasons={blogResult.reasons} />
		);
	}

	const blog = blogResult;
	const latestBlogs = await getLatestBlogs();
	const session = await auth.api.getSession({ headers: await headers() });

	// Only attempt to get user interactions if blog exists
	const userHasLiked = session?.user
		? await getUserLikedBlog(session.user.id, blog.id)
		: null;
	const totalInteractions = await getBlogInteractions(blog.id);

	if (blog) {
		await incrementBlogView(blog.id);
	}

	if (!blog) {
		notFound();
	}

	const contentElements = blog.content.map(
		(block: ContentBlock, index: number): JSX.Element => {
			const uniqueKey = `${block.id || index}-${block.type}`;

			switch (block.type) {
				case "text":
					return (
						<div key={uniqueKey} className="w-full [&_i]:text-[#ec1d24] [&_b_i]:text-[#ec1d24]">
							{parse(block.content)}
						</div>
					);
				case "image":
					return (
						<Image
							key={uniqueKey}
							src={block.content.link}
							alt={`blog-image-${index}`}
							className="ml-[25%] mt-[5%] mb-[5%] w-1/2 h-1/2 object-contain rounded-[5px] justify-center self-center"
							width={1000}
							height={1000}
						/>
					);
				case "embed":
					if (block.content.includes("www.youtube.com")) {
						return (
							<div key={uniqueKey} className="w-[75%] h-[350px] mt-10 flex justify-center ml-[12.5%]">
								{loadScript(block.content)}
							</div>
						);
					}
					if (block.content.includes("script async")) {
						return <ScriptEmbed key={uniqueKey} content={block.content} />;
					}
					break;
				default:
					return <div key={uniqueKey} />;
			}
		},
	);

	return (
		<>
			<div className="flex flex-row w-full gap-[2.5%] relative overflow-x-hidden max-md:flex-col">
				<div className="w-[60%] ml-[5%] mr-[25%] mb-[25px] mt-[1%] rounded-[5px] pr-0 animate-[fadeInSimple_1s_ease] max-md:-order-1 max-md:w-[90%] max-md:mx-auto max-[480px]:w-[90%]">
					<div className="after:content-[''] after:block after:w-[60%] after:h-0.5 after:bg-linear-to-r after:from-transparent after:via-[#ec1d24]/70 after:to-transparent after:mx-auto after:my-8">
						<h1 className="text-[70px] max-md:text-5xl ml-[3%] mt-[3%] text-white font-[BentonSansBold] text-center">{blog.title}</h1>
						<div className="flex flex-col items-center py-3 px-5 my-4 mx-auto rounded-lg bg-[rgba(40,40,40,0.3)] w-fit max-md:w-[90%]">
							<div className="flex justify-center items-center -mt-[3%]">
								{blog.author_info ? (
									<Link 
										href={`/profile/${blog.author_info.username}`}
										className="flex items-center gap-2.5 no-underline text-[#ec1d24] transition-all duration-200 py-2 px-4 rounded-[25px] bg-[#ec1d24]/10 hover:bg-[#ec1d24]/20 hover:-translate-y-0.5"
										prefetch={false}
									>
										{blog.author_info.image && (
											<Image
												src={blog.author_info.image}
												alt={blog.author_info.display_name}
												width={32}
												height={32}
												className="rounded-full border-2 border-[#ec1d24] object-cover"
											/>
										)}
										<span className="text-lg font-[BentonSansRegular] tracking-[0.03em]">{blog.author_info.display_name}</span>
									</Link>
								) : (
									<h3 className="text-lg my-[0.5%] tracking-[0.03em] font-[BentonSansRegular] -mt-[3%] text-[#ec1d24]">
										<span className="font-[BentonSansRegular]">By: </span>
										{blog.author}
									</h3>
								)}
							</div>
							<h3 className="text-xl text-[#ec1d24] text-center my-[0.5%] tracking-[0.03em] font-[BentonSansRegular]">
								{moment(blog.created_at).format("dddd, D MMMM, YYYY")}
							</h3>
							{blog.updated_at && (
								<h3 className="text-xl text-[#ec1d24] text-center my-[0.5%] tracking-[0.03em] font-[BentonSansRegular]">
									<span className="font-[BentonSansRegular]">Updated: </span>
									{moment(blog.updated_at).format("dddd, D MMMM, YYYY")}
								</h3>
							)}
						</div>
						<span className="my-5 flex flex-wrap justify-center gap-2.5">
							{blog.tags.map((tag: string) => (
								<Link
									key={tag}
									href={`/blogs?tags=${encodeURIComponent(tag)}`}
									className="text-base text-white font-[BentonSansRegular] bg-[#ec1d24]/80 border-none rounded-[20px] py-1.5 px-4 transition-all duration-300 inline-flex items-center before:content-['#'] before:mr-1 before:opacity-70 hover:-translate-y-[3px] hover:shadow-[0_4px_8px_rgba(236,29,36,0.4)] hover:bg-[#ec1d24] hover:cursor-pointer"
									prefetch={false}
								>
									{tag}
								</Link>
							))}
						</span>
						<div className="flex justify-center items-center gap-5 mt-5">
							<ContentLikeButton
								contentId={blog.id}
								contentType="blogs"
								initialCount={totalInteractions.likes}
								userHasLiked={!!userHasLiked}
								isLoggedIn={!!session?.user}
							/>
							<ContentShareButton
								contentId={blog.id}
								contentType="blogs"
								initialCount={totalInteractions.shares || 0}
							/>
						</div>
					</div>
					<div className="mx-[2.5%] mt-[2.5%] mb-[5%] w-[96%] rounded-[5px] flex flex-col justify-center p-[2%]">
						<div className="text-lg [word-spacing:0.1em] font-[BentonSansBook] whitespace-pre-line pb-[2%] text-white leading-[2.5] mb-[2%] w-full items-center">{contentElements}</div>
					</div>
					<CommentSection contentId={blog.id} contentType="blog" />
				</div>
				<FixedSidebar latestBlogs={latestBlogs} isReview={false} />
			</div>
		</>
	);
}
