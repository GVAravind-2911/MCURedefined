'use client'

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";

function Header(): ReactNode {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
		document.body.classList.toggle("lock-scroll"); // Assuming you have this CSS class
	};

	return (
		<header data-thq="thq-navbar" className="home-navbar">
			<img src="/images/MainLogo.png" className="home-logo" alt="Main Logo" />
			<div
				data-thq="thq-navbar-nav"
				data-role="Nav"
				className="home-desktop-menu"
			>
				<nav
					data-thq="thq-navbar-nav-links"
					data-role="Nav"
					className="home-nav"
				>
					<Link href="/">
						<button type="button" name="button" value="home" className="home-button">
							HOME
						</button>
					</Link>
					<Link href="/reviews">
						<button type="button" name="button" value="reviews" className="home-button">
							REVIEWS
						</button>
					</Link>
					<Link href="/blogs">
						<button type="button" name="button" value="blog" className="home-button">
							BLOG
						</button>
					</Link>
					<Link href="/release-slate">
						<button type="button" name="button" value="release_slate" className="home-button">
							RELEASE SLATE
						</button>
					</Link>
					<Link href="/collaborate">
						<button type="button" name="button" value="collaborate" className="home-button">
							COLLABORATE
						</button>
					</Link>
				</nav>
			</div>

			<div data-thq="thq-navbar-btn-group" className="home-btn-group">
				<div className="home-socials">
					<Link
						href="https://twitter.com/Mcu_Redefined"
						target="_blank"
						rel="noreferrer noopener"
					>
						<img
							alt="Twitter"
							src="/images/Icons/twitter.svg"
							className="imagetwitter"
						/>
					</Link>
					<Link
						href="https://discord.com/invite/KwG9WBup"
						target="_blank"
						rel="noreferrer noopener"
					>
						<img
							alt="Discord"
							src="/images/Icons/discord.svg"
							className="imagediscord"
						/>
					</Link>
					<Link
						href="https://www.instagram.com/mcu_redefined/"
						target="_blank"
						rel="noreferrer noopener"
					>
						<img
							alt="Instagram"
							src="/images/Icons/instagram.svg"
							className="imageinsta"
						/>
					</Link>
				</div>
			</div>

			<div data-thq="thq-burger-menu" className="home-burger-menu">
				<button type="button" className="home-button5" onClick={toggleMobileMenu}>
					<svg viewBox="0 0 100 100" width={20} height={20} className="svgmenu">
						<title>Menu</title>
						<rect width={100} height={20} rx={10} />
						<rect y={30} width={100} height={20} rx={10} />
						<rect y={60} width={100} height={20} rx={10} />
					</svg>
				</button>
			</div>

			<div
				data-thq="thq-mobile-menu"
				className={`home-mobile-menu ${isMobileMenuOpen ? "show" : ""}`}
			>
				{/* Conditionally add 'show' class based on isMobileMenuOpen state */}
				<div
					data-thq="thq-mobile-menu-nav"
					data-role="Nav"
					className="home-nav1"
				>
					<div className="home-container2">
						<span className="home-logo1">MCU REDEFINED</span>
						<button
							type="button"
							data-thq="thq-close-menu"
							className="home-menu-close"
							onClick={toggleMobileMenu}
							onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleMobileMenu(); }}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								x="0px"
								y="0px"
								width={39}
								height={35}
								viewBox="0 0 30 30"
								style={{ fill: "#ec1d24" }}
							>
								<title>Close</title>
								<path d="M 7 4 C 6.744125 4 6.4879687 4.0974687 6.2929688 4.2929688 L 4.2929688 6.2929688 C 3.9019687 6.6839688 3.9019687 7.3170313 4.2929688 7.7070312 L 11.585938 15 L 4.2929688 22.292969 C 3.9019687 22.683969 3.9019687 23.317031 4.2929688 23.707031 L 6.2929688 25.707031 C 6.6839688 26.098031 7.3170313 26.098031 7.7070312 25.707031 L 15 18.414062 L 22.292969 25.707031 C 22.682969 26.098031 23.317031 26.098031 23.707031 25.707031 L 25.707031 23.707031 C 26.098031 23.316031 26.098031 22.682969 25.707031 22.292969 L 18.414062 15 L 25.707031 7.7070312 C 26.098031 7.3170312 26.098031 6.6829688 25.707031 6.2929688 L 23.707031 4.2929688 C 23.316031 3.9019687 22.682969 3.9019687 22.292969 4.2929688 L 15 11.585938 L 7.7070312 4.2929688 C 7.5115312 4.0974687 7.255875 4 7 4 z"/>
							</svg>
						</button>
					</div>

					<nav
						data-thq="thq-mobile-menu-nav-links"
						data-role="Nav"
						className="home-nav2"
					>
						<div className="home-navbuttons">
							<Link href="/" className="home-text" name="button" value="home">
								Home
							</Link>
							<Link
								href="/reviews"
								className="home-text"
								name="button"
								value="reviews"
							>
								Reviews
							</Link>
							<Link 
								href="/blogs"
								className="home-text" 
								name="button" 
								value="blog"
							>
								Blog
							</Link>
							<Link
								href="/release-slate"
								className="home-text"
								name="button"
								value="release_slate"
							>
								Timeline
							</Link>
							<Link
								href="/collaborate"
								className="home-text"
								name="button"
								value="collaborate"
							>
								Collaborate
							</Link>
						</div>
					</nav>

					<div className="home-icon-group">
						<Link
							href="https://www.instagram.com/mcu_redefined/"
							target="_blank"
							rel="noreferrer noopener"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								x="0px"
								y="0px"
								width={200}
								height={200}
								viewBox="0 0 50 50"
								className="home-imageinstanav"
							>
								<title>Insta</title>
								<path d="M 16 3 C 8.83 3 3 8.83 3 16 L 3 34 C 3 41.17 8.83 47 16 47 L 34 47 C 41.17 47 47 41.17 47 34 L 47 16 C 47 8.83 41.17 3 34 3 L 16 3 z M 37 11 C 38.1 11 39 11.9 39 13 C 39 14.1 38.1 15 37 15 C 35.9 15 35 14.1 35 13 C 35 11.9 35.9 11 37 11 z M 25 14 C 31.07 14 36 18.93 36 25 C 36 31.07 31.07 36 25 36 C 18.93 36 14 31.07 14 25 C 14 18.93 18.93 14 25 14 z M 25 16 C 20.04 16 16 20.04 16 25 C 16 29.96 20.04 34 25 34 C 29.96 34 34 29.96 34 25 C 34 20.04 29.96 16 25 16 z" />
							</svg>
						</Link>
						<Link
							href="https://discord.com/invite/KwG9WBup"
							target="_blank"
							rel="noreferrer noopener"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								x="0px"
								y="0px"
								width={200}
								height={200}
								viewBox="0 0 50 50"
								className="home-imagediscordnav"
							>
								<title>Discord</title>
								<path d="M 41.625 10.769531 C 37.644531 7.566406 31.347656 7.023438 31.078125 7.003906 C 30.660156 6.96875 30.261719 7.203125 30.089844 7.589844 C 30.074219 7.613281 29.9375 7.929688 29.785156 8.421875 C 32.417969 8.867188 35.652344 9.761719 38.578125 11.578125 C 39.046875 11.867188 39.191406 12.484375 38.902344 12.953125 C 38.710938 13.261719 38.386719 13.429688 38.050781 13.429688 C 37.871094 13.429688 37.6875 13.378906 37.523438 13.277344 C 32.492188 10.15625 26.210938 10 25 10 C 23.789063 10 17.503906 10.15625 12.476563 13.277344 C 12.007813 13.570313 11.390625 13.425781 11.101563 12.957031 C 10.808594 12.484375 10.953125 11.871094 11.421875 11.578125 C 14.347656 9.765625 17.582031 8.867188 20.214844 8.425781 C 20.0625 7.929688 19.925781 7.617188 19.914063 7.589844 C 19.738281 7.203125 19.34375 6.960938 18.921875 7.003906 C 18.652344 7.023438 12.355469 7.566406 8.320313 10.8125 C 6.214844 12.761719 2 24.152344 2 34 C 2 34.175781 2.046875 34.34375 2.132813 34.496094 C 5.039063 39.605469 12.972656 40.941406 14.78125 41 C 14.789063 41 14.800781 41 14.8125 41 C 15.132813 41 15.433594 40.847656 15.621094 40.589844 L 17.449219 38.074219 C 12.515625 36.800781 9.996094 34.636719 9.851563 34.507813 C 9.4375 34.144531 9.398438 33.511719 9.765625 33.097656 C 10.128906 32.683594 10.761719 32.644531 11.175781 33.007813 C 11.234375 33.0625 15.875 37 25 37 C 34.140625 37 38.78125 33.046875 38.828125 33.007813 C 39.242188 32.648438 39.871094 32.683594 40.238281 33.101563 C 40.601563 33.515625 40.5625 34.144531 40.148438 34.507813 C 40.003906 34.636719 37.484375 36.800781 32.550781 38.074219 L 34.378906 40.589844 C 34.566406 40.847656 34.867188 41 35.1875 41 C 35.199219 41 35.210938 41 35.21875 41 C 37.027344 40.941406 44.960938 39.605469 47.867188 34.496094 C 47.953125 34.34375 48 34.175781 48 34 C 48 24.152344 43.785156 12.761719 41.625 10.769531 Z M 18.5 30 C 16.566406 30 15 28.210938 15 26 C 15 23.789063 16.566406 22 18.5 22 C 20.433594 22 22 23.789063 22 26 C 22 28.210938 20.433594 30 18.5 30 Z M 31.5 30 C 29.566406 30 28 28.210938 28 26 C 28 23.789063 29.566406 22 31.5 22 C 33.433594 22 35 23.789063 35 26 C 35 28.210938 33.433594 30 31.5 30 Z" />
							</svg>
						</Link>
						<a
							href="https://twitter.com/Mcu_Redefined"
							target="_blank"
							rel="noreferrer noopener"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								x="0px"
								y="0px"
								width={200}
								height={200}
								viewBox="0 0 50 50"
								className="home-imagetwitternav"
							>
								<title>Twitter</title>
								<path d="M 11 4 C 7.134 4 4 7.134 4 11 L 4 39 C 4 42.866 7.134 46 11 46 L 39 46 C 42.866 46 46 42.866 46 39 L 46 11 C 46 7.134 42.866 4 39 4 L 11 4 z M 13.085938 13 L 21.023438 13 L 26.660156 21.009766 L 33.5 13 L 36 13 L 27.789062 22.613281 L 37.914062 37 L 29.978516 37 L 23.4375 27.707031 L 15.5 37 L 13 37 L 22.308594 26.103516 L 13.085938 13 z M 16.914062 15 L 31.021484 35 L 34.085938 35 L 19.978516 15 L 16.914062 15 z" />
							</svg>
						</a>
					</div>
				</div>
			</div>
		</header>
	);
}

export default Header;
