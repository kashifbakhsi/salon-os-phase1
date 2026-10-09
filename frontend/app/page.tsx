"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import { api } from "../lib/api";
import { Salon } from "../lib/types";

export default function HomePage() {
  const [salons, setSalons] =
    useState<Salon[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    async function loadSalons() {
      try {
        const data =
          await api<Salon[]>(
            "/salons",
          );

        setSalons(data);
      } catch (error) {
        console.error(
          "Unable to load salons:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    loadSalons();
  }, []);

  const filteredSalons =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return salons;
      }

      return salons.filter(
        (salon) =>
          salon.name
            .toLowerCase()
            .includes(value) ||
          salon.city
            ?.toLowerCase()
            .includes(value) ||
          salon.state
            ?.toLowerCase()
            .includes(value),
      );
    }, [salons, search]);

  return (
    <div className="home-page">
      {/* HERO */}

      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-copy">
            <div className="hero-badge">
              <span>✦</span>
              Your beauty, your schedule
            </div>

            <h1>
              Your next great
              <span>
                salon experience
              </span>
              starts here.
            </h1>

            <p>
              Discover trusted salons,
              choose your service,
              pick your professional
              and book your appointment
              in just a few clicks.
            </p>

            <div className="hero-actions">
              <a
                href="#salons"
                className="hero-primary"
              >
                Explore Salons
                <span>→</span>
              </a>

              <Link
                href="/register"
                className="hero-secondary"
              >
                Create free account
              </Link>
            </div>

            <div className="hero-trust">
              <div className="trust-avatars">
                <span>K</span>
                <span>A</span>
                <span>R</span>
                <span>+</span>
              </div>

              <div>
                <strong>
                  Simple & convenient
                </strong>

                <small>
                  Book whenever it suits you
                </small>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-glow" />

            <div className="hero-main-card">
              <div className="hero-card-top">
                <span>
                  TODAY'S EXPERIENCE
                </span>

                <span className="live-dot">
                  ● Available
                </span>
              </div>

              <div className="hero-salon-preview">
                <div className="preview-image">
                  ✂
                </div>

                <div>
                  <span>
                    PREMIUM SALON
                  </span>

                  <h3>
                    Your perfect
                    appointment
                  </h3>

                  <p>
                    Professional service.
                    Zero waiting.
                  </p>
                </div>
              </div>

              <div className="preview-booking">
                <div>
                  <small>
                    Service
                  </small>

                  <strong>
                    Hair Styling
                  </strong>
                </div>

                <div>
                  <small>
                    Duration
                  </small>

                  <strong>
                    60 min
                  </strong>
                </div>

                <div className="preview-check">
                  ✓
                </div>
              </div>
            </div>

            <div className="floating-card floating-card-one">
              <span className="floating-icon">
                ✓
              </span>

              <div>
                <strong>
                  Easy booking
                </strong>

                <small>
                  Confirm in seconds
                </small>
              </div>
            </div>

            <div className="floating-card floating-card-two">
              <strong>
                24/7
              </strong>

              <small>
                Online booking
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}

      <section className="stats-section">
        <div className="stats-container">
          <div>
            <strong>
              {salons.length || "—"}
            </strong>

            <span>
              Active salons
            </span>
          </div>

          <div>
            <strong>
              100%
            </strong>

            <span>
              Online booking
            </span>
          </div>

          <div>
            <strong>
              24/7
            </strong>

            <span>
              Booking access
            </span>
          </div>

          <div>
            <strong>
              1 min
            </strong>

            <span>
              Average booking
            </span>
          </div>
        </div>
      </section>

      {/* SALONS */}

      <section
        id="salons"
        className="salons-section"
      >
        <div className="section-container">
          <div className="section-header">
            <div>
              <span className="section-kicker">
                DISCOVER
              </span>

              <h2>
                Find your salon
              </h2>

              <p>
                Browse our available
                salons and find the
                right experience for
                you.
              </p>
            </div>

            <div className="search-box">
              <span>⌕</span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search salon or city..."
              />
            </div>
          </div>

          {loading ? (
            <div className="home-loading">
              <div className="spinner" />

              <p>
                Finding available
                salons...
              </p>
            </div>
          ) : filteredSalons.length ===
            0 ? (
            <div className="home-empty">
              <div>
                ⌕
              </div>

              <h3>
                No salons found
              </h3>

              <p>
                Try another salon name
                or city.
              </p>
            </div>
          ) : (
            <div className="salon-grid">
              {filteredSalons.map(
                (salon) => (
                  <Link
                    href={`/salons/${salon.slug}`}
                    className="salon-card"
                    key={salon.id}
                  >
                    <div className="salon-cover">
                      <div className="salon-pattern">
                        ✦
                      </div>

                      <span className="salon-status">
                        ● Open
                      </span>

                      <div className="salon-initial">
                        {salon.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    </div>

                    <div className="salon-card-body">
                      <div className="salon-card-heading">
                        <div>
                          <h3>
                            {salon.name}
                          </h3>

                          <p>
                            {salon.city ||
                              "Premium salon"}
                            {salon.state
                              ? `, ${salon.state}`
                              : ""}
                          </p>
                        </div>

                        <span className="arrow-circle">
                          →
                        </span>
                      </div>

                      {salon.description && (
                        <p className="salon-description">
                          {
                            salon.description
                          }
                        </p>
                      )}

                      <div className="salon-card-footer">
                        <span>
                          ✦ Professional
                          service
                        </span>

                        <span>
                          Book now
                        </span>
                      </div>
                    </div>
                  </Link>
                ),
              )}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section className="how-section">
        <div className="section-container">
          <div className="center-heading">
            <span className="section-kicker">
              HOW IT WORKS
            </span>

            <h2>
              Booking made beautifully
              simple.
            </h2>

            <p>
              Everything you need for
              your next salon visit,
              without the phone calls.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number-large">
                01
              </span>

              <div className="step-icon">
                ⌕
              </div>

              <h3>
                Find a salon
              </h3>

              <p>
                Browse salons and
                discover the services
                available near you.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number-large">
                02
              </span>

              <div className="step-icon">
                ✂
              </div>

              <h3>
                Choose your service
              </h3>

              <p>
                Pick your preferred
                service and professional.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number-large">
                03
              </span>

              <div className="step-icon">
                ✓
              </div>

              <h3>
                Book your time
              </h3>

              <p>
                Select an available
                slot and confirm your
                appointment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="cta-section">
        <div className="cta-container">
          <div>
            <span className="section-kicker">
              READY WHEN YOU ARE
            </span>

            <h2>
              Your next appointment
              is only a few clicks away.
            </h2>

            <p>
              Create your free SalonOS
              account and start booking
              today.
            </p>
          </div>

          <Link
            href="/register"
            className="cta-button"
          >
            Get Started
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="brand">
              <span className="brand-icon">
                ✦
              </span>

              SalonOS
            </div>

            <p>
              Simple, modern salon
              booking for everyone.
            </p>
          </div>

          <div className="footer-links">
            <Link href="/">
              Explore
            </Link>

            <Link href="/register">
              Register
            </Link>

            <Link href="/login">
              Login
            </Link>
          </div>

          <span className="copyright">
            © 2026 SalonOS
          </span>
        </div>
      </footer>
    </div>
  );
}