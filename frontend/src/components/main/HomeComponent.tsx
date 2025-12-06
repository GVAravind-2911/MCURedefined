import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
	Newspaper,
	Star,
	Calendar,
	MessageSquare,
	BookOpen,
	ArrowRight,
} from "lucide-react";

interface HomeProps {
	latestBlog: {
		id: number;
		title: string;
		author: string;
		created_at: string;
		thumbnail_path: {
			link: string;
		};
	};
}

function Home({ latestBlog }: HomeProps): ReactNode {
	return (
		<div className="flex flex-col w-full min-h-screen">
			{/* Hero Section - Optimized for mobile */}
			<div className="relative w-full" data-hero-section>
				<div className="relative w-full h-[85vh] min-h-[500px] max-h-[800px] overflow-hidden">
					{/* Background Image */}
					<div className="absolute inset-0">
						<Image
							alt="MCU Heroes"
							src="/images/marvel/marvel-class-photo-1920x1080-1500w.jpg"
							className="w-full h-full object-cover object-top opacity-40"
							width={1920}
							height={1080}
							priority
						/>
					</div>

					{/* Gradient Overlays */}
					<div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-[#0a0a0a]" />
					<div className="absolute inset-0 bg-linear-to-r from-black/50 via-transparent to-transparent" />

					{/* Hero Content - Centered on mobile */}
					<div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-8 md:px-12">
						<div className="max-w-[1200px] mx-auto w-full">
							{/* Title */}
							<h1 className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl text-white font-[BentonSansBold] leading-[1.1] mb-4 sm:mb-6 uppercase">
								<span className="font-[BentonSansRegular] tracking-wide block">
									Redefine Your
								</span>
								<span className="text-[#ec1d24]">MCU</span>
								<span className="font-[BentonSansRegular]"> Experience</span>
							</h1>

							{/* Description */}
							<p className="text-base sm:text-lg md:text-xl text-white/70 font-[BentonSansRegular] max-w-lg mb-8">
								Your ultimate destination for Marvel news, reviews, and
								community discussions
							</p>

							{/* CTA Buttons - Stack on mobile */}
							<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
								<Link href="/blogs" className="w-full sm:w-auto">
									<button
										type="button"
										className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 sm:px-8 bg-[#ec1d24] text-white font-[BentonSansBold] text-sm sm:text-base rounded-xl transition-all duration-300 uppercase tracking-wide shadow-lg shadow-[#ec1d24]/30 active:scale-[0.98]"
									>
										<Newspaper className="w-5 h-5" />
										Explore Blogs
									</button>
								</Link>
								<Link href="/reviews" className="w-full sm:w-auto">
									<button
										type="button"
										className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 sm:px-8 bg-white/10 backdrop-blur-sm text-white font-[BentonSansBold] text-sm sm:text-base border border-white/20 rounded-xl transition-all duration-300 uppercase tracking-wide active:scale-[0.98]"
									>
										<Star className="w-5 h-5" />
										Read Reviews
									</button>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10">
				{/* Quick Links Grid - Mobile optimized */}
				<section className="mb-8 sm:mb-12">
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
						{[
							{
								href: "/reviews",
								icon: Star,
								label: "Reviews",
								desc: "Film & show reviews",
							},
							{
								href: "/forum",
								icon: MessageSquare,
								label: "Forum",
								desc: "Join discussions",
							},
							{
								href: "/blogs",
								icon: BookOpen,
								label: "Blogs",
								desc: "Latest articles",
							},
							{
								href: "/release-slate",
								icon: Calendar,
								label: "Timeline",
								desc: "MCU chronology",
							},
						].map((item) => (
							<Link key={item.href} href={item.href} className="group">
								<div className="p-4 sm:p-5 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 active:scale-[0.98] hover:border-[#ec1d24]/30 hover:bg-white/[0.07]">
									<div className="p-2.5 bg-[#ec1d24]/20 rounded-lg w-fit mb-3">
										<item.icon className="w-5 h-5 text-[#ec1d24]" />
									</div>
									<h3 className="text-base sm:text-lg text-white font-[BentonSansBold] mb-1 group-hover:text-[#ec1d24] transition-colors">
										{item.label}
									</h3>
									<p className="text-white/50 font-[BentonSansRegular] text-xs sm:text-sm hidden sm:block">
										{item.desc}
									</p>
								</div>
							</Link>
						))}
					</div>
				</section>

				{/* Latest Blog Section - Compact on mobile */}
				<section className="mb-8 sm:mb-12">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<Newspaper className="w-5 h-5 text-[#ec1d24]" />
							<h2 className="text-lg sm:text-xl text-white font-[BentonSansBold]">
								Latest Post
							</h2>
						</div>
						<Link
							href="/blogs"
							className="text-[#ec1d24] text-sm font-[BentonSansBold] flex items-center gap-1 hover:gap-2 transition-all"
						>
							View All <ArrowRight className="w-4 h-4" />
						</Link>
					</div>

					<Link
						href={latestBlog.id === 0 ? "/blogs" : `/blogs/${latestBlog.id}`}
						className="block group"
					>
						<div className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10 transition-all duration-300 active:scale-[0.99] hover:border-[#ec1d24]/30">
							{/* Thumbnail */}
							<div className="relative w-full aspect-video sm:aspect-21/9 overflow-hidden">
								<Image
									alt="blog thumbnail"
									src={
										latestBlog.id === 0
											? "/images/DailyBugle.svg"
											: latestBlog.thumbnail_path.link ||
												"/images/DailyBugle.svg"
									}
									className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
									width={800}
									height={400}
								/>
								<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

								{/* Content overlay */}
								<div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
									<h3 className="text-lg sm:text-xl md:text-2xl text-white font-[BentonSansBold] mb-2 line-clamp-2 group-hover:text-[#ec1d24] transition-colors">
										{latestBlog.id === 0
											? "Stay Updated with Marvel News"
											: latestBlog.title}
									</h3>
									{latestBlog.id !== 0 && (
										<p className="text-white/60 font-[BentonSansRegular] text-sm">
											By {latestBlog.author} •{" "}
											{new Date(latestBlog.created_at).toLocaleDateString()}
										</p>
									)}
								</div>
							</div>
						</div>
					</Link>
				</section>

				{/* MCU Timeline Section - Simplified */}
				<section className="mb-8 sm:mb-12">
					<div className="relative p-5 sm:p-8 bg-linear-to-br from-[#ec1d24]/15 via-black/50 to-black/70 rounded-xl border border-white/10 overflow-hidden">
						{/* Background blur */}
						<div className="absolute -top-20 -right-20 w-40 h-40 bg-[#ec1d24]/20 rounded-full blur-3xl" />

						<div className="relative z-10">
							<div className="flex items-center gap-2 mb-3">
								<Calendar className="w-5 h-5 text-[#ec1d24]" />
								<span className="text-white/50 font-[BentonSansRegular] text-xs uppercase tracking-wider">
									Chronological Journey
								</span>
							</div>

							<h2 className="text-2xl sm:text-3xl text-white font-[BentonSansBold] mb-3">
								MCU Timeline
							</h2>
							<p className="text-white/60 font-[BentonSansBook] text-sm sm:text-base mb-5 max-w-md">
								Experience the Marvel saga in chronological order — every phase,
								every hero, every moment.
							</p>

							<Link href="/release-slate">
								<button
									type="button"
									className="inline-flex items-center gap-2 py-3 px-6 bg-[#ec1d24] text-white font-[BentonSansBold] text-sm rounded-lg transition-all duration-300 uppercase tracking-wide shadow-lg shadow-[#ec1d24]/30 active:scale-[0.98]"
								>
									<Calendar className="w-4 h-4" />
									Explore Timeline
								</button>
							</Link>
						</div>

						{/* Timeline image - hidden on very small screens */}
						<div className="hidden sm:block mt-6 overflow-hidden rounded-lg">
							<Image
								alt="MCU Timeline"
								src="/images/Timeline.png"
								className="w-full h-auto object-contain"
								width={600}
								height={150}
							/>
						</div>
					</div>
				</section>

				{/* Community CTA - Compact */}
				<section>
					<div className="relative p-5 sm:p-8 bg-linear-to-r from-[#ec1d24]/20 to-transparent rounded-xl border border-[#ec1d24]/20 overflow-hidden">
						<div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-2">
									<MessageSquare className="w-5 h-5 text-[#ec1d24]" />
									<span className="text-white/50 font-[BentonSansRegular] text-xs uppercase tracking-wider">
										Community
									</span>
								</div>
								<h2 className="text-xl sm:text-2xl text-white font-[BentonSansBold] mb-2">
									Join the Discussion
								</h2>
								<p className="text-white/60 font-[BentonSansBook] text-sm">
									Share theories and connect with Marvel fans
								</p>
							</div>

							<Link href="/forum" className="w-full sm:w-auto">
								<button
									type="button"
									className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 bg-[#ec1d24] text-white font-[BentonSansBold] text-sm rounded-lg transition-all duration-300 uppercase tracking-wide shadow-lg shadow-[#ec1d24]/30 active:scale-[0.98]"
								>
									<MessageSquare className="w-4 h-4" />
									Join Forum
								</button>
							</Link>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}

export default Home;
