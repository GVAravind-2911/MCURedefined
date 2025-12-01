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
		<div className="projects-section">
			<div className="search-filters">
				<div className="search-bar">
					<input
						type="text"
						placeholder="Search your liked projects..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="search-input"
						aria-label="Search projects"
					/>
					<svg
						className="search-icon"
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
					<div key={`phase-${phase}`} className="phase-section">
						<div className="section-title">
							<span className="title-text">Phase {phase}</span>
							<div className="title-line" />
						</div>

						<div className="projects-grid">
							{projectsByPhase[phase].map((project) => (
								<Link
									href={`/release-slate/${project.id}`}
									className="project-card"
									key={project.id}
								>
									<div className="project-poster-container">
										<Image
											src={formatPosterPath(project.posterpath, project.phase)}
											alt={`${project.name} - Phase ${project.phase}`}
											className="project-poster"
											width={200}
											height={300}
											style={{ objectFit: "cover" }}
										/>
										<div className="poster-overlay">
											<div className="project-phase-badge">
												Phase {project.phase}
											</div>
										</div>
									</div>
									<div className="project-info">
										<h2 className="project-title">{project.name}</h2>
									</div>
								</Link>
							))}
						</div>
					</div>
				))
			) : (
				<div className="no-results">
					<div className="no-results-content">
						<h3>No projects found matching &quot;{searchQuery}&quot;</h3>
						{searchQuery && (
							<button
								className="reset-button"
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
