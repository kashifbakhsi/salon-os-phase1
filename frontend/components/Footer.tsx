"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-glow" />

      <div className="footer-container">

        {/* TOP FOOTER */}

        <div className="footer-main">

          {/* BRAND */}

          <div className="footer-brand-section">

            <Link
              href="/"
              className="footer-brand"
            >
              <span className="footer-brand-icon">
                ✦
              </span>

              <span>
                SalonOS
              </span>
            </Link>

            <p className="footer-description">
              A smarter way to discover salons,
              explore services, and book your next
              appointment with confidence.
            </p>

            <Link
              href="/"
              className="footer-explore-link"
            >
              Explore salons
              <span>→</span>
            </Link>

          </div>

          {/* PRODUCT LINKS */}

          <div className="footer-column">

            <h3>
              Explore
            </h3>

            <nav
              className="footer-links"
              aria-label="Explore"
            >
              <Link href="/">
                Find a Salon
              </Link>

              <Link href="/">
                Services
              </Link>

              <Link href="/appointments">
                My Appointments
              </Link>

              <Link href="/login">
                Login
              </Link>

              <Link href="/register">
                Get Started
              </Link>
            </nav>

          </div>

          {/* COMPANY LINKS */}

          <div className="footer-column">

            <h3>
              Company
            </h3>

            <nav
              className="footer-links"
              aria-label="Company"
            >
              <Link href="/about">
                About Us
              </Link>

              <Link href="/contact">
                Contact Us
              </Link>

              <Link href="/privacy">
                Privacy Policy
              </Link>

              <Link href="/terms">
                Terms & Conditions
              </Link>
            </nav>

          </div>

          {/* SUPPORT LINKS */}

          <div className="footer-column">

            <h3>
              Support
            </h3>

            <nav
              className="footer-links"
              aria-label="Support"
            >
              <Link href="/refund-cancellation">
                Refund & Cancellation
              </Link>

              <Link href="/contact">
                Help & Support
              </Link>

              <Link href="/contact">
                Booking Assistance
              </Link>

              <Link href="/contact">
                Report an Issue
              </Link>
            </nav>

          </div>

        </div>

        {/* DIVIDER */}

        <div className="footer-divider" />

        {/* BOTTOM FOOTER */}

        <div className="footer-bottom">

          <div className="footer-copyright">

            <span>
              © {currentYear} SalonOS.
            </span>

            <span>
              All rights reserved.
            </span>

          </div>

          <div className="footer-maintained">

            <span>
              Designed & maintained by
            </span>

            <strong>
              Kashif Hussain
            </strong>

            <span className="footer-heart">
              ✦
            </span>

          </div>

          <div className="footer-legal-links">

            <Link href="/terms">
              Terms
            </Link>

            <Link href="/privacy">
              Privacy
            </Link>

            <Link href="/refund-cancellation">
              Refunds
            </Link>

          </div>

        </div>

      </div>
    </footer>
  );
}