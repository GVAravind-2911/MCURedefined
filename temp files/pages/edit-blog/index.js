import BlogsComponent from "@/components/BlogComponent";
import Layout from "@/components/Layout";
import React from "react";

export default function editBlog() {
	return (
		<Layout>
			<BlogsComponent path="edit-blog" />
		</Layout>
	);
}
