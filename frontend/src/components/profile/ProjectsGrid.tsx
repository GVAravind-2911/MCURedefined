"use client";

import type { Project } from "@/types/ProjectTypes";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, Film } from "lucide-react";

const formatPosterPath = (path: string, phase: number): string => {
	// Extract filename from path
	const filename = path.split("/").pop();
	// Return path pointing to public/images/Posters/Phase directory
	return `/images/Posters/Phase${phase}/${filename}`;
};

interface ProjectsGridProps {
	projects: Project[];
}

export default function ProjectsGrid({ projects }: ProjectsGridProps) {
	const [searchQuery, setSearchQuery] = useState("");

	// Debounce search query for 300ms to reduce filtering operations
	const debouncedSearchQuery = useDebounce(searchQuery, 300);

	// Filter projects based on debounced search query
	const filteredProjects = useMemo(() => {
		if (!Array.isArray(projects)) return [];
		return projects.filter((project) =>
			project.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
		);
	}, [projects, debouncedSearchQuery]);

	// Group filtered projects by phase
	const projectsByPhase = useMemo(() => {
		if (!Array.isArray(projects)) return {};

		return filteredProjects.reduce(
			(acc, project) => {
				if (!acc[project.phase]) {
					acc[project.phase] = [];
				}
				acc[project.phase].push(project);
				return acc;
			},
			{} as Record<number, Project[]>,
		);
	}, [filteredProjects, projects]);

	// Get phases that have projects
	const visiblePhases = useMemo(() => {
		return Object.keys(projectsByPhase)
			.map(Number)
			.sort((a, b) => a - b);
	}, [projectsByPhase]);

	return (
		<div className="w-full">
			{/* Search filters */}
			<div className="mb-8">
				<div className="relative max-w-md">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
					<input
						type="text"
						placeholder="Search your liked projects..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white font-[BentonSansRegular] text-base placeholder:text-white/40 focus:outline-none focus:border-[#ec1d24]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#ec1d24]/20 transition-all duration-300"
						aria-label="Search projects"
					/>
				</div>
			</div>

			{visiblePhases.length > 0 ? (
				visiblePhases.map((phase) => (
					<div key={`phase-${phase}`} className="mb-12">
						{/* Section title */}
						<div className="flex items-center gap-4 mb-6">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-[#ec1d24]/20 flex items-center justify-center">
									<Film className="w-5 h-5 text-[#ec1d24]" />
								</div>
								<h2 className="text-xl sm:text-2xl font-[BentonSansBold] text-white">
									Phase {phase}
								</h2>
							</div>
							<div className="flex-1 h-px bg-linear-to-r from-[#ec1d24]/50 to-transparent" />
							<span className="text-sm text-white/40 font-[BentonSansRegular]">
								{projectsByPhase[phase].length}{" "}
								{projectsByPhase[phase].length === 1 ? "project" : "projects"}
							</span>
						</div>

						{/* Projects grid */}
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
							{projectsByPhase[phase].map((project) => (
								<Link
									href={`/release-slate/${project.id}`}
									className="group relative bg-white/2 rounded-xl overflow-hidden border border-white/5 transition-all duration-300 no-underline flex flex-col hover:-translate-y-1 hover:border-[#ec1d24]/30 hover:shadow-xl hover:shadow-[#ec1d24]/10"
									key={project.id}
								>
									{/* Poster container */}
									<div className="relative w-full overflow-hidden">
										<Image
											src={formatPosterPath(project.posterpath, project.phase)}
											alt={`${project.name} - Phase ${project.phase}`}
											className="w-full aspect-2/3 object-cover transition-transform duration-500 group-hover:scale-110"
											width={200}
											height={300}
											style={{ objectFit: "cover" }}
										/>
										{/* Hover overlay */}
										<div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
										{/* Phase badge */}
										<div className="absolute top-2 right-2 bg-[#ec1d24]/90 backdrop-blur-sm text-white py-1 px-2.5 rounded-lg font-[BentonSansBold] text-xs shadow-lg">
											Phase {project.phase}
										</div>
										{/* View indicator on hover */}
										<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
											<span className="text-xs font-[BentonSansBold] text-white">
												View Details
											</span>
										</div>
									</div>
									{/* Project info */}
									<div className="p-3 sm:p-4 text-center">
										<h3 className="text-white font-[BentonSansBold] text-sm sm:text-base leading-tight transition-colors duration-300 group-hover:text-[#ec1d24] line-clamp-2">
											{project.name}
										</h3>
									</div>
								</Link>
							))}
						</div>
					</div>
				))
			) : (
				<div className="flex flex-col items-center p-10 sm:p-16 bg-white/2 rounded-2xl border border-white/5">
					<Search className="w-12 h-12 text-white/20 mb-4" />
					<p className="text-white/70 font-[BentonSansRegular] text-lg mb-2 text-center">
						No projects found matching &quot;{searchQuery}&quot;
					</p>
					<p className="text-white/40 font-[BentonSansRegular] text-sm mb-6 text-center">
						Try adjusting your search
					</p>
					{searchQuery && (
						<button
							className="bg-white/5 border border-white/20 text-white py-2.5 px-5 rounded-xl font-[BentonSansRegular] text-sm cursor-pointer transition-all duration-300 hover:bg-[#ec1d24]/20 hover:border-[#ec1d24]/50 hover:text-white"
							onClick={() => setSearchQuery("")}
							type="button"
						>
							Clear search
						</button>
					)}
				</div>
			)}
		</div>
	);
}
