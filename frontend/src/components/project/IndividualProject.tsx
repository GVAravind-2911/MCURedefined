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
	Tv,
	Clapperboard,
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
			{/* Hero Section - Compact */}
			<div className="relative w-full" data-hero-section>
				{/* Hero Background */}
				<div className="relative w-full overflow-hidden">
					{/* Gradient Background */}
					<div className="absolute inset-0 bg-linear-to-br from-[#ec1d24]/30 via-black/95 to-black" />
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-[#ec1d24]/15 via-transparent to-transparent" />

					{/* Animated Grid Pattern */}
					<div
						className="absolute inset-0 opacity-[0.05]"
						style={{
							backgroundImage:
								"linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
							backgroundSize: "40px 40px",
						}}
					/>

					{/* Decorative Floating Icons - Right Side Cluster */}
					<div className="absolute right-[5%] sm:right-[8%] md:right-[12%] top-[15%] hidden sm:flex flex-col items-end gap-3 sm:gap-4">
						{/* Primary icon - larger, more prominent */}
						<div className="relative">
							<div className="absolute inset-0 bg-[#ec1d24]/20 blur-xl rounded-full animate-pulse" />
							<Film className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 text-[#ec1d24]/20 animate-pulse" />
						</div>
						{/* Secondary icons - smaller, staggered */}
						<div className="flex items-center gap-2 sm:gap-3 -mt-2 mr-4 sm:mr-8">
							<Tv className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white/15 animate-pulse [animation-delay:300ms]" />
							<Calendar className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#ec1d24]/15 animate-pulse [animation-delay:600ms]" />
						</div>
					</div>

					{/* Subtle accent icons - scattered for depth */}
					<div className="absolute top-[20%] right-[35%] sm:right-[40%] hidden md:block opacity-[0.08] animate-pulse [animation-delay:400ms]">
						<Clapperboard className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
					</div>
					<div className="absolute bottom-[30%] right-[22%] hidden lg:block opacity-[0.06] animate-pulse [animation-delay:800ms]">
						<Music className="w-8 h-8 text-[#ec1d24]" />
					</div>

					{/* Content Container - Single flow */}
					<div className="relative z-10 px-4 sm:px-6 md:px-8 lg:px-12 py-5 sm:py-6">
						<div className="max-w-[1400px] mx-auto w-full space-y-4">
							{/* Back Button */}
							<Link
								href="/release-slate"
								className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white/20 no-underline text-sm"
							>
								<ChevronLeft className="w-4 h-4" />
								<span className="font-[BentonSansRegular]">Back to Timeline</span>
							</Link>

							{/* Breadcrumb */}
							<div className="flex items-center gap-2 text-xs sm:text-sm text-white/40">
								<Link href="/" className="hover:text-white/70 transition-colors">
									Home
								</Link>
								<span>/</span>
								<Link
									href="/release-slate"
									className="hover:text-white/70 transition-colors"
								>
									Release Slate
								</Link>
								<span>/</span>
								<span className="text-[#ec1d24]/80">{project.name}</span>
							</div>

							{/* Title Row with Badge */}
							<div className="flex flex-wrap items-center gap-3 sm:gap-4">
								<h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white font-[BentonSansBold] leading-tight">
									{project.name}
								</h1>
								<div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#ec1d24] rounded-full">
									<Film className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
									<span className="text-xs sm:text-sm font-[BentonSansBold] text-white">
										Phase {project.phase}
									</span>
								</div>
							</div>

							{/* Meta Info Bar */}
							<div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/70 text-sm">
								{/* Release Date */}
								<div className="flex items-center gap-1.5">
									<Calendar className="w-3.5 h-3.5 text-[#ec1d24]" />
									<span className="font-[BentonSansRegular]">
										{moment(project.release_date).format("MMMM D, YYYY")}
									</span>
								</div>

								<span className="w-px h-4 bg-white/20" />

								{/* Views */}
								<div className="flex items-center gap-1.5 text-white/50">
									<Eye className="w-3.5 h-3.5" />
									<span className="font-[BentonSansRegular]">
										{totalInteractions.views.toLocaleString()} views
									</span>
								</div>

								<span className="w-px h-4 bg-white/20" />

								{/* Likes */}
								<div className="flex items-center gap-1.5 text-white/50">
									<Heart className="w-3.5 h-3.5" />
									<span className="font-[BentonSansRegular]">
										{totalInteractions.likes.toLocaleString()} likes
									</span>
								</div>
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
