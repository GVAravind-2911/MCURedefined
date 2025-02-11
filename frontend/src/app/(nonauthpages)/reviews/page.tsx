import type { BlogList } from "@/types/BlogTypes"
import type React from "react";
import BlogComponent from "@/components/BlogComponent";
import axios from "axios";

async function getData() :Promise<BlogList[]> {
    try {
        const response = await axios.get<BlogList[]>("http://127.0.0.1:4000/reviews");
        return response.data;
    } catch (error) {
        console.error('Failed to fetch blogs:', error);
        throw new Error('Failed to fetch blogs');
    }
}

export default async function Blogs(): Promise<React.ReactElement> {
    const reviews = await getData();
    return <BlogComponent path="reviews" initialBlogs={reviews} />;
}