'use client'

import type { JSX } from "react";
import type { ContentBlock } from "@/types/BlogTypes";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "@/components/LoadingSpinner";
import parse from "html-react-parser";
import ScriptEmbed from "@/components/ScriptEmbed";
import moment from "moment";
import Image from "next/image";
import "@/styles/blog.css";


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

    useEffect(() => {
        if (id) {
            const storedBlog = localStorage.getItem(`blog-${id}`);
            if (storedBlog) {
                setBlog(JSON.parse(storedBlog));
            }
            setLoading(false);
        }
    }, [id]);

    const handleSave = async (): Promise<void> => {
        if (blog) {
            try {
                await axios.put(`http://127.0.0.1:4000/blog/update/${id}`, blog);
                localStorage.removeItem(`blog-${id}`);
                alert("Blog saved!");
                router.push("/edit-blog");
            } catch (error) {
                console.error("Error saving blog:", error);
            }
        }
    };

    const handleEdit = (): void => {
        router.push(`/edit-blog/${id}`);
    };

    const loadScript = (url: string): JSX.Element => {
        if (url.includes("www.youtube.com")) {
            const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|vi|e(?:mbed)?)\/|\S*?[?&]v=|(?:\S*\?list=))|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
            const match = url.match(regex);
            if (match) {
                const videoId = match[1];
                return <iframe src={`https://www.youtube.com/embed/${videoId}`} title="youtube-video" allowFullScreen className="video"/>;
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
          return <Image key={block.id} src={block.content.link} alt="blog-image" className="contentimages" width={1000} height={1000}/>;
        }
        if (block.type === "embed") {
          if (block.content.includes("www.youtube.com")) {
            return <div key={block.id} className="youtube-preview">{loadScript(block.content)}</div>;
          }
          if (block.content.includes("script async")) {
            return <ScriptEmbed key={block.id} content={block.content} />;
          }
        }
        return <div key={block.id}/>;
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
                    {moment(new Date()).format('dddd, D MMMM, YYYY')}
                </h3>
                {blog?.updated_at && (
                    <h3 className="dateupdate">
                        <span className="colorforby">Updated: </span>
                        {blog?.updated_at}
                    </h3>
                )}
                <span className="tagsspan">
                    {blog?.tags?.map((tag, index) => (
                        <button 
                            key={index} 
                            type="button" 
                            className="tags"
                        >
                            {tag}
                        </button>
                    ))}
                </span>
            </div>
            <div className="contentsmain">
                <div className="maincontent">
                    {contentElements}
                </div>
            </div>
        </div>
        <div className="submit-blogdiv">
                <button type="submit" onClick={handleSave} id="submit-blog" className="save-button">
                    Save
                </button>
                <button type="button" id="submit-blog" className="edit-button" onClick={handleEdit}>
                    Edit
                </button>
        </div>
        </>
    );
}