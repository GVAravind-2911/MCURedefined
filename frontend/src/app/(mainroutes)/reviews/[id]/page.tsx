import type { AxiosError } from "axios";
import type { JSX } from "react";
import type { BlogData, ContentBlock, Article } from "@/types/BlogTypes";
import React from "react";
import { notFound } from "next/navigation";
import moment from "moment";
import axios from "axios";
import SimilarBlog from "@/components/SimilarBlog";
import parse from "html-react-parser";
import ScriptEmbed from "@/components/ScriptEmbed";
import Image from "next/image";
import { auth } from "@/lib/auth/auth";
import ReviewLikeButton from "@/components/review/ReviewLikeButton";
import ReviewShareButton from "@/components/review/ReviewShareButton";
import "@/styles/blog.css";
import { headers } from "next/headers";
import { getUserLikedReview } from "@/db/review-likes";
import { getReviewInteractions, incrementReviewView } from "@/db/review-interactions";
import Link from "next/link";

interface PageProps {
    params: Promise<{
        id: number;
    }>;
}

async function getBlogData(id: number): Promise<BlogData | null> {
    try {
        const response = await axios.get<BlogData>(
            `http://127.0.0.1:4000/reviews/${id}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching blog:", error as AxiosError);
        return null;
    }
}

async function getLatestBlogs(): Promise<Article[] | null> {
    try {
        const response = await axios.get<Article[]>(
            "http://127.0.0.1:4000/reviews/latest",
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching latest blogs:", error as AxiosError);
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
                    className="video"
                />
            );
        }
    }
    return;
};

export default async function BlogPage(props: PageProps): Promise<JSX.Element> {
    const params = await props.params;
    const blog = await getBlogData(params.id);
    const latestBlogs = await getLatestBlogs();
    const session = await auth.api.getSession({headers: await headers()});
    const userHasLiked = session?.user ? await getUserLikedReview(session.user.id, blog.id) : null;
    const totalInteractions = await getReviewInteractions(blog.id);
    
    if (blog) {
        await incrementReviewView(blog.id);
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
                        <div key={uniqueKey} className="textcontent">
                            {parse(block.content)}
                        </div>
                    );
                case "image":
                    return (
                        <Image
                            key={uniqueKey}
                            src={block.content.link}
                            alt={`blog-image-${index}`}
                            className="contentimages"
                            width={1000}
                            height={1000}
                        />
                    );
                case "embed":
                    if (block.content.includes("www.youtube.com")) {
                        return (
                            <div key={uniqueKey} className="youtube-preview">
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
        }
    );

    return (
        <>
            <div className="layout">
                <div className="contents fade-in">
                    <div className="contentsinfo">
                        <h1 className="title">{blog.title}</h1>
                        <div className="meta-info">
                            <h3 className="byline">
                                <span className="colorforby">By: </span>
                                {blog.author}
                            </h3>
                            <h3 className="datecreation">
                                {moment(blog.created_at).format("dddd, D MMMM, YYYY")}
                            </h3>
                            {blog.updated_at && (
                                <h3 className="dateupdate">
                                    <span className="colorforby">Updated: </span>
                                    {moment(blog.updated_at).format("dddd, D MMMM, YYYY")}
                                </h3>
                            )}
                        </div>
                        <span className="tagsspan">
                            {blog.tags.map((tag: string) => (
                                <Link
                                    key={tag}
                                    href={`/reviews?tags=${encodeURIComponent(tag)}`}
                                    className="tags"
                                    prefetch={false}
                                >
                                    {tag}
                                </Link>
                            ))}
                        </span>
                        <div className="likeandshare">
                            <ReviewLikeButton
                                reviewId={blog.id}
                                initialCount={totalInteractions.likes}
                                userHasLiked={!!userHasLiked}
                                isLoggedIn={!!session?.user}
                            />
                            <ReviewShareButton
                                reviewId={blog.id}
                                initialCount={totalInteractions.shares || 0}
                            />
                        </div>
                    </div>
                    <div className="contentsmain">
                        <div className="maincontent">{contentElements}</div>
                    </div>
                </div>
                <div className="otherblogs">
                    <h2 className="latestblogs">Latest Reviews</h2>
                    <hr className="separator" />
                    {latestBlogs.map((article: Article, index: number) => (
                        <React.Fragment key={article.title}>
                            <SimilarBlog articles={article} />
                            {index < latestBlogs.length - 1 && <hr className="separator" />}
                        </React.Fragment>
                    ))}
                    <hr className="separator" />
                </div>
            </div>
        </>
    );
}