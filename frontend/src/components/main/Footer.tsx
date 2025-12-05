"use client";

import { memo } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
	{ href: "/", label: "Home" },
	{ href: "/reviews", label: "Reviews" },
	{ href: "/blogs", label: "Blog" },
	{ href: "/release-slate", label: "Release Slate" },
	{ href: "/collaborate", label: "Collaborate" },
];

const socialLinks = [
	{
		href: "https://twitter.com/Mcu_Redefined",
		icon: "/images/Icons/twitter.svg",
		label: "Twitter",
	},
	{
		href: "https://discord.com/invite/KwG9WBup",
		icon: "/images/Icons/discord.svg",
		label: "Discord",
	},
	{
		href: "https://www.instagram.com/mcu_redefined/",
		icon: "/images/Icons/instagram.svg",
		label: "Instagram",
	},
];

const Footer = memo(function Footer(): ReactNode {
	return (
		<footer className="bg-black text-white w-full mt-16 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-linear-to-r before:from-transparent before:via-[#ec1d24] before:to-transparent before:z-10">
			{/* Divider */}
			<div className="h-px w-full bg-linear-to-r from-transparent via-[#ec1d24]/30 to-transparent" />

			{/* Main Content */}
			<div className="max-w-[1200px] mx-auto py-12 px-8 flex flex-col max-md:py-8 max-md:px-4">
				<div className="flex flex-wrap justify-between">
					<div className="flex flex-wrap gap-12 w-full justify-around max-sm:flex-col max-sm:items-center max-sm:text-center max-sm:gap-10">
						{/* Navigation Links - Only visible on mobile */}
						<div className="hidden max-lg:flex flex-col gap-3.5 min-w-[180px] max-sm:items-center max-sm:w-full">
							<h3 className="text-[#ec1d24] font-[BentonSansBold] text-lg mb-2 relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-[30px] after:h-0.5 after:bg-[#ec1d24] max-sm:after:left-1/2 max-sm:after:-translate-x-1/2">
								Navigate
							</h3>
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="text-white/80 font-[BentonSansRegular] text-[0.9375rem] transition-all duration-200 inline-block relative py-[3px] hover:text-white hover:translate-x-[3px] max-sm:hover:translate-x-0"
								>
									{link.label}
								</Link>
							))}
						</div>

						{/* Contact & Social Wrapper */}
						<div className="flex gap-16 items-start justify-center flex-wrap max-lg:flex-col max-lg:items-start max-sm:items-center max-sm:w-full">
							{/* Contact Section */}
							<div className="flex flex-col gap-3.5 min-w-[180px] max-sm:items-center max-sm:w-full">
								<h3 className="text-[#ec1d24] font-[BentonSansBold] text-lg mb-2 relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-[30px] after:h-0.5 after:bg-[#ec1d24] max-sm:after:left-1/2 max-sm:after:-translate-x-1/2">
									Contact Us
								</h3>
								<a
									href="mailto:mcuredefined@gmail.com"
									className="text-white/80 font-[BentonSansRegular] text-[0.9375rem] transition-all duration-200 inline-block relative py-[3px] hover:text-white hover:translate-x-[3px] max-sm:hover:translate-x-0"
								>
									<span className="mr-2">✉️</span>
									mcuredefined@gmail.com
								</a>
								<p className="text-white/60 font-[BentonSansRegular] text-sm leading-[1.4]">
									We&apos;d love to hear from you!
								</p>
								<p className="text-white/60 font-[BentonSansRegular] text-sm leading-[1.4]">
									Share your thoughts and feedback.
								</p>
							</div>

							{/* Social Section */}
							<div className="flex flex-col gap-3.5 min-w-[180px] max-sm:items-center max-sm:w-full">
								<h3 className="text-[#ec1d24] font-[BentonSansBold] text-lg mb-2 relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-[30px] after:h-0.5 after:bg-[#ec1d24] max-sm:after:left-1/2 max-sm:after:-translate-x-1/2">
									Follow Us
								</h3>
								<div className="flex gap-4 mt-2 max-sm:justify-center">
									{socialLinks.map((social) => (
										<a
											key={social.label}
											href={social.href}
											target="_blank"
											rel="noreferrer noopener"
											className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 transition-all duration-300 hover:bg-[#ec1d24] hover:-translate-y-[3px] hover:shadow-[0_5px_10px_rgba(236,29,36,0.4)]"
											aria-label={social.label}
										>
											<Image
												alt={social.label}
												src={social.icon}
												className="w-[22px] h-[22px] brightness-0 invert transition-all duration-300"
												width={24}
												height={24}
											/>
										</a>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Bar */}
			<div className="bg-black py-6 px-8 flex justify-between items-center flex-wrap gap-4 max-md:flex-col max-md:text-center">
				<div className="text-white/50 text-sm">
					<p>
						&copy; {new Date().getFullYear()} MCU Redefined. All rights
						reserved.
					</p>
				</div>
				<p className="text-white/60 font-[BentonSansCompLight] text-sm italic max-w-[300px] pl-4 border-l-2 border-[#ec1d24]/30 m-0 max-md:border-l-0 max-md:pl-0 max-md:text-center max-md:max-w-none max-md:mt-4">
					Unleashing Marvel Magic, One Fan at a Time!
				</p>
				<div className="flex items-center gap-8 max-md:flex-col max-md:gap-4 max-md:items-center">
					<div className="flex gap-6 max-md:justify-center">
						<Link
							href="/privacy"
							className="text-white/50 text-sm transition-colors duration-200 hover:text-[#ec1d24]"
						>
							Privacy Policy
						</Link>
						<Link
							href="/terms"
							className="text-white/50 text-sm transition-colors duration-200 hover:text-[#ec1d24]"
						>
							Terms of Service
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
});

export default Footer;
