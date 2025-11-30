"use client";

import type { JSX } from "react";
import { BLOGS_CONFIG } from "@/types/ContentTypes";
import ContentEditWrapper from "@/components/manage/ContentEditWrapper";

export default function Page(): JSX.Element {
	return <ContentEditWrapper config={BLOGS_CONFIG} />;
}
