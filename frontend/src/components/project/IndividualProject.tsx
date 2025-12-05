import type { JSX } from "react";
import type { Project } from "@/types/ProjectTypes";
import { notFound } from "next/navigation";
import moment from "moment";
import Image from "next/image";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { getUserLikedProject } from "@/db/project-likes";
import {
	getProjectInteractions,
	incrementProjectView,
} from "@/db/project-interactions";
import LikeButton from "@/components/shared/LikeButton";
import ShareButton from "@/components/shared/ShareButton";

interface IndividualProjectProps {
	project: Project;
}

const formatPosterPath = (path: string | undefined, phase: number): string => {
	if (!path) return "";
	const filename = path.split("/").pop();
	return `/images/Posters/Phase${phase}/${filename}`;
};

export default async function IndividualProject({
	project,
}: IndividualProjectProps): Promise<JSX.Element> {
	if (!project) {
		notFound();
	}

	const session = await auth.api.getSession({ headers: await headers() });
	const userHasLiked = session?.user
		? await getUserLikedProject(session.user.id, project.id)
		: null;
	const totalInteractions = await getProjectInteractions(project.id);

	// Increment view count
	await incrementProjectView(project.id);

	return (
		<div className="flex flex-col w-full items-center animate-[fadeInSimple_0.5s_ease-in]">
			{/* Hero section */}
			<div className="relative w-full h-80 max-lg:h-[280px] max-md:h-60 max-[480px]:h-[200px] bg-linear-to-r from-black/90 to-[#ec1d24]/60 bg-cover bg-center mb-8 flex items-center justify-center overflow-hidden">
				<div className="absolute inset-0 bg-linear-to-b from-black/70 to-black/90 z-1" />
				<div className="relative z-2 text-center px-8 max-[480px]:px-4 max-w-[1000px]">
					<h1 className="font-[BentonSansBold] text-[clamp(32px,6vw,56px)] max-md:text-[28px] max-[480px]:text-2xl text-white m-0 mb-4 uppercase tracking-[1px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.7)] after:content-[''] after:block after:w-[100px] after:h-1 after:bg-[#ec1d24] after:mx-auto after:mt-3">
						{project.name}
					</h1>
					<p className="font-[BentonSansRegular] text-[clamp(18px,2.5vw,22px)] max-md:text-base max-[480px]:text-sm text-white/90 mx-auto leading-relaxed [text-shadow:1px_1px_2px_rgba(0,0,0,0.5)]">
						Phase {project.phase} &bull;{" "}
						{moment(project.release_date).format("MMMM D, YYYY")}
					</p>
				</div>
			</div>

			{/* Content container */}
			<div className="w-[90%] max-[480px]:w-[95%] max-w-[1200px] mx-auto mb-12">
				<div className="flex flex-wrap max-lg:flex-col max-lg:items-center gap-12 max-lg:gap-8 mt-8">
					{/* Poster section */}
					<div className="w-full max-w-[300px] max-lg:max-w-[250px] flex flex-col items-center">
						{/* Poster container */}
						<div className="relative rounded-xl overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:-translate-y-[5px]">
							<div className="absolute top-3 right-3 bg-[#ec1d24] text-white py-1.5 px-3 rounded-md font-[BentonSansBold] text-sm z-2 shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
								Phase {project.phase}
							</div>
							<Image
								src={formatPosterPath(project.posterpath, project.phase)}
								alt={`${project.name} Poster`}
								className="block w-full h-auto"
								width={300}
								height={450}
								priority
							/>
						</div>

						{/* Interaction buttons */}
						<div className="flex justify-center items-center gap-4 mt-5 p-3 w-full rounded-xl bg-white/5">
							<LikeButton
								contentId={project.id}
								contentType="project"
								initialCount={totalInteractions.likes}
								userHasLiked={!!userHasLiked}
								isLoggedIn={!!session?.user}
								size="md"
							/>
							<ShareButton
								contentId={project.id}
								contentType="project"
								size="md"
							/>
						</div>
					</div>

					{/* Project info section */}
					<div className="flex-1 min-w-[300px]">
						{/* Details block */}
						<div className="mb-10">
							<div className="flex items-center mb-6 max-md:mb-4 font-[BentonSansBold] text-white">
								<span className="text-2xl max-md:text-xl mr-4 whitespace-nowrap text-[#ec1d24]">
									Details
								</span>
								<div className="grow h-[3px] bg-linear-to-r from-[#ec1d24] to-transparent" />
							</div>

							<div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] max-md:grid-cols-1 gap-6">
								<div>
									<h3 className="font-[BentonSansBold] text-lg max-md:text-base text-[#ec1d24] m-0 mb-3">
										Release Date
									</h3>
									<p className="font-[BentonSansRegular] text-lg max-md:text-base text-white m-0 leading-normal">
										{moment(project.release_date).format("dddd, D MMMM, YYYY")}
									</p>
								</div>

								<div>
									<h3 className="font-[BentonSansBold] text-lg max-md:text-base text-[#ec1d24] m-0 mb-3">
										Director
									</h3>
									<p className="font-[BentonSansRegular] text-lg max-md:text-base text-white m-0 leading-normal">
										{project.director}
									</p>
								</div>

								<div>
									<h3 className="font-[BentonSansBold] text-lg max-md:text-base text-[#ec1d24] m-0 mb-3">
										Music By
									</h3>
									<p className="font-[BentonSansRegular] text-lg max-md:text-base text-white m-0 leading-normal">
										{project.musicartist}
									</p>
								</div>
							</div>
						</div>

						{/* Cast block */}
						<div className="mb-10">
							<div className="flex items-center mb-6 max-md:mb-4 font-[BentonSansBold] text-white">
								<span className="text-2xl max-md:text-xl mr-4 whitespace-nowrap text-[#ec1d24]">
									Cast
								</span>
								<div className="grow h-[3px] bg-linear-to-r from-[#ec1d24] to-transparent" />
							</div>
							<p className="font-[BentonSansRegular] text-lg max-md:text-base text-white leading-[1.7] m-0 whitespace-pre-line">
								{project.castinfo}
							</p>
						</div>

						{/* Synopsis block */}
						<div className="mb-10">
							<div className="flex items-center mb-6 max-md:mb-4 font-[BentonSansBold] text-white">
								<span className="text-2xl max-md:text-xl mr-4 whitespace-nowrap text-[#ec1d24]">
									Synopsis
								</span>
								<div className="grow h-[3px] bg-linear-to-r from-[#ec1d24] to-transparent" />
							</div>
							<p className="font-[BentonSansRegular] text-lg max-md:text-base text-white leading-[1.8] m-0">
								{project.synopsis}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
