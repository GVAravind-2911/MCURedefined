"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

const HeroSection: React.FC = () => {
    const heroRef = useRef<HTMLDivElement>(null);

    // Add parallax scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            if (heroRef.current) {
                const image = heroRef.current.querySelector('.home-divider-image') as HTMLElement;
                if (image) {
                    // Move image slower than scroll rate for parallax
                    image.style.transform = `scale(1.05) translateY(${scrollPosition * 0.15}px)`;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section className="home-hero" ref={heroRef}>
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
            <div className="home-divider-image-container">
                <Image
                    alt="mcuanniversaryimage"
                    src="/images/marvel/marvel-class-photo-1920x1080-1500w.jpg"
                    className="home-divider-image"
                    width={1920}
                    height={1080}
                    priority
                />
            </div>
        </section>
    );
};

export default HeroSection;