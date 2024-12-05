import axios from "axios";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { useRouter } from "next/router";

function BlogsComponent(props) {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsLoading(true);
        axios
            .get("http://127.0.0.1:4000/send-blogs") // Fetch blog data from your Flask backend
            .then((response) => {
                setBlogs(response.data);
                console.log(response.data);
                setIsLoading(false);
            })
            .catch((error) => console.error(error));
    }, []);

    const handleNavigation = (e, id) => {
        e.preventDefault();
        router.push(`/${props.path}/${id}`);
    };

    return (
        <>
            {isLoading && (
                <div>Loading</div>
            )}
            {!isLoading && (
                <div className="blogs fade-in">
                    {blogs.map((blog) => (
                        <a
                            href={`/${props.path}/${blog.id}`}
                            key={blog.id}
                            className="cardblog"
                            onClick={(e) => handleNavigation(e, blog.id)}
                        >
                            <div className="image-container">
                                <img
                                    src={blog.thumbnail_path.link}
                                    alt="Thumbnail"
                                    className="thumbnailset"
                                />
                            </div>
                            <div className="cardcontent">
                                <h1 className="titleblog">{blog.title}</h1>
                                <h4 className="authorblog">By: {blog.author}</h4>
                                <h4 className="dateblog">Posted: {moment(blog.created_at, "YYYY/MM/DD HH:mm:ss").format("YYYY/MM/DD")}</h4>
                                {blog.updated_at !== '' && (
                                    <h4 className="dateblog">Updated: {moment(blog.updated_at, "YYYY/MM/DD HH:mm:ss").format("YYYY/MM/DD")}</h4>
                                )}
                                <h3 className="descblog">{blog.description}</h3>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </>
    );
}

export default BlogsComponent;