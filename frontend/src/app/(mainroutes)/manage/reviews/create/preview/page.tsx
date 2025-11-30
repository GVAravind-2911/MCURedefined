"use client";

import { REVIEWS_CONFIG } from "@/types/ContentTypes";
import ContentPreview from "@/components/manage/ContentPreview";

export default function PreviewPage(): React.ReactElement {
	return <ContentPreview config={REVIEWS_CONFIG} mode="create" />;
}
