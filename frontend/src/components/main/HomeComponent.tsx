import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import HeroSection from "../home/HeroSection";

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
		<div>
			<div className="animate-[fadeIn_1s_ease]">
				<HeroSection />

				{/* Description Section */}
				<section className="w-full flex py-20 px-8 items-center flex-col bg-[#0a0a0a] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-px before:bg-linear-to-r before:from-transparent before:via-[#ec1d24] before:to-transparent max-md:py-8 max-md:px-6">
					<div className="w-full flex max-w-[1200px] items-center flex-col relative">
						<p className="text-white w-full font-[BentonSansBook] text-center leading-[1.8] py-8 px-6 mb-8 bg-[#0a0a0a]/50 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-md border border-[#ec1d24]/10 transform translate-y-[30px] opacity-0 animate-[fadeUp_1s_forwards_0.3s_ease-out] text-[clamp(1.125rem,2vw,1.25rem)] max-sm:text-base max-sm:leading-normal">
							<span>Welcome to </span>
							<span className="text-[#ec1d24] font-[BentonSansBold] relative inline-block">
								MCU REDEFINED
							</span>
							<span>
								, the fanpage dedicated to all Marvel enthusiasts! Immerse
								yourself in a world where heroes and villains collide, as we
								bring you the latest updates, news, and exclusive content
								straight from the Marvel Universe. From epic battles to
								heartwarming moments, we are committed to delivering a
								fan-centric experience like no other. Join us as we celebrate
								the iconic characters, unravel hidden secrets, and delve deep
								into the cinematic marvels that have redefined the superhero
								genre. Be part of our vibrant community and let the Marvel
								fandom thrive at MCU Redefined!
							</span>
						</p>
					</div>
				</section>

				{/* Latest Blog Card Section */}
				<section className="w-full flex py-12 px-8 items-center flex-col bg-[#0a0a0a] max-md:py-8 max-md:px-6">
					<div className="w-full flex max-w-[1200px] bg-[#ec1d24]/10 rounded-xl py-12 px-8 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-md border border-[#ec1d24]/10 mb-12 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(236,29,36,0.2)] max-md:py-8 max-md:px-6 max-sm:py-6 max-sm:px-4">
						<div className="w-full flex items-center justify-between gap-8 max-md:flex-col">
							<div className="flex-1 flex flex-col gap-6">
								<div className="flex flex-col gap-4">
									<h2 className="text-white font-[BentonSansBold] leading-[1.2] text-[clamp(2rem,3vw,3rem)] max-sm:text-[1.75rem]">
										Latest Blog Post
									</h2>
									{latestBlog.id === 0 ? (
										<p className="text-white/80 font-[BentonSansBook] leading-[1.6] text-[clamp(1rem,1.5vw,1.125rem)] max-sm:text-sm">
											Stay up-to-date with the latest news from the Marvel
											Cinematic Universe. Explore our blog for insights on
											upcoming releases, production updates, and
											behind-the-scenes content from your favorite MCU projects.
										</p>
									) : (
										<div>
											<h3 className="text-white font-[BentonSansBold] text-xl mb-2">
												{latestBlog.title}
											</h3>
											<p className="text-white/60 font-[BentonSansRegular] text-sm">
												By {latestBlog.author} •{" "}
												{new Date(latestBlog.created_at).toLocaleDateString()}
											</p>
										</div>
									)}
								</div>
								<Link
									href={
										latestBlog.id === 0 ? "/blogs" : `/blogs/${latestBlog.id}`
									}
								>
									<button
										type="button"
										className="flex items-center p-0 bg-transparent text-[#ec1d24] font-[BentonSansRegular] text-lg transition-transform duration-300 border-none mt-4 cursor-pointer hover:translate-x-2"
										name="button"
									>
										<span className="mr-2">
											{latestBlog.id === 0 ? "Browse Blogs" : "Read More"}
										</span>
										<Image
											alt="arrowsvg"
											src="/images/Icons/arrow-2.svg"
											className="w-4 h-4 object-contain filter-[invert(21%)_sepia(100%)_saturate(5281%)_hue-rotate(349deg)_brightness(94%)_contrast(103%)]"
											width={30}
											height={30}
										/>
									</button>
								</Link>
							</div>
							<div className="w-[300px] h-[200px] flex justify-center items-center relative overflow-hidden rounded-xl bg-white/5 shrink-0 max-md:w-full max-md:h-[180px]">
								<Image
									alt="blog thumbnail"
									src={
										latestBlog.id === 0
											? "/images/DailyBugle.svg"
											: latestBlog.thumbnail_path.link ||
												"/images/DailyBugle.svg"
									}
									className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
									width={240}
									height={180}
								/>
							</div>
						</div>
					</div>
				</section>

				{/* MCU Timeline Section */}
				<section className="w-full flex py-12 px-8 items-center flex-col bg-[#0a0a0a] max-md:py-8 max-md:px-6">
					<div className="w-full flex max-w-[1200px] bg-linear-to-br from-[#ec1d24]/5 to-black/30 rounded-xl flex-col py-12 px-8 shadow-[0_10px_30px_rgba(0,0,0,0.3)] overflow-hidden relative group max-md:py-8 max-md:px-6 max-sm:py-6 max-sm:px-4">
						<div className="flex flex-col items-center gap-8 z-2">
							<div className="flex flex-col items-center text-center gap-4">
								<h2 className="text-white font-[BentonSansBold] leading-[1.2] text-[clamp(2.5rem,4vw,3.5rem)] max-sm:text-[1.75rem]">
									MCU Timeline
								</h2>
								<p className="text-white/80 font-[BentonSansBook] max-w-[800px] leading-[1.6] text-[clamp(1rem,1.5vw,1.25rem)] max-sm:text-sm">
									Follow the Marvel Cinematic Universe Timeline: Unveil the Epic
									Saga in Chronological Order
								</p>
							</div>
							<Link href="/release-slate">
								<button
									type="button"
									className="inline-flex items-center justify-center py-3.5 px-8 bg-[#ec1d24] text-white font-[BentonSansRegular] text-base border-none rounded-md cursor-pointer transition-all duration-300 uppercase tracking-[0.5px] mt-4 shadow-[0_4px_10px_rgba(236,29,36,0.4)] hover:bg-[#d01c22] hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(236,29,36,0.5)]"
									name="button"
								>
									Unveil MCU Timeline
								</button>
							</Link>
						</div>
						<Image
							alt="timelineimage"
							src="/images/Timeline.png"
							className="w-full h-full object-cover mt-12 transition-transform duration-300 group-hover:translate-x-5"
							width={2300}
							height={238}
							style={{ objectFit: "contain" }}
						/>
					</div>
				</section>

				{/* Community Section */}
				<section className="w-full flex py-12 px-8 items-stretch flex-row justify-center bg-[#0a0a0a] gap-8 max-w-[1200px] mx-auto max-xl:flex-col max-md:py-8 max-md:gap-4">
					<div className="flex flex-1 gap-8 h-full max-md:flex-row max-md:h-auto max-md:gap-4">
						{/* Avengers Card */}
						<div className="flex-1 flex flex-col">
							<div className="bg-linear-to-br from-black/30 to-[#ec1d24]/5 rounded-xl p-8 h-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-[#ec1d24]/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(236,29,36,0.2)] group max-md:p-6">
								<Image
									alt="avengerslogo"
									src="/images/AvengersLogo.png"
									className="w-full max-w-[200px] h-auto object-contain transition-transform duration-300 group-hover:scale-110"
									width={300}
									height={300}
									style={{ objectFit: "contain" }}
								/>
							</div>
						</div>
						{/* Guardians Card */}
						<div className="flex-1 flex flex-col">
							<div className="bg-linear-to-br from-black/30 to-[#ec1d24]/5 rounded-xl p-8 h-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-[#ec1d24]/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(236,29,36,0.2)] group max-md:p-6">
								<Image
									alt="guardianslogo"
									src="/images/GuardiansLogo.png"
									className="w-full max-w-[200px] h-auto object-contain transition-transform duration-300 group-hover:scale-110"
									width={300}
									height={320}
									style={{ objectFit: "contain" }}
								/>
							</div>
						</div>
					</div>
					{/* Forum Card */}
					<div className="flex-2 flex flex-col max-xl:w-full">
						<div className="bg-linear-to-br from-[#ec1d24]/10 to-black/30 rounded-xl py-12 px-8 h-full flex flex-col gap-8 shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-[#ec1d24]/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(236,29,36,0.2)] max-sm:py-6 max-sm:px-4">
							<div className="flex flex-col gap-6">
								<h2 className="text-white font-[BentonSansBold] leading-[1.2] text-[clamp(2rem,3vw,2.5rem)] max-sm:text-[1.75rem]">
									Community Forum
								</h2>
								<p className="text-white/80 font-[BentonSansBook] leading-[1.6] text-[clamp(1rem,1.5vw,1.125rem)] max-sm:text-sm">
									Join the conversation with fellow Marvel enthusiasts! Share
									your theories, discuss the latest releases, and connect with
									a vibrant community of fans. Whether you want to debate plot
									twists or speculate about what&apos;s coming next, the MCU
									Redefined forum is your place to engage and be heard.
								</p>
							</div>
							<Link href="/forum">
								<button
									type="button"
									className="inline-flex items-center justify-center py-3.5 px-8 bg-[#ec1d24] text-white font-[BentonSansRegular] text-base border-none rounded-md cursor-pointer transition-all duration-300 uppercase tracking-[0.5px] mt-auto self-start shadow-[0_4px_10px_rgba(236,29,36,0.4)] hover:bg-[#d01c22] hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(236,29,36,0.5)]"
									value="cardforumredir"
									name="button"
								>
									Join The Discussion
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
