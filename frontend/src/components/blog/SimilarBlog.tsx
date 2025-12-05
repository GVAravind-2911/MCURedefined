import { memo } from "react";
import Image from "next/image";
import type { JSX } from "react";
import type { Article } from "@/types/BlogTypes";
import moment from "moment";
import Link from "next/link";

interface SimilarBlogProps {
	articles: Article;
}

const SimilarBlog = ({ articles }: SimilarBlogProps): JSX.Element => {
	// Determine if this is a blog or review based on URL structure
	const contentType = articles.id.toString().startsWith("r-")
		? "reviews"
		: "blogs";
	const contentId = articles.id.toString().startsWith("r-")
		? articles.id.toString().substring(2)
		: articles.id;

	// Format date to be more readable
	const formattedDate = moment(articles.created_at).format("MMM D, YYYY");

	return (
		<div className="group flex flex-row w-full max-w-full gap-3 max-md:gap-2 items-center py-3 px-1.5 max-md:py-2 max-md:px-0 transition-all duration-300 rounded-lg relative min-w-0 hover:bg-white/5 hover:-translate-y-0.5">
			<div className="shrink-0 w-1/4 max-md:w-[30%] max-[480px]:w-[35%] max-w-[100px] h-[70px] max-md:h-[60px] max-[480px]:h-[50px] rounded-md overflow-hidden relative bg-black/20 shadow-[0_3px_6px_rgba(0,0,0,0.2)]">
				<Image
					className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
					src={articles.thumbnail_path.link}
					alt={articles.title}
					width={100}
					height={70}
					style={{ objectFit: "cover" }}
				/>
			</div>
			<Link href={`/${contentType}/${contentId}`} className="flex flex-col justify-between grow no-underline py-0.5 min-h-[70px] gap-1 min-w-0">
				<div className="text-base max-md:text-sm max-[480px]:text-[13px] text-white font-[BentonSansBold] text-left line-clamp-2 overflow-hidden text-ellipsis mb-1.5 transition-colors duration-200 group-hover:text-[#ec1d24]">{articles.title}</div>
				<div className="flex justify-between items-center gap-2 w-full">
						<span className="text-[13px] max-md:text-xs max-[480px]:text-[11px] text-white/70 font-[BentonSansRegular] overflow-hidden text-ellipsis whitespace-nowrap shrink min-w-0">{articles.author}</span>
						<span className="text-xs max-md:text-[11px] max-[480px]:text-[10px] text-white/50 font-[BentonSansRegular] shrink-0">{formattedDate}</span>
				</div>
			</Link>
		</div>
	);
};

export default memo(SimilarBlog);
