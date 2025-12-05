"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Article } from "@/types/BlogTypes";
import SimilarBlog from "./SimilarBlog";
import { TrendingUp } from "lucide-react";

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
			setIsMobile(window.innerWidth < 1024);
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

	if (!latestBlogs || latestBlogs.length === 0) {
		return null;
	}

	return (
		<aside 
			className="w-full lg:w-[340px] xl:w-[380px] lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-120px)] transition-transform duration-300 ease-out" 
			ref={sidebarRef}
		>
			<div className="bg-white/2 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden shadow-xl">
				{/* Header */}
				<div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-linear-to-r from-[#ec1d24]/10 to-transparent">
					<div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#ec1d24]/20">
						<TrendingUp className="w-5 h-5 text-[#ec1d24]" />
					</div>
					<div>
						<h2 className="font-[BentonSansBold] text-white text-base">
							Latest {isReview ? "Reviews" : "Blogs"}
						</h2>
						<p className="text-xs text-white/50 font-[BentonSansRegular]">
							Don't miss these reads
						</p>
					</div>
				</div>

				{/* Scrollable Content */}
				<div className="overflow-y-auto max-h-[calc(100vh-220px)] lg:max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
					<div className="divide-y divide-white/5">
						{latestBlogs.map((article) => (
							<SimilarBlog key={article.id} articles={article} isReview={isReview} />
						))}
					</div>
				</div>

				{/* Footer Link */}
				<div className="px-5 py-3 border-t border-white/5 bg-white/1">
					<a 
						href={isReview ? "/reviews" : "/blogs"}
						className="flex items-center justify-center gap-2 text-sm text-[#ec1d24] font-[BentonSansRegular] hover:text-[#ff3d44] transition-colors group"
					>
						<span>View all {isReview ? "reviews" : "blogs"}</span>
						<svg 
							className="w-4 h-4 transition-transform group-hover:translate-x-1" 
							fill="none" 
							viewBox="0 0 24 24" 
							stroke="currentColor"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</a>
				</div>
			</div>
		</aside>
	);
};

export default FixedSidebar;
