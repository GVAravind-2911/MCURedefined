import type React from "react";
import { BLOGS_CONFIG } from "@/types/ContentTypes";
import ContentListPage from "@/components/shared/ContentListPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Blogs(): Promise<React.ReactElement> {
	return (
		<ContentListPage
			config={BLOGS_CONFIG}
			heroTitle="Redefined Blog"
			heroDescription="Explore articles, insights, and the latest news about the Marvel Cinematic Universe. Dive into fan theories, character analyses, and behind-the-scenes information."
		/>
	);
}
