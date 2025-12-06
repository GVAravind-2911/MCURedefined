import { memo } from "react";
import Image from "next/image";
import type { JSX } from "react";
import type { Article } from "@/types/BlogTypes";
import moment from "moment";
import Link from "next/link";
import { Calendar, User } from "lucide-react";

interface SimilarBlogProps {
	articles: Article;
	isReview?: boolean;
}

const SimilarBlog = ({
	articles,
	isReview = false,
}: SimilarBlogProps): JSX.Element => {
	// Determine if this is a blog or review based on URL structure or prop
	const contentType =
		isReview || articles.id.toString().startsWith("r-") ? "reviews" : "blogs";
	const contentId = articles.id.toString().startsWith("r-")
		? articles.id.toString().substring(2)
		: articles.id;

	// Format date to be more readable
	const formattedDate = moment(articles.created_at).format("MMM D, YYYY");

	return (
		<Link
			href={`/${contentType}/${contentId}`}
			className="group flex gap-4 p-4 transition-all duration-300 hover:bg-white/3 no-underline"
		>
			{/* Thumbnail */}
			<div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-black/30 ring-1 ring-white/5 group-hover:ring-[#ec1d24]/30 transition-all">
				<Image
					className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
					src={articles.thumbnail_path.link}
					alt={articles.title}
					width={96}
					height={96}
					style={{ objectFit: "cover" }}
				/>
				{/* Hover Overlay */}
				<div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
			</div>

			{/* Content */}
			<div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
				{/* Title */}
				<h3 className="text-sm sm:text-[15px] font-[BentonSansBold] text-white/90 line-clamp-2 leading-snug mb-2 group-hover:text-[#ec1d24] transition-colors duration-200">
					{articles.title}
				</h3>

				{/* Meta Info */}
				<div className="flex flex-col gap-1">
					{/* Author */}
					<div className="flex items-center gap-1.5 text-white/50">
						<User className="w-3 h-3" />
						<span className="text-xs font-[BentonSansRegular] truncate">
							{articles.author}
						</span>
					</div>

					{/* Date */}
					<div className="flex items-center gap-1.5 text-white/40">
						<Calendar className="w-3 h-3" />
						<span className="text-xs font-[BentonSansRegular]">
							{formattedDate}
						</span>
					</div>
				</div>
			</div>
		</Link>
	);
};

export default memo(SimilarBlog);
