import type { Project } from "@/types/ProjectTypes";
import "@/styles/timeline.css";
import Link from "next/link";
import Image from "next/image";

const formatPosterPath = (path: string, phase: number): string => {
	// Extract filename from static/img/posters/name.extension
	const filename = path.split("/").pop();
	// Return path pointing to public/images/Posters/Phase{phase} directory
	return `/images/Posters/Phase${phase}/${filename}`;
};

interface ProjectsPageProps {
	projects: Project[];
}

export default async function ProjectsPage({ projects }: ProjectsPageProps) {
	if (!Array.isArray(projects)) {
		console.error("Projects is not an array:", projects);
		return <div>Error loading projects</div>;
	}

	const phase1 = projects.filter((project) => project.phase === 1);
	const phase2 = projects.filter((project) => project.phase === 2);
	const phase3 = projects.filter((project) => project.phase === 3);

	return (
		<div className="contentFill fade-in">
			<div className="mainphase-name">
				<h1>Phase 1</h1>
			</div>
			<div className="phase">
				{phase1.map((project) => (
					<Link
						href={`/release-slate/${project.id}`}
						className="anchorlink"
						key={project.id}
					>
						<div className="phase-projectcard">
							<div className="img-container">
								<Image
									src={formatPosterPath(project.posterpath, project.phase)}
									alt={`Phase ${project.phase} Project Poster`}
									className="phase-posters"
									width={200}
									height={300}
									style={{ objectFit: "cover" }}
								/>
							</div>
							<div className="phase-name">
								<h1>{project.name}</h1>
							</div>
						</div>
					</Link>
				))}
			</div>

			<div className="mainphase-name">
				<h1>Phase 2</h1>
			</div>
			<div className="phase">
				{phase2.map((project) => (
					<Link
						href={`/release-slate/${project.id}`}
						className="anchorlink"
						key={project.id}
					>
						<div className="phase-projectcard">
							<div className="img-container">
								<Image
									src={formatPosterPath(project.posterpath, project.phase)}
									alt={`Phase ${project.phase} Project Poster`}
									className={`phase${project.phase}-posters`}
									width={200}
									height={300}
									style={{ objectFit: "cover" }}
								/>
							</div>
							<div className="phase-name">
								<h1>{project.name}</h1>
							</div>
						</div>
					</Link>
				))}
			</div>

			<div className="mainphase-name">
				<h1>Phase 3</h1>
			</div>
			<div className="phase">
				{phase3.map((project) => (
					<Link
						href={`/release-slate/${project.id}`}
						className="anchorlink"
						key={project.id}
					>
						<div className="phase-projectcard">
							<div className="img-container">
								<Image
									src={formatPosterPath(project.posterpath, project.phase)}
									alt={`Phase ${project.phase} Project Poster`}
									className={`phase${project.phase}-posters`}
									width={200}
									height={300}
									style={{ objectFit: "cover" }}
								/>
							</div>
							<div className="phase-name">
								<h1>{project.name}</h1>
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
