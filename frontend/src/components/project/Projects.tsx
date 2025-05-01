"use client";

import type { Project } from "@/types/ProjectTypes";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import "@/styles/projectsenhanced.css";

const formatPosterPath = (path: string, phase: number): string => {
	// Extract filename from static/img/posters/name.extension
	const filename = path.split("/").pop();
	// Return path pointing to public/images/Posters/Phase{phase} directory
	return `/images/Posters/Phase${phase}/${filename}`;
};

interface ProjectsPageProps {
	projects: Project[];
}

export default function ProjectsPage({ projects }: ProjectsPageProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedPhase, setSelectedPhase] = useState<number | null>(null);

	// Data validation check - don't use conditional hooks
	const isValidArray = Array.isArray(projects);

	// All useMemo hooks are now called unconditionally
	// Get all available phases
	const allPhases = useMemo(() => {
		if (!isValidArray) return [];
		return [...new Set(projects.map((project) => project.phase))].sort();
	}, [projects, isValidArray]);

	// Filter projects based on search query and selected phase
	const filteredProjects = useMemo(() => {
		if (!isValidArray) return [];
		return projects.filter((project) => {
			const matchesSearch = project.name
				.toLowerCase()
				.includes(searchQuery.toLowerCase());
			const matchesPhase =
				selectedPhase === null || project.phase === selectedPhase;
			return matchesSearch && matchesPhase;
		});
	}, [projects, searchQuery, selectedPhase, isValidArray]);

	// Group filtered projects by phase
	const projectsByPhase = useMemo(() => {
		if (!isValidArray) return {};
		return filteredProjects.reduce(
			(acc, project) => {
				// Initialize the phase array if it doesn't exist
				if (!acc[project.phase]) {
					acc[project.phase] = [];
				}
				// Add the project to its phase array
				acc[project.phase].push(project);
				return acc;
			},
			{} as Record<number, Project[]>,
		);
	}, [filteredProjects, isValidArray]);

	// Get all phases that have projects after filtering
	const visiblePhases = useMemo(() => {
		if (!isValidArray) return [];
		return Object.keys(projectsByPhase)
			.map(Number)
			.sort((a, b) => a - b);
	}, [projectsByPhase, isValidArray]);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const handlePhaseChange = (phase: number | null) => {
		setSelectedPhase(phase === selectedPhase ? null : phase);
	};

	// Error state display if projects is not an array
	if (!isValidArray) {
		console.error("Projects is not an array:", projects);
		return <div>Error loading projects</div>;
	}

	return (
		<div className="projects-page fade-in">
			<div className="project-hero">
				<div className="hero-overlay" />
				<div className="hero-content">
					<h1 className="hero-title">MCU Timeline</h1>
					<p className="hero-description">
						Explore the Marvel Cinematic Universe films and shows across
						different phases. From the genesis of Iron Man to the latest
						adventures in the multiverse saga.
					</p>
				</div>
			</div>

			<div className="projects-search-container">
				<div className="search-filters">
					<div className="search-bar">
						<input
							type="text"
							placeholder="Search projects..."
							value={searchQuery}
							onChange={handleSearchChange}
							className="search-input"
							aria-label="Search projects"
						/>
						<svg
							className="search-icon"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
						>
							<title>Search</title>
							<path
								fill="currentColor"
								d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
							/>
						</svg>
					</div>

					<div className="phase-filters">
						<button
							className={`phase-filter-button ${selectedPhase === null ? "active" : ""}`}
							onClick={() => handlePhaseChange(null)}
							type="button"
							aria-label="All Phases"
						>
							All Phases
						</button>
						{allPhases.map((phase) => (
							<button
								key={`filter-phase-${phase}`}
								className={`phase-filter-button ${selectedPhase === phase ? "active" : ""}`}
								onClick={() => handlePhaseChange(phase)}
								type="button"
								aria-label={`Phase ${phase}`}
							>
								Phase {phase}
							</button>
						))}
					</div>
				</div>

				{searchQuery && filteredProjects.length === 0 && (
					<div className="no-results">
						<p>No projects found matching &quot;{searchQuery}&quot;</p>
						{selectedPhase !== null && (
							<button
								className="clear-filter-button"
								onClick={() => setSelectedPhase(null)}
								type="button"
							>
								Clear phase filter
							</button>
						)}
					</div>
				)}
			</div>

			<div className="projects-container">
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
												src={formatPosterPath(
													project.posterpath,
													project.phase,
												)}
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
						<p>No projects found</p>
						<button
							className="clear-filters-button"
							onClick={() => {
								setSearchQuery("");
								setSelectedPhase(null);
							}}
							type="button"
							aria-label="Clear all filters"
						>
							Clear all filters
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
