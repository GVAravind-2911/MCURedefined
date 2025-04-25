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
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Fix for body scroll when mobile menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <Link href="/" className="logo-container">
          <Image
            src="/images/MainLogo.svg"
            className="header-logo"
            alt="MCU Redefined Logo"
            width={180}
            height={60}
            priority
          />
        </Link>
        
        <nav className="desktop-nav">
          <ul className="nav-links">
            <li>
              <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                HOME
              </Link>
            </li>
            <li>
              <Link href="/reviews" className={`nav-link ${isActive('/reviews') ? 'active' : ''}`}>
                REVIEWS
              </Link>
            </li>
            <li>
              <Link href="/blogs" className={`nav-link ${isActive('/blogs') ? 'active' : ''}`}>
                BLOG
              </Link>
            </li>
            <li>
              <Link href="/release-slate" className={`nav-link ${isActive('/release-slate') ? 'active' : ''}`}>
                RELEASE SLATE
              </Link>
            </li>
            <li>
              <Link href="/collaborate" className={`nav-link ${isActive('/collaborate') ? 'active' : ''}`}>
                COLLABORATE
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
                <span className="user-name">{session.user?.name}</span>
                <svg
                  className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                >
                  <title>Dropdown Arrow</title>
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <Link href="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                    Profile
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        await authClient.signOut();
                        // Force a complete page reload instead of client-side navigation
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
                Sign In
              </button>
            </Link>
          )}

          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMobileMenuOpen ? "active" : ""}`}/>
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? "active" : ""}`}
        onClick={closeMobileMenu}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            closeMobileMenu();
          }
        }}
        role="button"
        tabIndex={0}
      />

      {/* Mobile menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="mobile-menu-header">
          <span className="mobile-logo">MCU REDEFINED</span>
          <button 
            type="button"
            className="close-menu-button"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <title>Close</title>
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" 
                fill="#ec1d24" />
            </svg>
          </button>
        </div>
        
        <nav className="mobile-nav">
          <Link href="/" className="mobile-nav-link" onClick={closeMobileMenu}>
            Home
          </Link>
          <Link href="/reviews" className="mobile-nav-link" onClick={closeMobileMenu}>
            Reviews
          </Link>
          <Link href="/blogs" className="mobile-nav-link" onClick={closeMobileMenu}>
            Blog
          </Link>
          <Link href="/release-slate" className="mobile-nav-link" onClick={closeMobileMenu}>
            Release Slate
          </Link>
          <Link href="/collaborate" className="mobile-nav-link" onClick={closeMobileMenu}>
            Collaborate
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;