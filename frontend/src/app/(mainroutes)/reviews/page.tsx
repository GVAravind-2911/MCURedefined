import type { BlogList } from "@/types/BlogTypes"
import type React from "react";
import BlogsComponent from "@/components/BlogComponent";
import axios from "axios";
import '@/styles/blogposts.css'

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface BlogResponse {
    reviews: BlogList[];
    total: number;
}

async function getData(page = 1, limit = 5): Promise<BlogResponse> {
    try {
        const response = await axios.get<BlogResponse>(
            `http://127.0.0.1:4000/reviews?page=${page}&limit=${limit}`,
            {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            }
        );
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch blogs:', error);
        throw new Error('Failed to fetch blogs');
    }
}


export default async function Blogs(): Promise<React.ReactElement> {
    // Always fetch page 1 initially from server
    const { reviews, total } = await getData(1, 3);
    const totalPages = Math.ceil(total / 3);

    return (
        <BlogsComponent 
            path="edit-blog" 
            initialBlogs={reviews}
            totalPages={totalPages}
            apiUrl="http://127.0.0.1:4000/reviews"
        />
    );
}
