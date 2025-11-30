"use client";

import { BLOGS_CONFIG } from "@/types/ContentTypes";
import ContentEditor from "@/components/manage/ContentEditor";

export default function CreateBlogPage(): React.ReactElement {
	return <ContentEditor config={BLOGS_CONFIG} mode="create" />;
}
