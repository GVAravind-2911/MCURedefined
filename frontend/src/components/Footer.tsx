import React from "react";
import type { ReactNode } from "react";
import Image from "next/image";

function Footer() : ReactNode{
	return (
		<footer className="home-footer">
			<div className="home-separator" />
			<div className="footercontainer">
				<div className="bottomlogo">
					<Image
						src="/images/FooterLogo.png"
						className="footerlogo"
						alt="Footer Logo"
						width={300}
						height={80}
						style={{objectFit: "contain"}}
					/>
				</div>
				<div className="iop">
					<span className="text31" style={{ color: "#EC1D24" }}>
						Contact Us
					</span>
					<span className="text32">
						<a href="mailto:mcuredefined@gmail.com">mcuredefined@gmail.com</a>
					</span>
				</div>
				<div className="home-socials1">
					<span className="text33" style={{ color: "#EC1D24" }}>
						Follow Us
					</span>
					<div className="footersocials">
						<a
							href="https://twitter.com/Mcu_Redefined"
							target="_blank"
							rel="noreferrer noopener"
						>
							<Image
								alt="Twitter Icon"
								src="/images/Icons/twitter.svg"
								className="imagetwitter"
								width={30}
								height={30}
							/>
						</a>
						<a
							href="https://discord.com/invite/KwG9WBup"
							target="_blank"
							rel="noreferrer noopener"
						>
							<Image
								alt="Discord Icon"
								src="/images/Icons/discord.svg"
								className="imagediscord"
								width={30}
								height={30}
							/>
						</a>
						<a
							href="https://www.instagram.com/mcu_redefined/"
							target="_blank"
							rel="noreferrer noopener"
						>
							<Image
								alt="Instagram Icon"
								src="/images/Icons/instagram.svg"
								className="imageinsta"
								width={30}
								height={30}
							/>
						</a>
					</div>
				</div>
			</div>
			<div className="home-separator" />
			<div className="tagline">
				<p>Unleashing Marvel Magic, One Fan at a Time!</p>
			</div>
		</footer>
	);
}

export default Footer;
