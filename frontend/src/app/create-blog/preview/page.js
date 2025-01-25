'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "@/components/LoadingSpinner";
import "@/styles/blog.css";

const TextContent = ({ content }) => (
    <div className="textcontent" dangerouslySetInnerHTML={{ __html: content }} />
);

const ImageContent = ({ src }) => (
    <img src={src} alt="blog-image" className="contentimages"/>
);

const EmbedContent = ({ url }) => {
    if (url.includes("www.youtube.com")) {
        const videoId = url.split('v=')[1];
        return (
            <div className="youtube-preview">
                <iframe 
                    title="youtube-video"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    frameBorder="0"
                    allowFullScreen
                    className="video"
                />
            </div>
        );
    }
    return <div className="embed-preview">{url}</div>;
};

export default function PreviewPage() {
    const router = useRouter();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedBlog = localStorage.getItem('create-blog-draft');
        if (storedBlog) {
            setBlog(JSON.parse(storedBlog));
        }
        setLoading(false);
    }, []);

    const handleEdit = () => {
        router.push('/create-blog');
    };

    const handlePublish = async () => {
        if (!blog) return;
        
        try {
            await axios.post('http://127.0.0.1:4000/create-blog', blog);
            localStorage.removeItem('create-blog-draft'); // Only remove after successful publish
            router.push('/blogs');
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
                            <button 
                                key={`tag-${index}`}
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
                        {blog.content?.map((block, index) => {
                            switch(block.type) {
                                case 'text':
                                    return <TextContent key={`content-${index}`} content={block.content} />;
                                case 'image':
                                    return <ImageContent key={`content-${index}`} src={block.content.link} />;
                                case 'embed':
                                    return <EmbedContent key={`content-${index}`} url={block.content} />;
                                default:
                                    return null;
                            }
                        })}
                    </div>
                </div>
            </div>
            <div className="submit-blogdiv">
                <button 
                    type="submit" 
                    onClick={handlePublish} 
                    id="submit-blog"
                >
                    Publish
                </button>
                <button 
                    type="button" 
                    id="submit-blog"
                    onClick={handleEdit}
                >
                    Edit
                </button>
            </div>
        </>
    );
}