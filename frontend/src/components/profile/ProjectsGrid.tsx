"use client";

import type { Project } from "@/types/ProjectTypes";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";

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
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full mb-6">
				<div className="flex items-center bg-white/10 rounded-lg px-4 transition-all duration-300 border border-white/10 focus-within:bg-white/15 focus-within:border-[#ec1d24]/50 focus-within:shadow-[0_0_0_2px_rgba(236,29,36,0.25)]">
					<input
						type="text"
						placeholder="Search your liked projects..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full bg-transparent border-none py-3 text-white font-[BentonSansRegular] text-base placeholder:text-white/50 focus:outline-none"
						aria-label="Search projects"
					/>
					<svg
						className="w-5 h-5 text-white/50 ml-2"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="20"
						height="20"
					>
						<title>Search</title>
						<path
							fill="currentColor"
							d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
						/>
					</svg>
				</div>
			</div>

			{visiblePhases.length > 0 ? (
				visiblePhases.map((phase) => (
					<div key={`phase-${phase}`} className="mb-12">
						{/* Section title */}
						<div className="flex items-center mb-6 font-[BentonSansBold] text-white">
							<span className="text-[28px] max-[480px]:text-[22px] mr-4 whitespace-nowrap">
								Phase {phase}
							</span>
							<div className="grow h-[3px] bg-linear-to-r from-[#ec1d24] to-transparent" />
						</div>

						{/* Projects grid */}
						<div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] max-lg:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] max-md:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] max-[480px]:grid-cols-2 gap-5 max-md:gap-4 max-[480px]:gap-2.5 justify-center">
							{projectsByPhase[phase].map((project) => (
								<Link
									href={`/release-slate/${project.id}`}
									className="group bg-white/3 rounded-[10px] overflow-hidden shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-300 no-underline flex flex-col h-full hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:bg-white/5"
									key={project.id}
								>
									{/* Poster container */}
									<div className="relative w-full overflow-hidden rounded-t-lg">
										<Image
											src={formatPosterPath(project.posterpath, project.phase)}
											alt={`${project.name} - Phase ${project.phase}`}
											className="w-full aspect-2/3 object-cover transition-transform duration-400 group-hover:scale-105"
											width={200}
											height={300}
											style={{ objectFit: "cover" }}
										/>
										{/* Poster overlay */}
										<div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/80 flex flex-col justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
											<div className="absolute top-2.5 right-2.5 bg-[#ec1d24] text-white py-1 px-2.5 rounded font-[BentonSansRegular] text-xs font-bold">
												Phase {project.phase}
											</div>
										</div>
									</div>
									{/* Project info */}
									<div className="p-4 max-[480px]:p-2.5 text-center">
										<h2 className="text-white font-[BentonSansBold] text-lg max-lg:text-base max-[480px]:text-sm m-0 transition-colors duration-300 group-hover:text-[#ec1d24]">
											{project.name}
										</h2>
									</div>
								</Link>
							))}
						</div>
					</div>
				))
			) : (
				<div className="flex flex-col items-center p-12 bg-white/3 rounded-lg my-4">
					<div className="text-center">
						<h3 className="text-white/70 font-[BentonSansRegular] text-lg mb-4">
							No projects found matching &quot;{searchQuery}&quot;
						</h3>
						{searchQuery && (
							<button
								className="bg-transparent border border-white/30 text-white py-2 px-4 rounded-md font-[BentonSansRegular] text-sm cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-white/50"
								onClick={() => setSearchQuery("")}
								type="button"
							>
								Clear search
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
