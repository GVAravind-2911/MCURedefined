import type React from "react";
import type { ReactNode } from "react";
import type { BlogList } from "@/types/BlogTypes";

export interface LayoutProps {
	children: ReactNode;
	isAuthPage?: boolean;
}

export interface SVGProps extends React.SVGProps<SVGSVGElement> {
	className?: string;
}

export interface TrefoilElement extends HTMLElement {
	size: string;
	stroke: string;
	"stroke-length": string;
	"bg-opacity": string;
	speed: string;
	color: string;
}

export interface BlogComponentProps {
	path: string;
	initialBlogs: BlogList[];
	totalPages: number;
	apiUrl: string;
}
