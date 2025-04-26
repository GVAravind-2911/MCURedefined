'use client';

// Footer.tsx
import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

function Footer(): ReactNode {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 992);
    };

    handleResize(); // check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <footer className="site-footer">
      <div className="footer-divider" />

      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-links">
            {isMobile && (
              <div className="footer-links-column footer-nav-column">
                <h3 className="footer-heading">Navigate</h3>
                <Link href="/" className="footer-link">Home</Link>
                <Link href="/reviews" className="footer-link">Reviews</Link>
                <Link href="/blogs" className="footer-link">Blog</Link>
                <Link href="/release-slate" className="footer-link">Release Slate</Link>
                <Link href="/collaborate" className="footer-link">Collaborate</Link>
              </div>
            )}

            <div
              className={`footer-contact-social-wrapper ${isMobile ? "stacked" : "row"}`}
            >
              <div className="footer-links-column footer-contact-section">
                <h3 className="footer-heading">Contact Us</h3>
                <a href="mailto:mcuredefined@gmail.com" className="footer-link">
                  <span className="footer-icon">✉️</span>
                  mcuredefined@gmail.com
                </a>
                <p className="footer-text">We&apos;d love to hear from you!</p>
                <p className="footer-text">Share your thoughts and feedback.</p>
              </div>

              <div className="footer-links-column footer-social-section">
                <h3 className="footer-heading">Follow Us</h3>
                <div className="footer-socials">
                  <a href="https://twitter.com/Mcu_Redefined" target="_blank" rel="noreferrer noopener" className="social-icon-link" aria-label="Twitter">
                    <Image alt="Twitter" src="/images/Icons/twitter.svg" className="social-icon twitter" width={24} height={24} />
                  </a>
                  <a href="https://discord.com/invite/KwG9WBup" target="_blank" rel="noreferrer noopener" className="social-icon-link" aria-label="Discord">
                    <Image alt="Discord" src="/images/Icons/discord.svg" className="social-icon discord" width={24} height={24} />
                  </a>
                  <a href="https://www.instagram.com/mcu_redefined/" target="_blank" rel="noreferrer noopener" className="social-icon-link" aria-label="Instagram">
                    <Image alt="Instagram" src="/images/Icons/instagram.svg" className="social-icon instagram" width={24} height={24} />
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-copyright">
          <p>&copy; {new Date().getFullYear()} MCU Redefined. All rights reserved.</p>
        </div>
        <p className="footer-tagline">Unleashing Marvel Magic, One Fan at a Time!</p>
        <div className="footer-legal-container">
          <div className="footer-legal">
            <Link href="/privacy" className="footer-legal-link">Privacy Policy</Link>
            <Link href="/terms" className="footer-legal-link">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
