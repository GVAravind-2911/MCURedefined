"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Article } from "@/types/BlogTypes";
import SimilarBlog from "./SimilarBlog";

interface FixedSidebarProps {
	latestBlogs: Article[];
	isReview: boolean;
}

const FixedSidebar: React.FC<FixedSidebarProps> = ({
	latestBlogs,
	isReview,
}) => {
	const sidebarRef = useRef<HTMLDivElement>(null);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	useEffect(() => {
		if (isMobile || !sidebarRef.current) return;

		const checkFooterVisibility = () => {
			const sidebar = sidebarRef.current;
			if (!sidebar) return;

			const footer = document.querySelector("footer");
			if (footer) {
				const footerTop = footer.getBoundingClientRect().top;
				const viewportHeight = window.innerHeight;

				if (footerTop < viewportHeight) {
					const overlap = viewportHeight - footerTop;
					sidebar.style.transform = `translateY(-${overlap + 20}px)`;
				} else {
					sidebar.style.transform = "translateY(0)";
				}
			}
		};

		checkFooterVisibility();
		window.addEventListener("scroll", checkFooterVisibility);
		window.addEventListener("resize", checkFooterVisibility);

		return () => {
			window.removeEventListener("scroll", checkFooterVisibility);
			window.removeEventListener("resize", checkFooterVisibility);
		};
	}, [isMobile]);

	// Determine if showing reviews or blogs based on first article's ID

	return (
		<div className="otherblogs" ref={sidebarRef}>
			<h2 className="latestblogs">Latest {isReview ? "Reviews" : "Blogs"}</h2>
			<hr className="separator" />
			{latestBlogs.map((article, index) => (
				<React.Fragment key={article.id}>
					<SimilarBlog articles={article} />
					{index < latestBlogs.length - 1 && <hr className="separator" />}
				</React.Fragment>
			))}
		</div>
	);
};

export default FixedSidebar;
