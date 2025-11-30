import type React from "react";
import HomeComponent from "@/components/main/HomeComponent";
import "@/styles/enhanced-home.css";
import axios from "axios";
import { getBackendUrl } from "@/lib/config/backend";

export const dynamic = "force-dynamic";

interface BlogData {
	id: number;
	title: string;
	author: string;
	created_at: string;
	thumbnail_path: {
		link: string;
	};
}

async function fetchData(): Promise<BlogData | null> {
	try {
		const response = await axios.get(getBackendUrl("blogs/recent"));
		if (response.status !== 200) {
			return null;
		}
		console.log("Fetched data:", response.data);
		return response.data;
	} catch (error) {
		return null; // Handle the error case
	}
}

export default async function Page(): Promise<React.ReactElement> {
	const latestBlog = await fetchData();

	return (
		<HomeComponent
			latestBlog={
				latestBlog || {
					id: 0,
					title: "",
					author: "",
					created_at: "",
					thumbnail_path: { link: "" },
				}
			}
		/>
	);
}
