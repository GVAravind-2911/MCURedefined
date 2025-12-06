"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
	href: string;
	label: string;
}

export default function BackButton({ href, label }: BackButtonProps) {
	const [opacity, setOpacity] = useState(1);
	const heroRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		// Find the hero section to track when we've scrolled past it
		const heroSection = document.querySelector("[data-hero-section]");
		if (heroSection) {
			heroRef.current = heroSection as HTMLDivElement;
		}

		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			const heroHeight = heroRef.current?.offsetHeight || 500;

			// Start fading when 80% through the hero, fully hidden when hitting main content
			const fadeStartPoint = heroHeight * 0.6;
			const fadeEndPoint = heroHeight;

			if (currentScrollY <= fadeStartPoint) {
				setOpacity(1);
			} else if (currentScrollY >= fadeEndPoint) {
				setOpacity(0);
			} else {
				// Gradual fade between start and end points
				const fadeProgress =
					(currentScrollY - fadeStartPoint) / (fadeEndPoint - fadeStartPoint);
				setOpacity(1 - fadeProgress);
			}
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<Link
			href={href}
			style={{ opacity, transform: `translateX(${(1 - opacity) * -16}px)` }}
			className={`fixed top-24 left-4 z-50 flex items-center gap-2 px-4 py-2.5
				bg-linear-to-br from-white/10 via-white/5 to-transparent
				backdrop-blur-xl backdrop-saturate-150
				rounded-xl
				border border-white/20
				shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]
				text-white/90 hover:text-white
				text-sm font-[BentonSansRegular]
				transition-[box-shadow,border-color,color] duration-300 
				hover:shadow-[0_8px_40px_rgba(236,29,36,0.15),inset_0_1px_0_rgba(255,255,255,0.15)] 
				hover:border-white/30
				group
				${opacity === 0 ? "pointer-events-none" : ""}`}
			prefetch={false}
		>
			<ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
			<span className="hidden sm:inline">{label}</span>
		</Link>
	);
}
