import type React from "react";
import { REVIEWS_CONFIG } from "@/types/ContentTypes";
import ContentListPage from "@/components/shared/ContentListPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Reviews(): Promise<React.ReactElement> {
	return (
		<ContentListPage
			config={REVIEWS_CONFIG}
			heroTitle="Redefined Reviews"
			heroDescription="Explore in-depth reviews of Marvel Cinematic Universe films, shows, and streaming content. Read critical analysis, ratings, and fan perspectives on your favorite Marvel productions."
		/>
	);
}
