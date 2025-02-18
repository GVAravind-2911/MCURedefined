import type { BlogList } from "@/types/BlogTypes"
import type React from "react";
import BlogComponent from "@/components/BlogComponent";
import axios from "axios";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getData() :Promise<BlogList[]> {
    try {
        'use server';
        const response = await axios.get<BlogList[]>("http://127.0.0.1:4000/reviews",{
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
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