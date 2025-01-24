import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";


export default function PreviewPage() {
    const router = useRouter();
    const { id } = router.query;
    const [blog, setBlog] = useState(null);

    useEffect(() => {
        if (id) {
            // Fetch blog data from local storage
            const storedBlog = localStorage.getItem(`blog-${id}`);
            if (storedBlog) {
                setBlog(JSON.parse(storedBlog));
            }
        }
    }, [id]);

    const handleSave = () => {
        if (blog) {
            axios.post(`http://127.0.0.1:4000/blog-save/${id}`, blog)
                .then((response) => {
                    console.log(response.data);
                })
                .catch((error) => {
                    console.error("Error saving blog:", error);
                });
            localStorage.removeItem(`blog-${id}`);
            alert("Blog saved!");
            router.push("/edit-blog");
        }
    };

    const handleEdit = () => {
        // Redirect to edit page with fromPreview query parameter set to true
        router.push(`/edit-blog/${id}`);
    };

    if (!blog) {
        return <p>Loading...</p>;
    }

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
                const embedUrl = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen class="video"></iframe>`;
                return embedUrl;
            }
        }
        return url;
    };

    const contentString = blog.content.map((block, index) => {
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
        <Layout>
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
                <button type="submit" onClick={handleSave} id="submit-blog" className="save-button">Save</button>
                <button type="button" id="submit-blog" className="edit-button" onClick={handleEdit}>Edit</button>
            </div>
        </Layout>
    );
}