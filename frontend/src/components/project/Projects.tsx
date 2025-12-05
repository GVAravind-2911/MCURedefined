"use client";

import type { Project } from "@/types/ProjectTypes";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";

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

	// Debounce search query for 300ms to reduce filtering operations
	const debouncedSearchQuery = useDebounce(searchQuery, 300);

	// Data validation check - don't use conditional hooks
	const isValidArray = Array.isArray(projects);

	// All useMemo hooks are now called unconditionally
	// Get all available phases
	const allPhases = useMemo(() => {
		if (!isValidArray) return [];
		return [...new Set(projects.map((project) => project.phase))].sort();
	}, [projects, isValidArray]);

	// Filter projects based on debounced search query and selected phase
	const filteredProjects = useMemo(() => {
		if (!isValidArray) return [];
		return projects.filter((project) => {
			const matchesSearch = project.name
				.toLowerCase()
				.includes(debouncedSearchQuery.toLowerCase());
			const matchesPhase =
				selectedPhase === null || project.phase === selectedPhase;
			return matchesSearch && matchesPhase;
		});
	}, [projects, debouncedSearchQuery, selectedPhase, isValidArray]);

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
		<div className="flex flex-col w-full items-center pb-12 animate-[fadeInSimple_0.5s_ease-in]">
			{/* Hero section */}
			<div className="relative w-[92%] h-[280px] max-md:h-[220px] bg-linear-to-r from-[#ec1d24]/80 to-black/80 bg-cover bg-center mb-8 flex items-center justify-center overflow-hidden rounded-lg">
				<div className="absolute inset-0 bg-linear-to-b from-black/70 to-black/90 z-1" />
				<div className="relative z-2 text-center px-4 max-w-[800px]">
					<h1 className="font-[BentonSansBold] text-[clamp(28px,5vw,48px)] max-md:text-2xl text-white mb-4 uppercase tracking-[1px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] after:content-[''] after:block after:w-20 after:h-1 after:bg-[#ec1d24] after:mx-auto after:mt-3">
						MCU Timeline
					</h1>
					<p className="font-[BentonSansRegular] text-[clamp(16px,2vw,18px)] max-md:text-sm text-white/80 max-w-[600px] mx-auto leading-relaxed">
						Explore the Marvel Cinematic Universe films and shows across
						different phases. From the genesis of Iron Man to the latest
						adventures in the multiverse saga.
					</p>
				</div>
			</div>

			{/* Search and filters */}
			<div className="w-[90%] max-w-[1200px] mx-auto mb-8">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full mb-6">
					{/* Search bar */}
					<div className="flex items-center bg-white/10 rounded-lg px-4 transition-all duration-300 border border-white/10 md:max-w-[350px] focus-within:bg-white/15 focus-within:border-[#ec1d24]/50 focus-within:shadow-[0_0_0_2px_rgba(236,29,36,0.25)]">
						<input
							type="text"
							placeholder="Search projects..."
							value={searchQuery}
							onChange={handleSearchChange}
							className="w-full bg-transparent border-none py-3 text-white font-[BentonSansRegular] text-base placeholder:text-white/50 focus:outline-none max-[480px]:text-sm"
							aria-label="Search projects"
						/>
						<svg
							className="w-6 h-6 text-white/50 ml-2"
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

					{/* Phase filters */}
					<div className="flex flex-wrap gap-2">
						<button
							className={`bg-white/10 border border-white/20 text-white py-2 px-4 rounded-md font-[BentonSansRegular] text-sm cursor-pointer transition-all duration-200 hover:bg-[#ec1d24]/30 hover:border-[#ec1d24]/50 max-[480px]:text-xs max-[480px]:py-1.5 max-[480px]:px-3 ${selectedPhase === null ? "bg-[#ec1d24]! border-[#ec1d24]!" : ""}`}
							onClick={() => handlePhaseChange(null)}
							type="button"
							aria-label="All Phases"
						>
							All Phases
						</button>
						{allPhases.map((phase) => (
							<button
								key={`filter-phase-${phase}`}
								className={`bg-white/10 border border-white/20 text-white py-2 px-4 rounded-md font-[BentonSansRegular] text-sm cursor-pointer transition-all duration-200 hover:bg-[#ec1d24]/30 hover:border-[#ec1d24]/50 max-[480px]:text-xs max-[480px]:py-1.5 max-[480px]:px-3 ${selectedPhase === phase ? "bg-[#ec1d24]! border-[#ec1d24]!" : ""}`}
								onClick={() => handlePhaseChange(phase)}
								type="button"
								aria-label={`Phase ${phase}`}
							>
								Phase {phase}
							</button>
						))}
					</div>
				</div>

				{/* No results state for search */}
				{searchQuery && filteredProjects.length === 0 && (
					<div className="flex flex-col items-center p-12 bg-white/3 rounded-lg my-4">
						<p className="text-white/70 font-[BentonSansRegular] text-lg mb-4">
							No projects found matching &quot;{searchQuery}&quot;
						</p>
						{selectedPhase !== null && (
							<button
								className="bg-transparent border border-white/30 text-white py-2 px-4 rounded-md font-[BentonSansRegular] text-sm cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-white/50"
								onClick={() => setSelectedPhase(null)}
								type="button"
							>
								Clear phase filter
							</button>
						)}
					</div>
				)}
			</div>

			{/* Projects container */}
			<div className="w-[90%] max-w-[1200px] mx-auto">
				{visiblePhases.length > 0 ? (
					visiblePhases.map((phase) => (
						<div key={`phase-${phase}`} className="mb-12">
							{/* Section title */}
							<div className="flex items-center mb-6 font-[BentonSansBold] text-white max-[480px]:mb-4">
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
												src={formatPosterPath(
													project.posterpath,
													project.phase,
												)}
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
						<p className="text-white/70 font-[BentonSansRegular] text-lg mb-4">
							No projects found
						</p>
						<button
							className="bg-transparent border border-white/30 text-white py-2 px-4 rounded-md font-[BentonSansRegular] text-sm cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-white/50"
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
