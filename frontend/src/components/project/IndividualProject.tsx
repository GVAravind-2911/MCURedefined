import type { JSX } from "react";
import type { Project } from "@/types/ProjectTypes";
import { notFound } from "next/navigation";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { getUserLikedProject } from "@/db/project-likes";
import {
	getProjectInteractions,
	incrementProjectView,
} from "@/db/project-interactions";
import LikeButton from "@/components/shared/LikeButton";
import ShareButton from "@/components/shared/ShareButton";
import {
	Calendar,
	Film,
	Users,
	Music,
	FileText,
	Eye,
	ChevronLeft,
	Heart,
} from "lucide-react";

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
		<div className="flex flex-col w-full min-h-screen animate-[fadeInSimple_0.5s_ease-in]">
			{/* Hero Section */}
			<div className="relative w-full" data-hero-section>
				{/* Back Button - Fixed positioning with safe area */}
				<div className="absolute top-4 left-0 right-0 z-20 px-4 sm:px-6 md:px-8 lg:px-12">
					<div className="max-w-[1400px] mx-auto">
						<Link
							href="/release-slate"
							className="inline-flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full border border-white/10 text-white/80 transition-all duration-300 hover:bg-black/70 hover:text-white hover:border-white/20 no-underline"
						>
							<ChevronLeft className="w-4 h-4" />
							<span className="text-sm font-[BentonSansRegular]">
								Back to Timeline
							</span>
						</Link>
					</div>
				</div>

				{/* Hero Background */}
				<div className="relative w-full h-[35vh] sm:h-[40vh] md:h-[50vh] overflow-hidden">
					{/* Gradient Background */}
					<div className="absolute inset-0 bg-linear-to-br from-[#ec1d24]/40 via-black/90 to-black" />
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-[#ec1d24]/25 via-transparent to-transparent" />
					<div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />

					{/* Animated Grid Pattern */}
					<div
						className="absolute inset-0 opacity-10"
						style={{
							backgroundImage:
								"linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
							backgroundSize: "50px 50px",
						}}
					/>

					{/* Decorative Icons */}
					<div className="absolute right-[8%] top-[25%] flex flex-col items-end gap-3 sm:gap-4 opacity-20">
						<Film className="w-16 h-16 sm:w-24 sm:h-24 text-white/30 animate-pulse" />
					</div>

					{/* Phase Badge - Positioned inside the max-width container */}
					<div className="absolute top-4 left-0 right-0 z-10 px-4 sm:px-6 md:px-8 lg:px-12">
						<div className="max-w-[1400px] mx-auto flex justify-end">
							<div className="flex items-center gap-2 px-4 py-2 bg-[#ec1d24]/90 backdrop-blur-sm rounded-full shadow-lg shadow-[#ec1d24]/20">
								<Film className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
								<span className="text-sm sm:text-base font-[BentonSansBold] text-white">
									Phase {project.phase}
								</span>
							</div>
						</div>
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
							<Link
								href="/release-slate"
								className="hover:text-white transition-colors"
							>
								Release Slate
							</Link>
							<span>/</span>
							<span className="text-[#ec1d24]">{project.name}</span>
						</div>

						{/* Title */}
						<h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-[BentonSansBold] leading-tight mb-4 sm:mb-6 max-w-4xl drop-shadow-lg">
							{project.name}
						</h1>

						{/* Meta Info Bar */}
						<div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-white/80">
							{/* Release Date */}
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4 text-[#ec1d24]" />
								<span className="text-sm sm:text-base font-[BentonSansRegular]">
									{moment(project.release_date).format("MMMM D, YYYY")}
								</span>
							</div>

							<span className="hidden sm:block w-px h-5 bg-white/30" />

							{/* Views */}
							<div className="flex items-center gap-2 text-white/60">
								<Eye className="w-4 h-4" />
								<span className="text-sm font-[BentonSansRegular]">
									{totalInteractions.views.toLocaleString()} views
								</span>
							</div>

							<span className="hidden sm:block w-px h-5 bg-white/30" />

							{/* Likes */}
							<div className="flex items-center gap-2 text-white/60">
								<Heart className="w-4 h-4" />
								<span className="text-sm font-[BentonSansRegular]">
									{totalInteractions.likes.toLocaleString()} likes
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12">
				<div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
					{/* Left Column - Poster */}
					<div className="w-full lg:w-[300px] shrink-0 flex flex-col items-center lg:items-start">
						{/* Poster container */}
						<div className="lg:sticky lg:top-24 w-full max-w-[280px] sm:max-w-[300px]">
							<div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 transition-transform duration-300 hover:scale-[1.02]">
								<Image
									src={formatPosterPath(project.posterpath, project.phase)}
									alt={`${project.name} Poster`}
									className="w-full h-auto object-cover aspect-2/3"
									width={300}
									height={450}
									priority
									style={{ objectFit: "cover" }}
								/>
							</div>

							{/* Interaction buttons */}
							<div className="flex justify-center items-center gap-4 mt-6 p-4 w-full rounded-xl bg-white/3 border border-white/5">
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
					</div>

					{/* Right Column - Info */}
					<div className="flex-1 min-w-0">
						{/* Details Section */}
						<section className="mb-10">
							<div className="flex items-center gap-4 mb-6">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-[#ec1d24]/20 flex items-center justify-center">
										<FileText className="w-5 h-5 text-[#ec1d24]" />
									</div>
									<h2 className="text-xl sm:text-2xl font-[BentonSansBold] text-white">
										Details
									</h2>
								</div>
								<div className="flex-1 h-px bg-linear-to-r from-[#ec1d24]/50 to-transparent" />
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								<div className="p-5 bg-white/3 rounded-xl border border-white/5">
									<div className="flex items-center gap-2 mb-2">
										<Calendar className="w-4 h-4 text-[#ec1d24]" />
										<h3 className="font-[BentonSansBold] text-sm text-white/50 uppercase tracking-wider">
											Release Date
										</h3>
									</div>
									<p className="font-[BentonSansRegular] text-base sm:text-lg text-white">
										{moment(project.release_date).format("dddd, D MMMM, YYYY")}
									</p>
								</div>

								<div className="p-5 bg-white/3 rounded-xl border border-white/5">
									<div className="flex items-center gap-2 mb-2">
										<Film className="w-4 h-4 text-[#ec1d24]" />
										<h3 className="font-[BentonSansBold] text-sm text-white/50 uppercase tracking-wider">
											Director
										</h3>
									</div>
									<p className="font-[BentonSansRegular] text-base sm:text-lg text-white">
										{project.director}
									</p>
								</div>

								<div className="p-5 bg-white/3 rounded-xl border border-white/5">
									<div className="flex items-center gap-2 mb-2">
										<Music className="w-4 h-4 text-[#ec1d24]" />
										<h3 className="font-[BentonSansBold] text-sm text-white/50 uppercase tracking-wider">
											Music By
										</h3>
									</div>
									<p className="font-[BentonSansRegular] text-base sm:text-lg text-white">
										{project.musicartist}
									</p>
								</div>
							</div>
						</section>

						{/* Cast Section */}
						<section className="mb-10">
							<div className="flex items-center gap-4 mb-6">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-[#ec1d24]/20 flex items-center justify-center">
										<Users className="w-5 h-5 text-[#ec1d24]" />
									</div>
									<h2 className="text-xl sm:text-2xl font-[BentonSansBold] text-white">
										Cast
									</h2>
								</div>
								<div className="flex-1 h-px bg-linear-to-r from-[#ec1d24]/50 to-transparent" />
							</div>
							<div className="p-6 bg-white/3 rounded-xl border border-white/5">
								<p className="font-[BentonSansRegular] text-base sm:text-lg text-white/90 leading-relaxed whitespace-pre-line">
									{project.castinfo}
								</p>
							</div>
						</section>

						{/* Synopsis Section */}
						<section className="mb-10">
							<div className="flex items-center gap-4 mb-6">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-[#ec1d24]/20 flex items-center justify-center">
										<FileText className="w-5 h-5 text-[#ec1d24]" />
									</div>
									<h2 className="text-xl sm:text-2xl font-[BentonSansBold] text-white">
										Synopsis
									</h2>
								</div>
								<div className="flex-1 h-px bg-linear-to-r from-[#ec1d24]/50 to-transparent" />
							</div>
							<div className="p-6 bg-white/3 rounded-xl border border-white/5">
								<p className="font-[BentonSansRegular] text-base sm:text-lg text-white/90 leading-relaxed">
									{project.synopsis}
								</p>
							</div>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}
