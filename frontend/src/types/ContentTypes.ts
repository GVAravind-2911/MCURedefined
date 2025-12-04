/**
 * Shared types for content management (blogs and reviews)
 */

export type ContentBlockType = "text" | "image" | "embed";

export type ContentBlock = {
	id: string;
} & (
	| { type: "text"; content: string }
	| { type: "image"; content: { link: string; key?: string } }
	| { type: "embed"; content: string }
);

/**
 * Author information from user database (cross-database reference)
 */
export interface AuthorInfo {
	id: string;
	name: string;
	username: string;
	display_name: string;
	image: string | null;
}

export interface ContentData {
	title: string;
	author: string;
	author_id?: string;
	author_info?: AuthorInfo;
	description: string;
	content: ContentBlock[];
	tags: string[];
	thumbnail_path: { link: string; key?: string };
	created_at?: string;
	updated_at?: string;
}

export interface ContentListItem {
	id: number;
	title: string;
	author: string;
	author_id?: string;
	author_info?: AuthorInfo;
	description: string;
	tags: string[];
	thumbnail_path: { link: string; key?: string };
	created_at: string;
	updated_at?: string;
}

export interface ContentListResponse {
	blogs: ContentListItem[];
	total: number;
	total_pages?: number;
	tags?: string[];
	authors?: string[];
}

export interface ErrorState {
	hasError: boolean;
	title: string;
	reasons: string[];
}

export type ContentType = "blogs" | "reviews";

export interface ContentConfig {
	type: ContentType;
	singularName: string;
	pluralName: string;
	storageKeyPrefix: string;
	apiPath: string;
	managePath: string;
	heroTitle: string;
	heroDescription: string;
}

export const BLOGS_CONFIG: ContentConfig = {
	type: "blogs",
	singularName: "blog",
	pluralName: "blogs",
	storageKeyPrefix: "blog",
	apiPath: "blogs",
	managePath: "/manage/blogs",
	heroTitle: "Manage Blog Posts",
	heroDescription:
		"Create, edit, and manage your blog content. Add new posts, update existing content, or remove outdated articles.",
};

export const REVIEWS_CONFIG: ContentConfig = {
	type: "reviews",
	singularName: "review",
	pluralName: "reviews",
	storageKeyPrefix: "review",
	apiPath: "reviews",
	managePath: "/manage/reviews",
	heroTitle: "Manage Reviews",
	heroDescription:
		"Create, edit, and manage your review content. Add new reviews, update existing content, or remove outdated reviews.",
};

export function getContentConfig(type: ContentType): ContentConfig {
	return type === "blogs" ? BLOGS_CONFIG : REVIEWS_CONFIG;
}
