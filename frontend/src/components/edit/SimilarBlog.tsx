import Image from "next/image";
import type { JSX } from "react";
import "@/styles/similararticle.css";
import type { Article } from "@/types/BlogTypes";

interface SimilarBlogProps {
	articles: Article;
}

const SimilarBlog = ({ articles }: SimilarBlogProps): JSX.Element => (
	<div className="similar-blogs">
		<div className="thumbnail">
			<Image
				className="similarimage"
				src={articles.thumbnail_path.link}
				alt="thumbnail"
				width={100}
				height={80}
			/>
		</div>
		<a href={`/blogs/${articles.id}`} className="similardesc">
			<div className="similartitle">{articles.title}</div>
			<div className="similarauthor">{articles.author}</div>
			<div className="similardate">{articles.created_at}</div>
		</a>
	</div>
);

export default SimilarBlog;
