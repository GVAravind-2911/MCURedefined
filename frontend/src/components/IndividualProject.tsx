import type { JSX } from "react";
import type { Project } from "@/types/ProjectTypes";
import { notFound } from "next/navigation";
import moment from "moment";
import "@/styles/projectinfo.css";
import Image from "next/image";

interface IndividualProjectProps {
	project: Project;
}

const formatPosterPath = (path: string | undefined, phase: number): string => {
	if (!path) return "";
	const filename = path.split("/").pop();
	return `/images/Posters/Phase${phase}/${filename}`;
};

export default function IndividualProject({
	project,
}: IndividualProjectProps): JSX.Element {
	if (!project) {
		notFound();
	}

	return (
		<div className="projectinfo-container fade-in">
			<div className="poster">
				<Image
					src={formatPosterPath(project.posterpath, project.phase)}
					alt={`${project.name} Poster`}
					className="projectinfo-imgposter"
					width={300}
					height={450}
				/>
			</div>
			<div className="projectinfo-content">
				<h1>{project.name}</h1>
				<br />
				<h3>
					Release Date :{" "}
					{moment(project.release_date).format("dddd, D MMMM, YYYY")}
				</h3>
				<br />
				<h3>Director : {project.director}</h3>
				<br />
				<h3>Music By : {project.musicartist}</h3>
				<br />
				<h3>Cast :</h3>
				<p>{project.castinfo}</p>
				<br />
				<h3>Synopsis : </h3>
				<p>{project.synopsis}</p>
			</div>
		</div>
	);
}
