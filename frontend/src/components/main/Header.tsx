"use client";

import type { ReactNode } from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface HeaderProps {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	session: any;
}

const navLinks = [
	{ href: "/", label: "Home" },
	{ href: "/reviews", label: "Reviews" },
	{ href: "/blogs", label: "Blogs" },
	{ href: "/release-slate", label: "Release Slate" },
	{ href: "/forum", label: "Forum" },
];

const adminLinks = [
	{ href: "/manage/users", label: "Users" },
	{ href: "/manage/blogs", label: "Blogs" },
	{ href: "/manage/reviews", label: "Reviews" },
];

// Icon components for cleaner code
const Icons = {
	user: (
		<svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
			<title>User</title>
			<circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
			<path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
		</svg>
	),
	chevronDown: (
		<svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
			<title>Expand</title>
			<path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	),
	signOut: (
		<svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
			<title>Sign Out</title>
			<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			<polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			<line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	),
	profile: (
		<svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
			<title>Profile</title>
			<circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
			<path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
		</svg>
	),
	admin: (
		<svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
			<title>Admin</title>
			<path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2" />
			<path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2" />
		</svg>
	),
	close: (
		<svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
			<title>Close</title>
			<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	),
};

function Header({ session }: HeaderProps): ReactNode {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const pathname = usePathname();
	const isAdmin = session?.user?.role === "admin";

	// Handle scroll effect
	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 20);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Lock body scroll when mobile menu is open
	useEffect(() => {
		document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
		return () => { document.body.style.overflow = ""; };
	}, [isMobileMenuOpen]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const closeMobileMenu = () => setIsMobileMenuOpen(false);

	const isActive = (path: string) => {
		if (path === "/") return pathname === "/";
		return pathname.startsWith(path);
	};

	const handleSignOut = async () => {
		try {
			await authClient.signOut();
			window.location.href = "/";
		} catch (error) {
			console.error("Sign out failed:", error);
			window.location.reload();
		}
	};

	return (
		<>
			{/* Main Header */}
			<header
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
					isScrolled
						? "bg-black/95 backdrop-blur-md shadow-lg shadow-black/20"
						: "bg-black"
				}`}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16 lg:h-20">
						{/* Logo */}
						<Link href="/" className="shrink-0 group">
							<Image
								src="/images/MainLogo.svg"
								alt="MCU Redefined"
								width={140}
								height={45}
								className="h-9 lg:h-11 w-auto transition-transform duration-200 group-hover:scale-105"
								priority
							/>
						</Link>

						{/* Desktop Navigation */}
						<nav className="hidden lg:flex items-center gap-1">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									style={{ fontFamily: '"BentonSansBook", sans-serif' }}
									className={`relative px-4 py-2 text-base tracking-wide transition-colors duration-200 rounded-lg
										${isActive(link.href)
											? "text-[#ec1d24]"
											: "text-white/90 hover:text-white hover:bg-white/5"
										}
									`}
								>
									{link.label}
									{isActive(link.href) && (
										<span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#ec1d24] rounded-full" />
									)}
								</Link>
							))}
						</nav>

						{/* Desktop Right Section */}
						<div className="hidden lg:flex items-center gap-3">
							{/* Admin Badge (Desktop only) */}
							{isAdmin && (
								<div className="flex items-center gap-1 mr-2">
									<span className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-[#ec1d24] bg-[#ec1d24]/10 rounded-md border border-[#ec1d24]/20">
										Admin
									</span>
								</div>
							)}

							{session ? (
								<div className="relative" ref={dropdownRef}>
									<button
										onClick={() => setIsDropdownOpen(!isDropdownOpen)}
										className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full transition-all duration-200 ${
											isDropdownOpen
												? "bg-[#ec1d24]/15 ring-1 ring-[#ec1d24]/30"
												: "bg-white/5 hover:bg-[#ec1d24]/10 hover:ring-1 hover:ring-[#ec1d24]/20"
										}`}
										type="button"
									>
										{/* Avatar */}
										<div className="w-8 h-8 rounded-full bg-linear-to-br from-[#ec1d24] to-[#ff6b6b] flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-[#ec1d24]/20">
											{session.user?.name?.charAt(0)?.toUpperCase() || "U"}
										</div>
										<span className="max-w-[100px] truncate text-sm font-medium text-white">
											{session.user?.name}
										</span>
										<span className={`transition-transform duration-200 text-white/60 ${isDropdownOpen ? "rotate-180" : ""}`}>
											{Icons.chevronDown}
										</span>
									</button>

											{/* Dropdown Menu */}
											{isDropdownOpen && (
												<div className="absolute top-full right-0 mt-2 w-60 bg-[#141414] border border-[#ec1d24]/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
													{/* User Info Header */}
													<div className="px-4 py-4 border-b border-white/10 bg-linear-to-r from-[#ec1d24]/10 to-transparent">
														<div className="flex items-center gap-3">
															<div className="w-10 h-10 rounded-full bg-linear-to-br from-[#ec1d24] to-[#ff6b6b] flex items-center justify-center text-white font-semibold shadow-md shadow-[#ec1d24]/30">
																{session.user?.name?.charAt(0)?.toUpperCase() || "U"}
															</div>
															<div className="flex-1 min-w-0">
																<p className="text-sm font-semibold text-white truncate">{session.user?.name}</p>
																<p className="text-xs text-white/50 truncate">@{session.user?.username}</p>
															</div>
														</div>
													</div>											{/* Profile Link */}
											<Link
												href={`/profile/${session.user?.username}`}
												onClick={() => setIsDropdownOpen(false)}
												className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
											>
												{Icons.profile}
												<span>Your Profile</span>
											</Link>

											{/* Admin Section */}
											{isAdmin && (
												<>
													<div className="border-t border-white/10 my-1" />
													<div className="px-4 py-2">
														<p className="text-xs font-semibold uppercase tracking-wider text-white/40">
															Admin Panel
														</p>
													</div>
													{adminLinks.map((link) => (
														<Link
															key={link.href}
															href={link.href}
															onClick={() => setIsDropdownOpen(false)}
															className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-[#ec1d24] hover:bg-[#ec1d24]/5 transition-colors"
														>
															{Icons.admin}
															<span>Manage {link.label}</span>
														</Link>
													))}
												</>
											)}

											{/* Sign Out */}
											<div className="border-t border-white/10 mt-1">
												<button
													onClick={handleSignOut}
													className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/80 hover:text-[#ec1d24] hover:bg-[#ec1d24]/5 transition-colors"
													type="button"
												>
													{Icons.signOut}
													<span>Sign Out</span>
												</button>
											</div>
										</div>
									)}
								</div>
							) : (
								<Link
									href="/auth"
									style={{ fontFamily: '"BentonSansBook", sans-serif' }}
									className="flex items-center gap-2 px-5 py-2.5 bg-[#ec1d24] text-white text-base rounded-lg hover:bg-[#d01920] transition-colors duration-200 shadow-lg shadow-[#ec1d24]/20"
								>
									Sign In
								</Link>
							)}
						</div>

						{/* Mobile Right Section */}
						<div className="flex lg:hidden items-center gap-3">
								{session ? (
									<div className="w-8 h-8 rounded-full bg-linear-to-br from-[#ec1d24] to-[#ff6b6b] flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-[#ec1d24]/30 ring-2 ring-[#ec1d24]/20">
										{session.user?.name?.charAt(0)?.toUpperCase() || "U"}
									</div>
							) : (
								<Link
									href="/auth"
									className="px-4 py-2 bg-[#ec1d24] text-white font-medium text-sm rounded-lg hover:bg-[#d01920] transition-colors"
								>
									Sign In
								</Link>
							)}

							{/* Mobile Menu Toggle */}
							<button
								type="button"
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
								className="flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-white/10 transition-colors"
								aria-label="Toggle menu"
								aria-expanded={isMobileMenuOpen}
							>
								<span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-1" : ""}`} />
								<span className={`block w-5 h-0.5 bg-white my-1 transition-all duration-300 ${isMobileMenuOpen ? "opacity-0 scale-0" : ""}`} />
								<span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-1" : ""}`} />
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Mobile Menu Overlay */}
			<div
				className={`lg:hidden fixed inset-0 z-9999 transition-all duration-300 ${
					isMobileMenuOpen ? "visible" : "invisible pointer-events-none"
				}`}
			>
				{/* Backdrop */}
				<div
					className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
						isMobileMenuOpen ? "opacity-100" : "opacity-0"
					}`}
					onClick={closeMobileMenu}
					aria-hidden="true"
				/>

				{/* Menu Panel */}
				<div
					className={`absolute top-0 right-0 h-full w-full max-w-xs bg-[#0a0a0a] border-l border-white/10 shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${
						isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
					}`}
				>
					{/* Menu Header */}
					<div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
						<Link href="/" onClick={closeMobileMenu}>
							<Image
								src="/images/MainLogo.svg"
								alt="MCU Redefined"
								width={100}
								height={32}
								className="h-8 w-auto"
								priority
							/>
						</Link>
						<button
							type="button"
							onClick={closeMobileMenu}
							className="flex items-center justify-center w-10 h-10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
							aria-label="Close menu"
						>
							{Icons.close}
						</button>
					</div>

					{/* User Info (if logged in) */}
					{session && (
							<div className="px-4 py-4 border-b border-white/10 bg-linear-to-r from-[#ec1d24]/10 to-transparent">
								<div className="flex items-center gap-3">
									<div className="w-11 h-11 rounded-full bg-linear-to-br from-[#ec1d24] to-[#ff6b6b] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#ec1d24]/30">
										{session.user?.name?.charAt(0)?.toUpperCase() || "U"}
									</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-white truncate">{session.user?.name}</p>
									<p className="text-xs text-white/50 truncate">@{session.user?.username}</p>
								</div>
								{isAdmin && (
									<span className="px-2 py-0.5 text-[10px] font-semibold uppercase text-[#ec1d24] bg-[#ec1d24]/10 rounded border border-[#ec1d24]/20">
										Admin
									</span>
								)}
							</div>
						</div>
					)}

					{/* Navigation Links */}
					<nav className="px-2 py-4">
						<div className="space-y-1">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									onClick={closeMobileMenu}
									style={{ fontFamily: '"BentonSansBook", sans-serif' }}
									className={`block px-4 py-3 text-lg rounded-lg transition-colors ${
										isActive(link.href)
											? "text-[#ec1d24] bg-[#ec1d24]/10"
											: "text-white/80 hover:text-white hover:bg-white/5"
									}`}
								>
									{link.label}
								</Link>
							))}
						</div>

						{/* Profile Link */}
						{session && (
							<div className="mt-4 pt-4 border-t border-white/10">
								<Link
									href={`/profile/${session.user?.username}`}
									onClick={closeMobileMenu}
									className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
								>
									{Icons.profile}
									<span>Your Profile</span>
								</Link>
							</div>
						)}

						{/* Admin Section */}
						{isAdmin && (
							<div className="mt-4 pt-4 border-t border-white/10">
								<p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/40">
									Admin Panel
								</p>
								<div className="space-y-1">
									{adminLinks.map((link) => (
										<Link
											key={link.href}
											href={link.href}
											onClick={closeMobileMenu}
											className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white/80 hover:text-[#ec1d24] hover:bg-[#ec1d24]/5 rounded-lg transition-colors"
										>
											{Icons.admin}
											<span>Manage {link.label}</span>
										</Link>
									))}
								</div>
							</div>
						)}
					</nav>

					{/* Bottom Actions */}
					<div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#0a0a0a]">
						{session ? (
							<button
								onClick={() => {
									closeMobileMenu();
									handleSignOut();
								}}
								className="flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-medium text-white/80 hover:text-[#ec1d24] bg-white/5 hover:bg-[#ec1d24]/10 rounded-lg transition-colors"
								type="button"
							>
								{Icons.signOut}
								<span>Sign Out</span>
							</button>
						) : (
							<Link
								href="/auth"
								onClick={closeMobileMenu}
								className="flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-medium text-white bg-[#ec1d24] hover:bg-[#d01920] rounded-lg transition-colors"
							>
								Sign In
							</Link>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

export default Header;
