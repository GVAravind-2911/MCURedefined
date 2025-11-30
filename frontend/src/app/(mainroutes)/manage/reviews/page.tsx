import type React from "react";
import { REVIEWS_CONFIG } from "@/types/ContentTypes";
import ManageListPage from "@/components/manage/ManageListPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditReviewsPage(): Promise<React.ReactElement> {
	return <ManageListPage config={REVIEWS_CONFIG} />;
}
