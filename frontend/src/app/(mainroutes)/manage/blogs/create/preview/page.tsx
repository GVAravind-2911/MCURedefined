"use client";

import { BLOGS_CONFIG } from "@/types/ContentTypes";
import ContentPreview from "@/components/manage/ContentPreview";

export default function PreviewPage(): React.ReactElement {
	return <ContentPreview config={BLOGS_CONFIG} mode="create" />;
}
