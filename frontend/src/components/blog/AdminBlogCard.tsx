import React from "react";
import Image from "next/image";
import moment from "moment";
import type { BlogList } from "@/types/BlogTypes";

interface AdminBlogCardProps {
	blog: BlogList;
	path: string;
	handleNavigation: (
		e: React.MouseEvent<HTMLAnchorElement>,
		id: number,
	) => void;
	handleTagClick: (e: React.MouseEvent<HTMLButtonElement>, tag: string) => void;
	handleEdit: (id: number) => void;
	handleDelete: (id: number, title: string) => void;
}

const AdminBlogCard: React.FC<AdminBlogCardProps> = ({
	blog,
	path,
	handleNavigation,
	handleTagClick,
	handleEdit,
	handleDelete,
}) => {
	return (
		<a
			href={`/${path}/${blog.id}`}
			className="blog-card"
			onClick={(e) => handleNavigation(e, blog.id)}
		>
			<div className="edit-actions">
				<button
					className="edit-action-button edit"
					type="button"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						handleEdit(blog.id);
					}}
					aria-label="Edit blog post"
					title="Edit blog post"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="18"
						height="18"
					>
						<title>Edit</title>
						<path
							fill="currentColor"
							d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
						/>
					</svg>
				</button>
				<button
					type="button"
					className="edit-action-button delete"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						handleDelete(blog.id, blog.title);
					}}
					aria-label="Delete blog post"
					title="Delete blog post"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="18"
						height="18"
					>
						<title>Delete</title>
						<path
							fill="currentColor"
							d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
						/>
					</svg>
				</button>
			</div>

			<div className="blog-card-image">
				<Image
					src={blog.thumbnail_path.link}
					width={400}
					height={250}
					alt={blog.title}
					className="blog-thumbnail"
				/>
			</div>
			<div className="blog-card-content">
				<h2 className="blog-title">{blog.title}</h2>
				<div className="blog-meta">
					<p className="blog-author">By: {blog.author}</p>
					<p className="blog-date">
						Posted: {moment(blog.created_at).format("MMM D, YYYY")}
					</p>
					{blog.updated_at && (
						<p className="blog-date updated">
							Updated: {moment(blog.updated_at).format("MMM D, YYYY")}
						</p>
					)}
				</div>
				<p className="blog-description">{blog.description}</p>
				{blog.tags && blog.tags.length > 0 && (
					<div className="blog-tags">
						{blog.tags.map((tag) => (
							<button
								key={`${blog.id}-${tag}`}
								className="blog-tag"
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

export default React.memo(AdminBlogCard);
