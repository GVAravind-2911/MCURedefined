'use client'

import React from "react";
import type { BlogsComponentProps } from "@/types/StructureTypes";
import { useState } from "react";
import moment from "moment";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type {BlogList} from "@/types/BlogTypes";
import "@/styles/blogposts.css";

const BlogsComponent : React.FC<BlogsComponentProps> = ({ path, initialBlogs }) => {
    const [blogs] = useState<BlogList[]>(initialBlogs);
    const router = useRouter();

    const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, id: number) => {
        e.preventDefault();
        router.push(`/${path}/${id}`);
    };

    return (
        <>
                <div className="blogs fade-in">
                    <hr className="divider" />
                    {blogs.map((blog) => (
                        <React.Fragment key={blog.id}>
                        <a
                            href={`/${path}/${blog.id}`}
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
                                    Posted: {moment(blog.created_at, "YYYY/MM/DD HH:mm:ss").format("dddd, D MMMM, YYYY")}
                                </h4>
                                {blog.updated_at !== '' && (
                                    <h4 className="dateblog">
                                        Updated: {moment(blog.updated_at, "YYYY/MM/DD HH:mm:ss").format("dddd, D MMMM, YYYY")}
                                    </h4>
                                )}
                                <h3 className="descblog">{blog.description}</h3>
                            </div>
                        </a>
                        <hr className="divider"/>
                        </React.Fragment>
                    ))}
                </div>
        </>
    );
}

export default BlogsComponent;