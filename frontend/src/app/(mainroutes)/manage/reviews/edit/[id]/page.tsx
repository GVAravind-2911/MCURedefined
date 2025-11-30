"use client";

import { REVIEWS_CONFIG } from "@/types/ContentTypes";
import ContentEditWrapper from "@/components/manage/ContentEditWrapper";

export default function Page(): React.ReactElement {
	return <ContentEditWrapper config={REVIEWS_CONFIG} />;
}
