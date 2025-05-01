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
			<div className="fade-in">
				<HeroSection />

				<section className="home-description">
					<div className="home-container4">
						<p className="home-paragraph">
							<span>Welcome to </span>
							<span className="home-text10">MCU REDEFINED</span>
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

				<section className="home-cards">
					<div className="home-card">
						<div className="home-row">
							<div className="home-main">
								<div className="home-content01">
									<h2 className="home-header1">Latest Blog Post</h2>
									{latestBlog.id === 0 ? (
										<p className="home-description2">
											Stay up-to-date with the latest news from the Marvel
											Cinematic Universe. Explore our blog for insights on
											upcoming releases, production updates, and
											behind-the-scenes content from your favorite MCU projects.
										</p>
									) : (
										<div>
											<h3 className="home-blog-title">{latestBlog.title}</h3>
											<p className="home-blog-meta">
												By {latestBlog.author} •{" "}
												{new Date(latestBlog.created_at).toLocaleDateString()}
											</p>
											{/* Removed home-description2 when blog is received */}
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
										className="home-learn button"
										name="button"
									>
										<span className="home-text15">
											{latestBlog.id === 0 ? "Browse Blogs" : "Read More"}
										</span>
										<Image
											alt="arrowsvg"
											src="/images/Icons/arrow-2.svg"
											className="home-image02"
											width={30}
											height={30}
										/>
									</button>
								</Link>
							</div>
							<div className="home-image-container">
								<Image
									alt="blog thumbnail"
									src={
										latestBlog.id === 0
											? "/images/DailyBugle.svg"
											: latestBlog.thumbnail_path.link ||
												"/images/DailyBugle.svg"
									}
									className="home-image03"
									width={240}
									height={180}
								/>
							</div>
						</div>
					</div>
				</section>
				<section className="home-join-us">
					<div className="home-content11">
						<div className="home-main2">
							<div className="home-heading2">
								<h2 className="home-header4">MCU Timeline</h2>
								<p className="home-caption10">
									Follow the Marvel Cinematic Universe Timeline: Unveil the Epic
									Saga in Chronological Order
								</p>
							</div>
							<Link href="/release-slate">
								<button
									type="button"
									className="home-view1 button1"
									name="button"
								>
									Unveil MCU Timeline
								</button>
							</Link>
						</div>
						<Image
							alt="timelineimage"
							src="/images/Timeline.png"
							className="home-image20"
							width={2300}
							height={238}
							style={{ objectFit: "contain" }}
						/>
					</div>
				</section>

				<section className="home-get-yours">
					<div className="home-row1">
						<div className="home-column">
							<div className="home-card09">
								<Image
									alt="avengerslogo"
									src="/images/AvengersLogo.png"
									className="home-image21"
									width={300}
									height={300}
									style={{ objectFit: "contain" }}
								/>
							</div>
						</div>
						<div className="home-column1">
							<div className="home-card10">
								<Image
									alt="guardianslogo"
									src="/images/GuardiansLogo.png"
									className="home-image22"
									width={300}
									height={320}
									style={{ objectFit: "contain" }}
								/>
							</div>
						</div>
					</div>
					<div className="home-column2">
						<div className="home-card11">
							<div className="home-content12">
								<h2 className="home-header5">Collaborate</h2>
								<p className="home-description3">
									Are you a passionate Marvel enthusiast with theories swirling
									in your mind, eager to share your unique perspectives and
									insights with fellow fans? Look no further! MCU Redefined
									invites you to collaborate with us and be a part of our
									vibrant community that celebrates theories and speculation.
								</p>
							</div>
							<Link href="/collaborate">
								<button
									type="button"
									className="home-button6 button1"
									value="cardcollabredir"
									name="button"
								>
									Make Your Voice Heard
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
