"use client";

import { REVIEWS_CONFIG } from "@/types/ContentTypes";
import ContentEditor from "@/components/manage/ContentEditor";

export default function CreateReviewPage(): React.ReactElement {
	return <ContentEditor config={REVIEWS_CONFIG} mode="create" />;
}
