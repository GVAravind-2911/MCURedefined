import { memo } from "react";
import type React from "react";
import Image from "next/image";
import moment from "moment";
import type { BlogList } from "@/types/BlogTypes";

interface BlogCardProps {
	blog: BlogList;
	path: string;
	handleNavigation: (
		e: React.MouseEvent<HTMLAnchorElement>,
		id: number,
	) => void;
	handleTagClick: (e: React.MouseEvent<HTMLButtonElement>, tag: string) => void;
}

const BlogCard = ({
	blog,
	path,
	handleNavigation,
	handleTagClick,
}: BlogCardProps) => {
	return (
		<a
			href={`/${path}/${blog.id}`}
			className="group flex flex-col md:flex-row w-full p-3 md:p-5 my-2.5 bg-white/3 rounded-xl transition-all duration-300 no-underline overflow-hidden shadow-[0_4px_6px_rgba(0,0,0,0.1)] hover:bg-white/5 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
			onClick={(e) => handleNavigation(e, blog.id)}
		>
			<div className="w-full md:w-60 h-[180px] md:h-[180px] mb-4 md:mb-0 rounded-lg overflow-hidden shrink-0 relative bg-[#111]">
				<Image
					src={blog.thumbnail_path.link}
					width={400}
					height={250}
					alt={blog.title}
					className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
				/>
			</div>
			<div className="grow p-0 md:pl-5 flex flex-col">
				<h2 className="font-[BentonSansBold] text-lg md:text-2xl m-0 mb-2 md:mb-3 text-white leading-[1.3]">{blog.title}</h2>
				<div className="mb-2 md:mb-3 flex flex-col md:flex-row flex-wrap gap-2 md:gap-4">
					<p className="text-sm m-0 text-[#ec1d24] font-[BentonSansRegular]">By: {blog.author}</p>
					<p className="text-sm m-0 text-white/60 font-[BentonSansRegular]">
						Posted: {moment(blog.created_at).format("MMM D, YYYY")}
					</p>
					{blog.updated_at && (
						<p className="text-sm m-0 text-[#ec1d24]/80 font-[BentonSansRegular]">
							Updated: {moment(blog.updated_at).format("MMM D, YYYY")}
						</p>
					)}
				</div>
				<p className="text-sm md:text-base leading-relaxed text-white/80 m-0 mb-auto font-[BentonSansRegular]">{blog.description}</p>
				{blog.tags && blog.tags.length > 0 && (
					<div className="flex flex-wrap gap-2 mt-3 md:mt-4">
						{blog.tags.map((tag) => (
							<button
								key={`${blog.id}-${tag}`}
								className="bg-transparent text-[#ec1d24] text-[13px] py-1.5 px-3 rounded-2xl cursor-pointer transition-all duration-200 border border-[#ec1d24]/50 font-[BentonSansRegular] before:content-['#'] hover:bg-[#ec1d24]/10 hover:border-[#ec1d24]/80"
								onClick={(e) => handleTagClick(e, tag)}
								type="button"
								aria-label={`Filter by tag: ${tag}`}
							>
								{tag}
							</button>
						))}
					</div>
				)}
			</div>
		</a>
	);
};

export default memo(BlogCard);
