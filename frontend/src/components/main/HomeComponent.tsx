"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
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

// Animation variants
const fadeInUp = {
	hidden: { opacity: 0, y: 30 },
	visible: { opacity: 1, y: 0 },
};

const fadeIn = {
	hidden: { opacity: 0 },
	visible: { opacity: 1 },
};

const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.2,
		},
	},
};

const scaleIn = {
	hidden: { opacity: 0, scale: 0.9 },
	visible: { opacity: 1, scale: 1 },
};

function Home({ latestBlog }: HomeProps): ReactNode {
	const heroRef = useRef<HTMLDivElement>(null);
	const { scrollY } = useScroll();
	
	// Parallax effect for hero image
	const heroImageY = useTransform(scrollY, [0, 500], [0, 150]);
	const heroOpacity = useTransform(scrollY, [0, 400], [0.4, 0.15]);
	
	return (
		<div className="flex flex-col w-full min-h-screen overflow-hidden">
			{/* Hero Section - Optimized for mobile */}
			<div className="relative w-full" data-hero-section ref={heroRef}>
				<div className="relative w-full h-[85vh] min-h-[500px] max-h-[800px] overflow-hidden">
					{/* Background Image with Parallax and Continuous Zoom */}
					<motion.div 
						className="absolute inset-0"
						style={{ y: heroImageY }}
					>
						<motion.div
							initial={{ scale: 1.15 }}
							animate={{ scale: [1.0, 1.08, 1.0] }}
							transition={{ 
								scale: {
									duration: 20,
									repeat: Infinity,
									ease: "easeInOut",
								}
							}}
							className="w-full h-full"
						>
							<Image
								alt="MCU Heroes"
								src="/images/marvel/marvel-class-photo-1920x1080-1500w.jpg"
								className="w-full h-full object-cover object-top"
								style={{ opacity: 0.4 }}
								width={1920}
								height={1080}
								priority
							/>
						</motion.div>
					</motion.div>

					{/* Animated Gradient Overlays */}
					<motion.div 
						className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-[#0a0a0a]"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 1 }}
					/>
					<div className="absolute inset-0 bg-linear-to-r from-black/50 via-transparent to-transparent" />

					{/* Floating particles effect */}
					<div className="absolute inset-0 overflow-hidden pointer-events-none">
						{[...Array(6)].map((_, i) => (
							<motion.div
								key={i}
								className="absolute w-1 h-1 bg-[#ec1d24]/30 rounded-full"
								style={{
									left: `${15 + i * 15}%`,
									top: `${20 + (i % 3) * 25}%`,
								}}
								animate={{
									y: [-20, 20, -20],
									opacity: [0.3, 0.6, 0.3],
								}}
								transition={{
									duration: 3 + i * 0.5,
									repeat: Infinity,
									ease: "easeInOut",
									delay: i * 0.3,
								}}
							/>
						))}
					</div>

					{/* Hero Content - Centered on mobile */}
					<div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-8 md:px-12">
						<div className="max-w-[1200px] mx-auto w-full">
							{/* Title with Hover Shimmer Effect */}
							<motion.h1 
								className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl text-white font-[BentonSansBold] leading-[1.1] mb-4 sm:mb-6 uppercase relative group/title cursor-default"
								initial="hidden"
								animate="visible"
								variants={{
									hidden: { opacity: 0 },
									visible: { 
										opacity: 1,
										transition: { staggerChildren: 0.15 }
									}
								}}
							>
								<motion.span 
									className="font-[BentonSansRegular] tracking-wide block relative"
									variants={{
										hidden: { opacity: 0, x: -50 },
										visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
									}}
								>
									<span className="relative inline-block overflow-hidden">
										Redefine Your
										{/* Shimmer overlay - only on hover */}
										<span className="absolute inset-0 bg-linear-to-r from-transparent via-white/25 to-transparent bg-size-[200%_100%] opacity-0 group-hover/title:opacity-100 group-hover/title:animate-text-shimmer transition-opacity duration-300" />
									</span>
								</motion.span>
								<motion.span
									variants={{
										hidden: { opacity: 0, scale: 0.8 },
										visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
									}}
									className="relative inline-block"
								>
									<span className="text-[#ec1d24] relative inline-block overflow-hidden">
										MCU
										{/* Red shimmer for MCU - only on hover */}
										<span className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent bg-size-[200%_100%] mix-blend-overlay opacity-0 group-hover/title:opacity-100 group-hover/title:animate-text-shimmer transition-opacity duration-300" />
									</span>
									<span className="font-[BentonSansRegular] relative inline-block overflow-hidden">
										{" "}Experience
										<span className="absolute inset-0 bg-linear-to-r from-transparent via-white/25 to-transparent bg-size-[200%_100%] opacity-0 group-hover/title:opacity-100 group-hover/title:animate-text-shimmer transition-opacity duration-300" />
									</span>
								</motion.span>
							</motion.h1>

							{/* Description */}
							<motion.p 
								className="text-base sm:text-lg md:text-xl text-white/70 font-[BentonSansRegular] max-w-lg mb-8"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.5 }}
							>
								Your ultimate destination for Marvel news, reviews, and
								community discussions
							</motion.p>

							{/* CTA Buttons - Stack on mobile */}
							<motion.div 
								className="flex flex-col sm:flex-row gap-3 sm:gap-4"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.7 }}
							>
								<Link href="/blogs" className="w-full sm:w-auto">
									<motion.button
										type="button"
										className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 sm:px-8 bg-[#ec1d24] text-white font-[BentonSansBold] text-sm sm:text-base rounded-xl transition-all duration-300 uppercase tracking-wide shadow-lg shadow-[#ec1d24]/30"
										whileHover={{ scale: 1.03, boxShadow: "0 10px 40px rgba(236, 29, 36, 0.4)" }}
										whileTap={{ scale: 0.98 }}
									>
										<Newspaper className="w-5 h-5" />
										Explore Blogs
									</motion.button>
								</Link>
								<Link href="/reviews" className="w-full sm:w-auto">
									<motion.button
										type="button"
										className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 sm:px-8 bg-white/10 backdrop-blur-sm text-white font-[BentonSansBold] text-sm sm:text-base border border-white/20 rounded-xl transition-all duration-300 uppercase tracking-wide"
										whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.15)" }}
										whileTap={{ scale: 0.98 }}
									>
										<Star className="w-5 h-5" />
										Read Reviews
									</motion.button>
								</Link>
							</motion.div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10">
				{/* Quick Links Grid - Mobile optimized */}
				<motion.section 
					className="mb-8 sm:mb-12"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-50px" }}
					variants={staggerContainer}
				>
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
						].map((item, index) => (
							<motion.div
								key={item.href}
								variants={fadeInUp}
								transition={{ duration: 0.5 }}
							>
								<Link href={item.href} className="group block h-full">
									<motion.div 
										className="h-full p-4 sm:p-5 bg-white/5 rounded-xl border border-white/10 transition-colors duration-300 hover:border-[#ec1d24]/30 hover:bg-white/[0.07]"
										whileHover={{ y: -5, transition: { duration: 0.2 } }}
										whileTap={{ scale: 0.98 }}
									>
										<motion.div 
											className="p-2.5 bg-[#ec1d24]/20 rounded-lg w-fit mb-3"
											whileHover={{ scale: 1.1, rotate: 5 }}
											transition={{ type: "spring", stiffness: 400 }}
										>
											<item.icon className="w-5 h-5 text-[#ec1d24]" />
										</motion.div>
										<h3 className="text-base sm:text-lg text-white font-[BentonSansBold] mb-1 group-hover:text-[#ec1d24] transition-colors">
											{item.label}
										</h3>
										<p className="text-white/50 font-[BentonSansRegular] text-xs sm:text-sm hidden sm:block">
											{item.desc}
										</p>
									</motion.div>
								</Link>
							</motion.div>
						))}
					</div>
				</motion.section>

				{/* Latest Blog Section - Compact on mobile */}
				<motion.section 
					className="mb-8 sm:mb-12"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-50px" }}
					variants={fadeInUp}
					transition={{ duration: 0.6 }}
				>
					<div className="flex items-center justify-between mb-4">
						<motion.div 
							className="flex items-center gap-2"
							initial={{ opacity: 0, x: -20 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
						>
							<motion.div
								animate={{ rotate: [0, 10, -10, 0] }}
								transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
							>
								<Newspaper className="w-5 h-5 text-[#ec1d24]" />
							</motion.div>
							<h2 className="text-lg sm:text-xl text-white font-[BentonSansBold]">
								Latest Post
							</h2>
						</motion.div>
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
						<motion.div 
							className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10 transition-colors duration-300 hover:border-[#ec1d24]/30"
							whileHover={{ y: -3 }}
							whileTap={{ scale: 0.995 }}
						>
							{/* Thumbnail */}
							<div className="relative w-full aspect-video sm:aspect-21/9 overflow-hidden">
								<motion.div
									className="w-full h-full"
									whileHover={{ scale: 1.05 }}
									transition={{ duration: 0.6 }}
								>
									<Image
										alt="blog thumbnail"
										src={
											latestBlog.id === 0
												? "/images/DailyBugle.svg"
												: latestBlog.thumbnail_path.link ||
													"/images/DailyBugle.svg"
										}
										className="w-full h-full object-cover"
										width={800}
										height={400}
									/>
								</motion.div>
								<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

								{/* Content overlay */}
								<motion.div 
									className="absolute bottom-0 left-0 right-0 p-4 sm:p-6"
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.5, delay: 0.2 }}
								>
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
								</motion.div>
							</div>
						</motion.div>
					</Link>
				</motion.section>

				{/* MCU Timeline Section - Simplified */}
				<motion.section 
					className="mb-8 sm:mb-12"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-50px" }}
					variants={scaleIn}
					transition={{ duration: 0.6 }}
				>
					<motion.div 
						className="relative p-5 sm:p-8 bg-linear-to-br from-[#ec1d24]/15 via-black/50 to-black/70 rounded-xl border border-white/10 overflow-hidden"
						whileHover={{ borderColor: "rgba(236, 29, 36, 0.3)" }}
						transition={{ duration: 0.3 }}
					>
						{/* Animated background blur */}
						<motion.div 
							className="absolute -top-20 -right-20 w-40 h-40 bg-[#ec1d24]/20 rounded-full blur-3xl"
							animate={{ 
								scale: [1, 1.2, 1],
								opacity: [0.2, 0.3, 0.2],
							}}
							transition={{ 
								duration: 4, 
								repeat: Infinity, 
								ease: "easeInOut" 
							}}
						/>

						<div className="relative z-10">
							<motion.div 
								className="flex items-center gap-2 mb-3"
								initial={{ opacity: 0, x: -20 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5 }}
							>
								<motion.div
									animate={{ rotate: 360 }}
									transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
								>
									<Calendar className="w-5 h-5 text-[#ec1d24]" />
								</motion.div>
								<span className="text-white/50 font-[BentonSansRegular] text-xs uppercase tracking-wider">
									Chronological Journey
								</span>
							</motion.div>

							<motion.h2 
								className="text-2xl sm:text-3xl text-white font-[BentonSansBold] mb-3"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: 0.1 }}
							>
								MCU Timeline
							</motion.h2>
							<motion.p 
								className="text-white/60 font-[BentonSansBook] text-sm sm:text-base mb-5 max-w-md"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: 0.2 }}
							>
								Experience the Marvel saga in chronological order — every phase,
								every hero, every moment.
							</motion.p>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: 0.3 }}
							>
								<Link href="/release-slate">
									<motion.button
										type="button"
										className="inline-flex items-center gap-2 py-3 px-6 bg-[#ec1d24] text-white font-[BentonSansBold] text-sm rounded-lg transition-all duration-300 uppercase tracking-wide shadow-lg shadow-[#ec1d24]/30"
										whileHover={{ scale: 1.03, boxShadow: "0 10px 40px rgba(236, 29, 36, 0.4)" }}
										whileTap={{ scale: 0.98 }}
									>
										<Calendar className="w-4 h-4" />
										Explore Timeline
									</motion.button>
								</Link>
							</motion.div>
						</div>

						{/* Timeline image - hidden on very small screens */}
						<motion.div 
							className="hidden sm:block mt-6 overflow-hidden rounded-lg"
							initial={{ opacity: 0, scale: 0.95 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6, delay: 0.3 }}
						>
							<motion.div
								whileHover={{ scale: 1.02 }}
								transition={{ duration: 0.4 }}
							>
								<Image
									alt="MCU Timeline"
									src="/images/Timeline.png"
									className="w-full h-auto object-contain"
									width={600}
									height={150}
								/>
							</motion.div>
						</motion.div>
					</motion.div>
				</motion.section>

				{/* Community CTA - Compact */}
				<motion.section
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-50px" }}
					variants={fadeInUp}
					transition={{ duration: 0.6 }}
				>
					<motion.div 
						className="relative p-5 sm:p-8 bg-linear-to-r from-[#ec1d24]/20 to-transparent rounded-xl border border-[#ec1d24]/20 overflow-hidden"
						whileHover={{ borderColor: "rgba(236, 29, 36, 0.4)" }}
						transition={{ duration: 0.3 }}
					>
						{/* Animated glow effect */}
						<motion.div
							className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#ec1d24]/10 rounded-full blur-3xl"
							animate={{
								scale: [1, 1.3, 1],
								opacity: [0.1, 0.2, 0.1],
							}}
							transition={{
								duration: 5,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						/>
						
						<div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
							<div className="flex-1">
								<motion.div 
									className="flex items-center gap-2 mb-2"
									initial={{ opacity: 0, x: -20 }}
									whileInView={{ opacity: 1, x: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.5 }}
								>
									<motion.div
										animate={{ 
											y: [0, -3, 0],
										}}
										transition={{ 
											duration: 1.5, 
											repeat: Infinity, 
											ease: "easeInOut" 
										}}
									>
										<MessageSquare className="w-5 h-5 text-[#ec1d24]" />
									</motion.div>
									<span className="text-white/50 font-[BentonSansRegular] text-xs uppercase tracking-wider">
										Community
									</span>
								</motion.div>
								<motion.h2 
									className="text-xl sm:text-2xl text-white font-[BentonSansBold] mb-2"
									initial={{ opacity: 0, y: 10 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.5, delay: 0.1 }}
								>
									Join the Discussion
								</motion.h2>
								<motion.p 
									className="text-white/60 font-[BentonSansBook] text-sm"
									initial={{ opacity: 0, y: 10 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.5, delay: 0.2 }}
								>
									Share theories and connect with Marvel fans
								</motion.p>
							</div>

							<motion.div
								initial={{ opacity: 0, x: 20 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: 0.3 }}
							>
								<Link href="/forum" className="w-full sm:w-auto">
									<motion.button
										type="button"
										className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 bg-[#ec1d24] text-white font-[BentonSansBold] text-sm rounded-lg transition-all duration-300 uppercase tracking-wide shadow-lg shadow-[#ec1d24]/30"
										whileHover={{ scale: 1.03, boxShadow: "0 10px 40px rgba(236, 29, 36, 0.4)" }}
										whileTap={{ scale: 0.98 }}
									>
										<MessageSquare className="w-4 h-4" />
										Join Forum
									</motion.button>
								</Link>
							</motion.div>
						</div>
					</motion.div>
				</motion.section>
			</div>
		</div>
	);
}

export default Home;
