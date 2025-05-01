"use client";

import dynamic from "next/dynamic";

// Dynamically import the CommentSection component with client-side rendering only
const CommentSection = dynamic(() => import("./CommentSection"), {
	ssr: false,
});

// Re-export with the same interface
export default CommentSection;
