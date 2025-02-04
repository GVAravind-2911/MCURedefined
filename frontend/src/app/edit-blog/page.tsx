import type { BlogList } from "@/types/BlogTypes"
import type React from "react";
import BlogsComponent from "@/components/BlogComponent";
import axios from "axios";
import '@/styles/blogposts.css'

async function getData():Promise<BlogList[]> {
    try {
        const response = await axios.get<BlogList[]>("http://127.0.0.1:4000/blogs");
        return response.data;
    } catch (error) {
        console.error('Failed to fetch blogs:', error);
        throw new Error('Failed to fetch blogs');
    }
}


export default async function editBlog(): Promise<React.ReactElement> {
    const blogs = await getData();
	return <BlogsComponent path="edit-blog" initialBlogs={blogs}/>;
}
