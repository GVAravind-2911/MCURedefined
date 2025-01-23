import React, { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";

function Home() {
    const [loading, setLoading] = useState(true);
	const [blogLatest, setBlogLatest] = useState([]);

    useEffect(() => {
        // Simulate a network request
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000); // Adjust the timeout as needed

        return () => clearTimeout(timer);
    }, []);

    return (
        <div>
            {loading ? (
                <div className="spinner">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="fade-in">
                    <section className="home-hero">
                        <div className="home-heading">
                            <h1 className="home-header">
                                <span className="home-text05">REDEFINE YOUR</span>
                                <br />
                                <span style={{ color: "#EC1D24" }}>MCU</span>
                                <span className="home-text05">EXPERIENCE</span>
                                <br />
                            </h1>
                            <p className="home-caption">
                                Stay Ahead on the MCU with Exclusive Updates on News, Leaks,
                                Trailers, and More
                            </p>
                        </div>
                        <img
                            alt="mcuanniversaryimage"
                            src="/images/marvel/marvel-class-photo-1920x1080-1500w.jpg"
                            className="home-divider-image"
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
                                    <a href="/blogs">
                                        <button
                                            type="button"
                                            className="home-learn button"
                                            name="button"
                                        >
                                            <span className="home-text15">Learn more</span>
                                            <img
                                                alt="arrowsvg"
                                                src="/images/Icons/arrow-2.svg"
                                                className="home-image02"
                                            />
                                        </button>
                                    </a>
                                </div>
                                <img
                                    alt="dailybugleimage"
                                    src="/images/DailyBugle.svg"
                                    className="home-image03"
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
                                <a href="/release-slate">
                                    <button
                                        type="button"
                                        className="home-view1 button1"
                                        name="button"
                                    >
                                        Unveil MCU Timeline
                                    </button>
                                </a>
                            </div>
                            <img
                                alt="timelineimage"
                                src="/images/Timeline.png"
                                className="home-image20"
                            />
                        </div>
                    </section>

                    <section className="home-get-yours">
                        <div className="home-row1">
                            <div className="home-column">
                                <div className="home-card09">
                                    <img
                                        alt="avengerslogo"
                                        src="/images/AvengersLogo.png"
                                        className="home-image21"
                                    />
                                </div>
                            </div>
                            <div className="home-column1">
                                <div className="home-card10">
                                    <img
                                        alt="guardianslogo"
                                        src="/images/GuardiansLogo.png"
                                        className="home-image22"
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
                                <a href="/collaborate">
                                    <button
                                        type="button"
                                        className="home-button6 button1"
                                        value="cardcollabredir"
                                        name="button"
                                    >
                                        Make Your Voice Heard
                                    </button>
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default Home;