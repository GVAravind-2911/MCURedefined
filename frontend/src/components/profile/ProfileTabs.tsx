interface ProfileTabsProps {
	activeTab: "blogs" | "reviews" | "projects";
	onTabChange: (tab: "blogs" | "reviews" | "projects") => void;
}

export default function ProfileTabs({
	activeTab,
	onTabChange,
}: ProfileTabsProps) {
	return (
		<div className="profile-tabs">
			<button
				className={`tab-button ${activeTab === "blogs" ? "active" : ""}`}
				onClick={() => onTabChange("blogs")}
				type="button"
			>
				Liked Blogs
			</button>
			<button
				className={`tab-button ${activeTab === "reviews" ? "active" : ""}`}
				onClick={() => onTabChange("reviews")}
				type="button"
			>
				Liked Reviews
			</button>
			<button
				className={`tab-button ${activeTab === "projects" ? "active" : ""}`}
				onClick={() => onTabChange("projects")}
				type="button"
			>
				Liked Projects
			</button>
		</div>
	);
}
