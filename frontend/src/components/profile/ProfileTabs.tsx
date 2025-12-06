interface ProfileTabsProps {
	activeTab: "blogs" | "reviews" | "projects";
	onTabChange: (tab: "blogs" | "reviews" | "projects") => void;
}

export default function ProfileTabs({
	activeTab,
	onTabChange,
}: ProfileTabsProps) {
	return (
		<div className="flex w-full mb-6 border-b border-white/10">
			<button
				className={`
					bg-transparent border-none px-4 py-3 font-[BentonSansRegular] text-base cursor-pointer 
					transition-all duration-200 relative whitespace-nowrap
					hover:text-white hover:bg-white/5
					${
						activeTab === "blogs"
							? "text-white font-[BentonSansBold] after:content-[''] after:absolute after:-bottom-px after:left-0 after:w-full after:h-0.5 after:bg-[#ec1d24] after:rounded-t"
							: "text-white/70"
					}
				`}
				onClick={() => onTabChange("blogs")}
				type="button"
			>
				Liked Blogs
			</button>
			<button
				className={`
					bg-transparent border-none px-4 py-3 font-[BentonSansRegular] text-base cursor-pointer 
					transition-all duration-200 relative whitespace-nowrap
					hover:text-white hover:bg-white/5
					${
						activeTab === "reviews"
							? "text-white font-[BentonSansBold] after:content-[''] after:absolute after:-bottom-px after:left-0 after:w-full after:h-0.5 after:bg-[#ec1d24] after:rounded-t"
							: "text-white/70"
					}
				`}
				onClick={() => onTabChange("reviews")}
				type="button"
			>
				Liked Reviews
			</button>
			<button
				className={`
					bg-transparent border-none px-4 py-3 font-[BentonSansRegular] text-base cursor-pointer 
					transition-all duration-200 relative whitespace-nowrap
					hover:text-white hover:bg-white/5
					${
						activeTab === "projects"
							? "text-white font-[BentonSansBold] after:content-[''] after:absolute after:-bottom-px after:left-0 after:w-full after:h-0.5 after:bg-[#ec1d24] after:rounded-t"
							: "text-white/70"
					}
				`}
				onClick={() => onTabChange("projects")}
				type="button"
			>
				Liked Projects
			</button>
		</div>
	);
}
