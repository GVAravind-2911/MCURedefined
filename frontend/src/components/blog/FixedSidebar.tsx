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
		<div 
			className="text-[azure] w-[22%] mr-[3%] flex flex-col gap-[1%] fixed right-[3%] top-[120px] max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-[#ec1d24] scrollbar-track-[rgba(40,40,40,0.3)] pr-2.5 z-100 max-md:static max-md:transform-none! max-md:w-[90%]! max-md:max-h-none! max-md:mx-auto! max-md:my-10! max-md:pr-0 max-md:z-auto!" 
			ref={sidebarRef}
		>
			<h2 className="font-[BentonSansBold] text-[#ec1d24] text-center my-4 sticky top-0 bg-black py-1.5 z-2">Latest {isReview ? "Reviews" : "Blogs"}</h2>
			<hr className="h-0.5 w-full bg-[rgb(72,72,72)] m-0 border-0" />
			{latestBlogs.map((article, index) => (
				<React.Fragment key={article.id}>
					<SimilarBlog articles={article} />
					{index < latestBlogs.length - 1 && <hr className="h-0.5 w-full bg-[rgb(72,72,72)] m-0 border-0" />}
				</React.Fragment>
			))}
		</div>
	);
};

export default FixedSidebar;
