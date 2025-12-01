import { memo } from "react";
import Image from "next/image";
import type { JSX } from "react";
import "@/styles/similararticle.css";
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
		<div className="similar-blogs">
			<div className="thumbnail">
				<Image
					className="similarimage"
					src={articles.thumbnail_path.link}
					alt={articles.title}
					width={100}
					height={70}
					style={{ objectFit: "cover" }}
				/>
			</div>
			<Link href={`/${contentType}/${contentId}`} className="similardesc">
				<div className="similartitle">{articles.title}</div>
				<div className="similarinfo">
					<span className="similarauthor">{articles.author}</span>
					<span className="similardate">{formattedDate}</span>
				</div>
			</Link>
		</div>
	);
};

export default memo(SimilarBlog);
