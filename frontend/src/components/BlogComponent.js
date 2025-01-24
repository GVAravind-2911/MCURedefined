'use client'

import React, { useState } from "react";
import moment from "moment";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingSpinner from "./LoadingSpinner";

function BlogsComponent({ path, initialBlogs }) {
    const [blogs] = useState(initialBlogs);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleNavigation = (e, id) => {
        e.preventDefault();
        router.push(`/${path}/${id}`);
    };

    return (
        <>
            {isLoading && <LoadingSpinner />}
            {!isLoading && (
                <div className="blogs fade-in">
                    {blogs.map((blog) => (
                        <a
                            href={`/${path}/${blog.id}`}
                            key={blog.id}
                            className="cardblog"
                            onClick={(e) => handleNavigation(e, blog.id)}
                        >
                            <div className="image-container">
                                <Image
                                    src={blog.thumbnail_path.link}
                                    width={400}
                                    height={200}
                                    alt="Thumbnail"
                                    className="thumbnailset"
                                />
                            </div>
                            <div className="cardcontent">
                                <h1 className="titleblog">{blog.title}</h1>
                                <h4 className="authorblog">By: {blog.author}</h4>
                                <h4 className="dateblog">
                                    Posted: {moment(blog.created_at, "YYYY/MM/DD HH:mm:ss").format("YYYY/MM/DD")}
                                </h4>
                                {blog.updated_at !== '' && (
                                    <h4 className="dateblog">
                                        Updated: {moment(blog.updated_at, "YYYY/MM/DD HH:mm:ss").format("YYYY/MM/DD")}
                                    </h4>
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