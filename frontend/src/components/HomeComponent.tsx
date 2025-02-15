import type { ReactNode } from 'react'
import React from "react";
import Link from 'next/link';
import Image from 'next/image';

function Home() : ReactNode {

    return (
        <div>
            <div className="fade-in">
                <section className="home-hero">
                    <div className="home-heading">
                        <h1 className="home-header">
                            <span className="home-text05">REDEFINE YOUR</span>
                            <br />
                            <span style={{ color: "#EC1D24" }}>MCU</span>
                            <span className="home-text05"> EXPERIENCE</span>
                            <br />
                        </h1>
                        <p className="home-caption">
                            Stay Ahead on the MCU with Exclusive Updates on News, Leaks,
                            Trailers, and More
                        </p>
                    </div>
                    <Image
                        alt="mcuanniversaryimage"
                        src="/images/marvel/marvel-class-photo-1920x1080-1500w.jpg"
                        className="home-divider-image"
                        width={1280}
                        height={720}
                        style={{objectFit: "contain"}}
                    />  
                </section>

                <section className="home-description">
                    <div className="home-container4">
                        <p className="home-paragraph">
                            <span>Welcome to </span>
                            <span className="home-text10">MCU REDEFINED</span>
                            <span>
                                , the fanpage dedicated to all Marvel enthusiasts! Immerse
                                yourself in a world where heroes and villains collide, as we bring
                                you the latest updates, news, and exclusive content straight from
                                the Marvel Universe. From epic battles to heartwarming moments, we
                                are committed to delivering a fan-centric experience like no
                                other. Join us as we celebrate the iconic characters, unravel
                                hidden secrets, and delve deep into the cinematic marvels that
                                have redefined the superhero genre. Be part of our vibrant
                                community and let the Marvel fandom thrive at MCU Redefined!
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
                                    <p className="home-description2">
                                        Thunderbolts, Blade, Wonder-Man Have halted Production due to
                                        the WGA Strike. Deadpool 3, Captain America: New World Order
                                        are in production.
                                    </p>
                                </div>
                                <Link href="/blogs">
                                    <button
                                        type="button"
                                        className="home-learn button"
                                        name="button"
                                    >
                                        <span className="home-text15">Learn more</span>
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
                            <Image
                                alt="dailybugleimage"
                                src="/images/DailyBugle.svg"
                                className="home-image03"
                                width={300}
                                height={300}
                            />
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
                            style={{objectFit: "contain"}}
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
                                    objectFit='contain'
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
                                    objectFit='contain'
                                />
                            </div>
                        </div>
                    </div>
                    <div className="home-column2">
                        <div className="home-card11">
                            <div className="home-content12">
                                <h2 className="home-header5">Collaborate</h2>
                                <p className="home-description3">
                                    Are you a passionate Marvel enthusiast with theories swirling in
                                    your mind, eager to share your unique perspectives and insights
                                    with fellow fans? Look no further! MCU Redefined invites you to
                                    collaborate with us and be a part of our vibrant community that
                                    celebrates theories and speculation.
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