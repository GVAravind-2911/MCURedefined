import type React from "react";
import { BLOGS_CONFIG } from "@/types/ContentTypes";
import ManageListPage from "@/components/manage/ManageListPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditBlogPage(): Promise<React.ReactElement> {
	return <ManageListPage config={BLOGS_CONFIG} />;
}
