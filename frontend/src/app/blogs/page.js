// app/blogs/page.jsx
import BlogComponent from "@/components/BlogComponent";
import axios from "axios";

async function getData() {
    try {
        const response = await axios.get("http://127.0.0.1:4000/send-blogs");
        return response.data;
    } catch (error) {
        console.error('Failed to fetch blogs:', error);
        throw new Error('Failed to fetch blogs');
    }
}

export default async function Blogs() {
    const blogs = await getData();
    return <BlogComponent path="blogs" initialBlogs={blogs} />;
}