"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import Image from "next/image";

const HeroSection: React.FC = () => {
	const heroRef = useRef<HTMLDivElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);

	// Add parallax scroll effect
	useEffect(() => {
		const handleScroll = () => {
			const scrollPosition = window.scrollY;
			if (imageRef.current) {
				imageRef.current.style.transform = `scale(1.05) translateY(${scrollPosition * 0.15}px)`;
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<section
			ref={heroRef}
			className="w-full flex relative max-w-full items-center py-32 px-16 flex-col bg-[#0a0a0a] overflow-hidden mb-8 max-md:py-16 max-md:px-6 max-sm:py-8 max-sm:px-4"
		>
			{/* Heading Container */}
			<div className="gap-6 w-full flex z-2 max-w-[1200px] items-center flex-col relative">
				<h1 className="text-white font-[BentonSansBold] text-center leading-[1.1] mb-6 uppercase animate-[pulseGlow_4s_infinite_alternate] text-[clamp(3rem,6vw,5.5rem)] max-md:text-[2.5rem] max-md:leading-[1.2] max-sm:text-[2rem]">
					<span className="font-[BentonSansRegular] tracking-[1px]">
						REDEFINE YOUR
					</span>
					<br />
					<span className="text-[#EC1D24]">MCU</span>
					<span className="font-[BentonSansRegular] tracking-[1px]">
						{" "}EXPERIENCE
					</span>
					<br />
				</h1>
				<p className="text-white/90 font-[BentonSansCompLight] max-w-[800px] text-center leading-normal mb-10 opacity-0 animate-[fadeUp_1s_forwards_0.5s_ease-out] text-[clamp(1.125rem,2vw,1.5rem)] max-md:text-base max-sm:text-sm">
					Stay Ahead on the MCU with Exclusive Updates on News, Leaks, Trailers,
					and More
				</p>
			</div>

			{/* Hero Image Container */}
			<div className="absolute bottom-0 w-full h-[65%] z-1 overflow-hidden origin-bottom scale-105 transition-transform duration-700">
				<Image
					ref={imageRef as any}
					alt="mcuanniversaryimage"
					src="/images/marvel/marvel-class-photo-1920x1080-1500w.jpg"
					className="w-full h-full object-cover opacity-70 scale-105 transition-all duration-1000 animate-[slowZoom_20s_infinite_alternate_ease-in-out] mask-[linear-gradient(to_top,rgba(0,0,0,1),rgba(0,0,0,0))]"
					width={1920}
					height={1080}
					priority
				/>
			</div>
		</section>
	);
};

export default HeroSection;
