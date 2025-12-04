export type ImageContent = {
	link: string;
	key?: string;
};

export interface ImageBlockProps {
	index: number;
	src: ImageContent;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onDelete: () => void;
}

export interface TextBlockProps {
	content: string;
	onChange: (text: string) => void;
	onDelete: () => void;
}

export type FormatType = "b" | "i" | "highlight";

export interface ThumbnailBlockProps {
	src: string | null;
	onChange: (event: { target: { files: File[] } }) => void;
}

export interface EmbedBlockProps {
	url: string;
	onChange: (newUrl: string) => void;
	onDelete: () => void;
}
