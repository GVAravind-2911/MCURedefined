import type React from "react";
import Image from "next/image";
import moment from "moment";
import type { BlogList } from "@/types/BlogTypes";

interface ProfileBlogCardProps {
  blog: BlogList;
  path: string;
  handleNavigation: (e: React.MouseEvent<HTMLAnchorElement>, id: number) => void;
  handleTagClick: (e: React.MouseEvent<HTMLButtonElement>, tag: string) => void;
}

const BlogCard = ({ blog, path, handleNavigation, handleTagClick }: ProfileBlogCardProps) => {
  return (
    <a
      href={`/${path}/${blog.id}`}
      className="blog-card"
      onClick={(e) => handleNavigation(e, blog.id)}
    >
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

export default BlogCard;