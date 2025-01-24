import BlogsComponent from "@/components/BlogComponent";
import axios from "axios";
import '@/styles/blogedit.css'

async function getData() {
    try {
        const response = await axios.get("http://127.0.0.1:4000/send-blogs");
        return response.data;
    } catch (error) {
        console.error('Failed to fetch blogs:', error);
        throw new Error('Failed to fetch blogs');
    }
}


export default async function editBlog() {
    const blogs = await getData();
	return <BlogsComponent path="edit-blog" initialBlogs={blogs}/>;
}
