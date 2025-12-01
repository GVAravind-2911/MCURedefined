"use client";

import type React from "react";
import { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import type { BlogList } from "@/types/BlogTypes";

interface ProfileBlogContextType {
	blogs: BlogList[];
	totalPages: number;
	tags: string[];
	authors: string[];
	setBlogs: React.Dispatch<React.SetStateAction<BlogList[]>>;
	setTotalPages: React.Dispatch<React.SetStateAction<number>>;
}

const BlogContext = createContext<ProfileBlogContextType | null>(null);

export const BlogProvider = ({
	initialBlogs,
	initialTotalPages,
	initialTags,
	initialAuthors,
	children,
}: {
	initialBlogs: BlogList[];
	initialTotalPages: number;
	initialTags: string[];
	initialAuthors: string[];
	children: ReactNode;
}) => {
	const [blogs, setBlogs] = useState(initialBlogs);
	const [totalPages, setTotalPages] = useState(initialTotalPages);

	// Memoize context value to prevent unnecessary re-renders
	const value = useMemo(() => ({
		blogs,
		totalPages,
		tags: initialTags,
		authors: initialAuthors,
		setBlogs,
		setTotalPages,
	}), [blogs, totalPages, initialTags, initialAuthors]);

	return (
		<BlogContext.Provider value={value}>
			{children}
		</BlogContext.Provider>
	);
};

export const useBlogContext = () => {
	const context = useContext(BlogContext);
	if (!context) {
		throw new Error("useBlogContext must be used within a BlogProvider");
	}
	return context;
};
