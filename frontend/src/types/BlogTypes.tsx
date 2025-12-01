export interface ThumbnailPath {
	link: string;
}

interface BaseBlock {
	id: string;
	type: "text" | "image" | "embed";
}

interface TextBlock extends BaseBlock {
	type: "text";
	content: string;
}

interface ImageBlock extends BaseBlock {
	type: "image";
	content: {
		link: string;
	};
}

interface EmbedBlock extends BaseBlock {
	type: "embed";
	content: string;
}

export type ContentBlock = TextBlock | ImageBlock | EmbedBlock;

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

export interface BlogData {
	id: number;
	title: string;
	author: string;
	author_id?: string;
	author_info?: AuthorInfo;
	description: string;
	content: ContentBlock[];
	tags: string[];
	thumbnail_path: ThumbnailPath;
	created_at: string;
	updated_at: string;
}

export interface Article {
	thumbnail_path: { link: string };
	title: string;
	author: string;
	author_id?: string;
	author_info?: AuthorInfo;
	created_at: string;
	id: number;
}

export interface CreateBlogData extends Omit<BlogData, "created_at"> {}

export interface BlogList extends Omit<BlogData, "content"> {
	description: string;
}

export interface InitialState {
	contentBlocks: ContentBlock[];
	title: string;
	author: string;
	description: string;
	thumbnail: string;
	tags: string[];
}

export interface TextContentProps {
	content: string;
}

export interface ImageContentProps {
	src: string;
}

export interface EmbedContentProps {
	url: string;
}
