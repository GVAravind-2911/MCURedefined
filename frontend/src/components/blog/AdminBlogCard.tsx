import React from "react";
import Image from "next/image";
import moment from "moment";
import type { BlogList } from "@/types/BlogTypes";
import { Calendar, Clock, User, Pencil, Trash2 } from "lucide-react";

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
className="group relative flex flex-col sm:flex-row w-full bg-white/2 rounded-xl sm:rounded-2xl transition-all duration-300 no-underline overflow-hidden border border-white/5 hover:border-white/10 hover:bg-white/4 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
			onClick={(e) => handleNavigation(e, blog.id)}
		>
			{/* Admin Action Buttons */}
			<div className="absolute top-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-10">
				<button
					className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/80 backdrop-blur-sm border border-white/10 text-white cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-blue-500/80 hover:border-blue-400/50"
					type="button"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						handleEdit(blog.id);
					}}
					aria-label="Edit blog post"
					title="Edit blog post"
				>
					<Pencil className="w-4 h-4" />
				</button>
				<button
					type="button"
					className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/80 backdrop-blur-sm border border-white/10 text-white cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-red-500/80 hover:border-red-400/50"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						handleDelete(blog.id, blog.title);
					}}
					aria-label="Delete blog post"
					title="Delete blog post"
				>
					<Trash2 className="w-4 h-4" />
				</button>
			</div>

			{/* Thumbnail Section */}
			<div className="relative w-full sm:w-56 md:w-64 lg:w-72 h-48 sm:h-auto sm:min-h-[200px] shrink-0 overflow-hidden bg-black/30">
				<Image
					src={blog.thumbnail_path.link}
					fill
					sizes="(max-width: 640px) 100vw, 288px"
					alt={blog.title}
					className="object-cover transition-transform duration-500 group-hover:scale-105"
				/>
				{/* Gradient Overlay */}
				<div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent sm:bg-linear-to-r sm:from-transparent sm:via-transparent sm:to-black/20" />
				
				{/* Mobile Date Badge */}
				<div className="absolute bottom-3 left-3 sm:hidden flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full">
					<Calendar className="w-3 h-3 text-[#ec1d24]" />
					<span className="text-xs text-white/90 font-[BentonSansRegular]">
						{moment(blog.created_at).format("MMM D, YYYY")}
					</span>
				</div>
			</div>

			{/* Content Section */}
			<div className="flex-1 p-4 sm:p-5 md:p-6 flex flex-col min-w-0">
				{/* Tags */}
				{blog.tags && blog.tags.length > 0 && (
					<div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
						{blog.tags.slice(0, 3).map((tag) => (
							<button
								key={`${blog.id}-${tag}`}
								className="bg-[#ec1d24]/10 text-[#ec1d24] text-[10px] sm:text-xs py-1 px-2.5 sm:px-3 rounded-full cursor-pointer transition-all duration-200 border border-[#ec1d24]/20 font-[BentonSansRegular] hover:bg-[#ec1d24]/20 hover:border-[#ec1d24]/40 active:scale-95"
								onClick={(e) => handleTagClick(e, tag)}
								type="button"
								aria-label={`Filter by tag: ${tag}`}
							>
								<span className="opacity-60">#</span>{tag}
							</button>
						))}
						{blog.tags.length > 3 && (
							<span className="text-[10px] sm:text-xs py-1 px-2 text-white/40 font-[BentonSansRegular] self-center">
								+{blog.tags.length - 3}
							</span>
						)}
					</div>
				)}

				{/* Title */}
				<h2 className="font-[BentonSansBold] text-lg sm:text-xl md:text-2xl text-white leading-snug line-clamp-2 mb-2 sm:mb-3 group-hover:text-[#ec1d24] transition-colors duration-300">
					{blog.title}
				</h2>

				{/* Description */}
				<p className="text-sm sm:text-[15px] leading-relaxed text-white/50 mb-4 font-[BentonSansRegular] line-clamp-2 sm:line-clamp-3 flex-1">
					{blog.description}
				</p>

				{/* Meta Info */}
				<div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3 border-t border-white/5">
					{/* Author */}
					<div className="flex items-center gap-1.5 text-white/60">
						<User className="w-3.5 h-3.5 text-[#ec1d24]" />
						<span className="text-xs sm:text-sm font-[BentonSansRegular]">
							{blog.author}
						</span>
					</div>

					<span className="hidden sm:block w-px h-4 bg-white/20" />

					{/* Date */}
					<div className="hidden sm:flex items-center gap-1.5 text-white/50">
						<Calendar className="w-3.5 h-3.5" />
						<span className="text-xs sm:text-sm font-[BentonSansRegular]">
							{moment(blog.created_at).format("MMM D, YYYY")}
						</span>
					</div>

					{blog.updated_at && (
						<>
							<span className="hidden sm:block w-px h-4 bg-white/20" />
							<div className="flex items-center gap-1.5 text-[#ec1d24]/60">
								<Clock className="w-3.5 h-3.5" />
								<span className="text-xs font-[BentonSansRegular]">
									Updated {moment(blog.updated_at).format("MMM D")}
								</span>
							</div>
						</>
					)}
				</div>
			</div>
		</a>
	);
};

export default React.memo(AdminBlogCard);
