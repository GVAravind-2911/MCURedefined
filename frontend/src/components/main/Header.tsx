"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

interface HeaderProps {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	session: any;
}

function Header({ session }: HeaderProps): ReactNode {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
	const [isScrolled, setIsScrolled] = useState<boolean>(false);

	// Use media queries in CSS instead of these state variables
	const router = useRouter();
	const pathname = usePathname();

	// Keep this useEffect for scroll detection
	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Keep this useEffect for managing body overflow
	useEffect(() => {
		document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [isMobileMenuOpen]);

	const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
	const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
	const closeMobileMenu = () => setIsMobileMenuOpen(false);

	const isActive = (path: string) => {
		if (path === "/") {
			return pathname === "/";
		}
		return pathname.startsWith(path);
	};

	return (
		<header className={`main-header ${isScrolled ? "scrolled" : ""}`}>
			<div className="header-container">
				<Link href="/" className="logo-container">
					<Image
						src="/images/MainLogo.svg"
						className="header-logo"
						alt="MCU Redefined Logo"
						width={150}
						height={50}
						priority
					/>
				</Link>

				<nav className="desktop-nav">
					<ul className="nav-links">
						<li>
							<Link
								href="/"
								className={`nav-link ${isActive("/") ? "active" : ""}`}
							>
								HOME
							</Link>
						</li>
						<li>
							<Link
								href="/reviews"
								className={`nav-link ${isActive("/reviews") ? "active" : ""}`}
							>
								REVIEWS
							</Link>
						</li>
						<li>
							<Link
								href="/blogs"
								className={`nav-link ${isActive("/blogs") ? "active" : ""}`}
							>
								BLOG
							</Link>
						</li>
						<li>
							<Link
								href="/release-slate"
								className={`nav-link ${isActive("/release-slate") ? "active" : ""}`}
							>
								RELEASE SLATE
							</Link>
						</li>
						<li>
							<Link
								href="/forum"
								className={`nav-link ${isActive("/forum") ? "active" : ""}`}
							>
								FORUM
							</Link>
						</li>
					</ul>
				</nav>

				<div className="header-actions">
					{session ? (
						<div className="user-dropdown">
							<button
								onClick={toggleDropdown}
								className="user-dropdown-button"
								type="button"
							>
								{/* Account icon with consistent sizing */}
								<div className="user-profile-icon">
									<svg
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										className="account-icon"
									>
										<title>Account Icon</title>
										<path
											d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
											fill="currentColor"
										/>
									</svg>
								</div>
								<span className="user-name user-name-desktop">
									{session.user?.name}
								</span>
								<svg
									className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`}
									width="12"
									height="12"
									viewBox="0 0 12 12"
								>
									<title>Dropdown Arrow</title>
									<path
										d="M2 4L6 8L10 4"
										stroke="currentColor"
										strokeWidth="2"
									/>
								</svg>
							</button>
							{isDropdownOpen && (
								<div className="dropdown-menu">
									<Link
										href="/profile"
										className="dropdown-item"
										onClick={() => setIsDropdownOpen(false)}
									>
										Profile
									</Link>
									<button
										onClick={async () => {
											try {
												await authClient.signOut();
												window.location.href = "/";
											} catch (error) {
												console.error("Sign out failed:", error);
												window.location.reload();
											}
										}}
										className="dropdown-item"
										type="button"
									>
										Sign Out
									</button>
								</div>
							)}
						</div>
					) : (
						<Link href="/auth" className="signin-button-container">
							<button className="signin-button" type="button">
								{/* Add sign-in icon for small screens */}
								<svg
									className="signin-icon"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<title>Sign In</title>
									<path
										d="M11 7L9.6 8.4L12.2 11H2V13H12.2L9.6 15.6L11 17L16 12L11 7Z"
										fill="currentColor"
									/>
									<path
										d="M20 19H12V21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3H12V5H20V19Z"
										fill="currentColor"
									/>
								</svg>
								<span>Sign In</span>
							</button>
						</Link>
					)}

					<button
						type="button"
						className="mobile-menu-toggle"
						onClick={toggleMobileMenu}
						aria-label="Toggle menu"
					>
						<span className={`hamburger ${isMobileMenuOpen ? "active" : ""}`} />
					</button>
				</div>
			</div>

			{/* Mobile menu overlay */}
			<div
				className={`mobile-menu-overlay ${isMobileMenuOpen ? "active" : ""}`}
				onClick={closeMobileMenu}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") closeMobileMenu();
				}}
			/>

			{/* Mobile menu */}
			<div className={`mobile-menu ${isMobileMenuOpen ? "active" : ""}`}>
				<div className="mobile-menu-header">
					<Link href="/" onClick={closeMobileMenu} className="mobile-logo">
						<Image
							src="/images/MainLogo.svg"
							alt="MCU Redefined Logo"
							width={120}
							height={40}
							priority
						/>
					</Link>
					<button
						type="button"
						className="close-menu-button"
						onClick={closeMobileMenu}
						aria-label="Close menu"
					>
						<svg viewBox="0 0 24 24" width="24" height="24">
							<title>Close</title>
							<path
								d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
								fill="#ec1d24"
							/>
						</svg>
					</button>
				</div>

				<nav className="mobile-nav">
					<Link href="/" className="mobile-nav-link" onClick={closeMobileMenu}>
						Home
					</Link>
					<Link
						href="/reviews"
						className="mobile-nav-link"
						onClick={closeMobileMenu}
					>
						Reviews
					</Link>
					<Link
						href="/blogs"
						className="mobile-nav-link"
						onClick={closeMobileMenu}
					>
						Blog
					</Link>
					<Link
						href="/release-slate"
						className="mobile-nav-link"
						onClick={closeMobileMenu}
					>
						Release Slate
					</Link>
					<Link
						href="/forum"
						className="mobile-nav-link"
						onClick={closeMobileMenu}
					>
						Forum
					</Link>

					{!session && (
						<Link
							href="/auth"
							className="mobile-nav-link mobile-signin"
							onClick={closeMobileMenu}
						>
							Sign In
						</Link>
					)}
				</nav>
			</div>
		</header>
	);
}

export default Header;
