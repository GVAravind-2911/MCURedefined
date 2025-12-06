"use client";

import type { Project } from "@/types/ProjectTypes";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
	Calendar,
	Film,
	Clapperboard,
	Tv,
	Sparkles,
	Search,
	Filter,
} from "lucide-react";

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
		<div className="flex flex-col w-full min-h-screen animate-[fadeInSimple_0.5s_ease-in]">
			{/* Hero Section */}
			<div className="relative w-full" data-hero-section>
				{/* Hero Background */}
				<div className="relative w-full h-[30vh] sm:h-[35vh] md:h-[40vh] overflow-hidden">
					{/* Gradient Background */}
					<div className="absolute inset-0 bg-linear-to-br from-[#ec1d24]/30 via-black/90 to-black" />
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-[#ec1d24]/20 via-transparent to-transparent" />

					{/* Animated Grid Pattern */}
					<div
						className="absolute inset-0 opacity-10"
						style={{
							backgroundImage:
								"linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
							backgroundSize: "50px 50px",
						}}
					/>

					{/* Decorative Floating Icons - Right Side Cluster */}
					<div className="absolute right-[5%] sm:right-[8%] md:right-[12%] top-[15%] flex flex-col items-end gap-3 sm:gap-4">
						{/* Primary icon - larger, more prominent */}
						<div className="relative">
							<div className="absolute inset-0 bg-[#ec1d24]/20 blur-xl rounded-full animate-pulse" />
							<Calendar className="relative w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 text-[#ec1d24]/20 animate-pulse" />
						</div>
						{/* Secondary icons - smaller, staggered */}
						<div className="flex items-center gap-2 sm:gap-3 -mt-2 mr-4 sm:mr-8">
							<Film className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white/15 animate-pulse [animation-delay:300ms]" />
							<Tv className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 text-[#ec1d24]/15 animate-pulse [animation-delay:600ms]" />
						</div>
					</div>

					{/* Subtle accent icons - scattered for depth */}
					<div className="absolute top-[20%] right-[35%] sm:right-[40%] hidden md:block opacity-[0.08] animate-pulse [animation-delay:400ms]">
						<Clapperboard className="w-8 h-8 lg:w-12 lg:h-12 text-white" />
					</div>
					<div className="absolute bottom-[25%] right-[25%] hidden lg:block opacity-[0.06] animate-pulse [animation-delay:800ms]">
						<Sparkles className="w-10 h-10 text-[#ec1d24]" />
					</div>

					{/* Badge */}
					<div className="absolute top-20 right-4 sm:top-24 sm:right-8 flex items-center gap-2 px-4 py-2 bg-[#ec1d24]/90 backdrop-blur-sm rounded-full shadow-lg shadow-[#ec1d24]/20">
						<Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
						<span className="text-sm sm:text-base font-[BentonSansBold] text-white">
							Release Slate
						</span>
					</div>
				</div>

				{/* Title Overlay */}
				<div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 md:px-8 lg:px-12 pb-8 sm:pb-12">
					<div className="max-w-[1400px] mx-auto">
						{/* Breadcrumb */}
						<div className="flex items-center gap-2 mb-4 text-sm text-white/50">
							<Link href="/" className="hover:text-white transition-colors">
								Home
							</Link>
							<span>/</span>
							<span className="text-[#ec1d24]">Release Slate</span>
						</div>

						{/* Title */}
						<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-[BentonSansBold] leading-tight mb-3 sm:mb-4 drop-shadow-lg">
							MCU Timeline
						</h1>

						{/* Description */}
						<p className="text-base sm:text-lg text-white/70 font-[BentonSansRegular] max-w-2xl">
							Explore the Marvel Cinematic Universe films and shows across
							different phases. From the genesis of Iron Man to the latest
							adventures in the multiverse saga.
						</p>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12">
				{/* Search and Filters Section */}
				<div className="mb-8 sm:mb-10">
					{/* Filters Header */}
					<div className="flex items-center gap-3 mb-6">
						<Filter className="w-5 h-5 text-[#ec1d24]" />
						<h2 className="text-lg sm:text-xl font-[BentonSansBold] text-white">
							Filter Projects
						</h2>
					</div>

					<div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
						{/* Search bar */}
						<div className="relative flex-1 max-w-md">
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
							<input
								type="text"
								placeholder="Search movies & shows..."
								value={searchQuery}
								onChange={handleSearchChange}
								className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white font-[BentonSansRegular] text-base placeholder:text-white/40 focus:outline-none focus:border-[#ec1d24]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#ec1d24]/20 transition-all duration-300"
								aria-label="Search projects"
							/>
						</div>

						{/* Phase filters */}
						<div className="flex flex-wrap gap-2">
							<button
								className={`px-4 py-2.5 rounded-xl font-[BentonSansRegular] text-sm cursor-pointer transition-all duration-300 border ${selectedPhase === null ? "bg-[#ec1d24] border-[#ec1d24] text-white shadow-lg shadow-[#ec1d24]/25" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white"}`}
								onClick={() => handlePhaseChange(null)}
								type="button"
								aria-label="All Phases"
							>
								All Phases
							</button>
							{allPhases.map((phase) => (
								<button
									key={`filter-phase-${phase}`}
									className={`px-4 py-2.5 rounded-xl font-[BentonSansRegular] text-sm cursor-pointer transition-all duration-300 border ${selectedPhase === phase ? "bg-[#ec1d24] border-[#ec1d24] text-white shadow-lg shadow-[#ec1d24]/25" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white"}`}
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
						<div className="flex flex-col items-center p-10 sm:p-16 bg-white/2 rounded-2xl my-6 border border-white/5">
							<Search className="w-12 h-12 text-white/20 mb-4" />
							<p className="text-white/70 font-[BentonSansRegular] text-lg mb-2 text-center">
								No projects found matching &quot;{searchQuery}&quot;
							</p>
							<p className="text-white/40 font-[BentonSansRegular] text-sm mb-6 text-center">
								Try adjusting your search or filters
							</p>
							{selectedPhase !== null && (
								<button
									className="bg-white/5 border border-white/20 text-white py-2.5 px-5 rounded-xl font-[BentonSansRegular] text-sm cursor-pointer transition-all duration-300 hover:bg-[#ec1d24]/20 hover:border-[#ec1d24]/50 hover:text-white"
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
				<div className="space-y-12 sm:space-y-16">
					{visiblePhases.length > 0 ? (
						visiblePhases.map((phase) => (
							<div key={`phase-${phase}`}>
								{/* Section title */}
								<div className="flex items-center gap-4 mb-6 sm:mb-8">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#ec1d24]/20 flex items-center justify-center">
											<Film className="w-5 h-5 sm:w-6 sm:h-6 text-[#ec1d24]" />
										</div>
										<h2 className="text-xl sm:text-2xl md:text-3xl font-[BentonSansBold] text-white">
											Phase {phase}
										</h2>
									</div>
									<div className="flex-1 h-px bg-linear-to-r from-[#ec1d24]/50 to-transparent" />
									<span className="text-sm text-white/40 font-[BentonSansRegular]">
										{projectsByPhase[phase].length}{" "}
										{projectsByPhase[phase].length === 1
											? "project"
											: "projects"}
									</span>
								</div>

								{/* Projects grid */}
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6">
									{projectsByPhase[phase].map((project) => (
										<Link
											href={`/release-slate/${project.id}`}
											className="group relative bg-white/2 rounded-xl overflow-hidden border border-white/5 transition-all duration-300 no-underline flex flex-col hover:-translate-y-1 hover:border-[#ec1d24]/30 hover:shadow-xl hover:shadow-[#ec1d24]/10"
											key={project.id}
										>
											{/* Poster container */}
											<div className="relative w-full overflow-hidden">
												<Image
													src={formatPosterPath(
														project.posterpath,
														project.phase,
													)}
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
							<Film className="w-16 h-16 text-white/15 mb-4" />
							<p className="text-white/70 font-[BentonSansBold] text-lg mb-2">
								No projects found
							</p>
							<p className="text-white/40 font-[BentonSansRegular] text-sm mb-6 text-center">
								Try adjusting your search or filter criteria
							</p>
							<button
								className="bg-[#ec1d24] text-white py-2.5 px-6 rounded-xl font-[BentonSansBold] text-sm cursor-pointer transition-all duration-300 hover:bg-[#ff3d44] hover:shadow-lg hover:shadow-[#ec1d24]/30 active:scale-95"
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
		</div>
	);
}
