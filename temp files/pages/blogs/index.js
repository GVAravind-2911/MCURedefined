import BlogComponent from "@/components/BlogComponent";
import Layout from "@/components/Layout";
import React from "react";

function Blogs() {
	return (
		<Layout>
			<BlogComponent path="blogs" />
		</Layout>
	);
}

export default Blogs;
