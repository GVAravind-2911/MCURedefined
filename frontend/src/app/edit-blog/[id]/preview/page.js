'use client'

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "@/components/LoadingSpinner";
import "@/styles/blog.css";

export default function PreviewPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const [blog, setBlog] = useState(null);
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

    const handleSave = async () => {
        if (blog) {
            try {
                await axios.post(`http://127.0.0.1:4000/blog-save/${id}`, blog);
                localStorage.removeItem(`blog-${id}`);
                alert("Blog saved!");
                router.push("/edit-blog");
            } catch (error) {
                console.error("Error saving blog:", error);
            }
        }
    };

    const handleEdit = () => {
        router.push(`/edit-blog/${id}`);
    };

    const loadScript = (url) => {
        if (url.includes("script async")) {
            const script = document.createElement("script");
            const regex1 = /<script async.*?src="(https:\/\/.*?)"/;
            const match1 = url.match(regex1);
            if (match1) {
                script.src = match1[1];
                script.async = true;
                document.body.appendChild(script);
                return url;
            }
        }
        if (url.includes("www.youtube.com")) {
            const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|vi|e(?:mbed)?)\/|\S*?[?&]v=|(?:\S*\?list=))|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
            const match = url.match(regex);
            if (match) {
                const videoId = match[1];
                return `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen class="video"></iframe>`;
            }
        }
        return url;
    };

    if (loading) return <LoadingSpinner />;
    if (!blog) return <div>No blog data found</div>;

    const contentString = blog.content.map((block) => {
        if (block.type === "text") {
            return `<p class="textcontent">${block.content}</p>`;
        } if (block.type === "image") {
            return `<img src="${block.content.link}" alt="blog-image" class="contentimages"/>`;
        } if (block.type === "embed") {
            if (block.content.includes("www.youtube.com")) {
                return `<div class="youtube-preview">${loadScript(block.content)}</div>`;
            }
            return `<div class="embed-preview">${loadScript(block.content)}</div>`;
        }
        return '';
    }).join('');

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
                    <span className="colorforby">Posted: </span>
                    {blog.created_at}
                </h3>
                {blog.updated_at && (
                    <h3 className="dateupdate">
                        <span className="colorforby">Updated: </span>
                        {blog.updated_at}
                    </h3>
                )}
                <span className="tagsspan">
                    {blog.tags.map((tag) => (
                        <button key={tag} type="button" className="tags">{tag}</button>
                    ))}
                </span>
            </div>
            <div className="contentsmain">
                <div className="maincontent" dangerouslySetInnerHTML={{ __html: contentString }} />
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