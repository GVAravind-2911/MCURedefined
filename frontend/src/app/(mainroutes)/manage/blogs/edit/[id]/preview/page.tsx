"use client";

import type { JSX } from "react";
import { useParams } from "next/navigation";
import { BLOGS_CONFIG } from "@/types/ContentTypes";
import ContentPreview from "@/components/manage/ContentPreview";

export default function PreviewPage(): JSX.Element {
	const params = useParams();
	const id = params?.id as string;

	return <ContentPreview config={BLOGS_CONFIG} mode="edit" id={id} />;
}
