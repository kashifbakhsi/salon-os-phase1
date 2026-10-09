"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import type {
  Salon,
  Service,
  Staff,
} from "@/lib/types";

type SalonDetails = Salon & {
  services: Service[];
  staff: Staff[];
};

export default function SalonPage() {
  const params = useParams();

  const slug = params.slug as string;

  const [salon, setSalon] =
    useState<SalonDetails | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadSalon() {
      try {
        setLoading(true);
        setError("");

        const data = await api<SalonDetails>(
          `/salons/${slug}`,
        );

        setSalon(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load salon",
        );
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadSalon();
    }
  }, [slug]);

  /*
   * LOADING STATE
   */
  if (loading) {
    return (
      <>
        {/* <Navbar /> */}

        <main className="salon-page">
          <section className="salon-page-container">
            <div className="salon-loading">
              <div className="salon-loading-spinner" />

              <h2>Loading salon</h2>

              <p>
                Preparing the salon experience for you...
              </p>
            </div>
          </section>
        </main>
      </>
    );
  }

  /*
   * ERROR STATE
   */
  if (error || !salon) {
    return (
      <>
        {/* <Navbar /> */}

        <main className="salon-page">
          <section className="salon-page-container">
            <div className="salon-error">
              <div className="salon-error-icon">
                !
              </div>

              <h1>
                Salon unavailable
              </h1>

              <p>
                {error ||
                  "We couldn't find this salon."}
              </p>

              <Link
                href="/"
                className="primary-button salon-error-button"
              >
                ← Back to salons
              </Link>
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      {/* <Navbar /> */}

      <main className="salon-page">
        <section className="salon-page-container">

          {/* BACK NAVIGATION */}

          <Link
            href="/"
            className="salon-back-link"
          >
            <span className="salon-back-arrow">
              ←
            </span>

            Back to salons
          </Link>

          {/* SALON HERO */}

          <section className="salon-hero">

            <div className="salon-hero-content">

              <div className="salon-hero-badge">
                <span className="salon-status-dot" />
                Available for bookings
              </div>

              <h1 className="salon-title">
                {salon.name}
              </h1>

              {salon.description && (
                <p className="salon-description">
                  {salon.description}
                </p>
              )}

              <div className="salon-location">
                <span className="salon-location-icon">
                  📍
                </span>

                <span>
                  {salon.address}

                  {salon.city &&
                    `, ${salon.city}`}

                  {salon.state &&
                    `, ${salon.state}`}
                </span>
              </div>

            </div>

            <div className="salon-hero-decoration">
              <div className="salon-decoration-circle salon-decoration-circle-one" />
              <div className="salon-decoration-circle salon-decoration-circle-two" />

              <span>
                ✦
              </span>
            </div>

          </section>

          {/* QUICK STATS */}

          <section className="salon-stats">

            <div className="salon-stat-card">
              <div className="salon-stat-icon">
                ✂
              </div>

              <div>
                <strong>
                  {salon.services.length}
                </strong>

                <span>
                  Services
                </span>
              </div>
            </div>

            <div className="salon-stat-card">
              <div className="salon-stat-icon">
                👥
              </div>

              <div>
                <strong>
                  {salon.staff.length}
                </strong>

                <span>
                  Professionals
                </span>
              </div>
            </div>

            <div className="salon-stat-card">
              <div className="salon-stat-icon">
                ✦
              </div>

              <div>
                <strong>
                  Premium
                </strong>

                <span>
                  Salon experience
                </span>
              </div>
            </div>

          </section>

          {/* SERVICES */}

          <section className="salon-section">

            <div className="salon-section-heading">

              <div>
                <span className="section-eyebrow">
                  OUR SERVICES
                </span>

                <h2>
                  Choose your service
                </h2>

                <p>
                  Select a service and book an
                  appointment at your preferred time.
                </p>
              </div>

            </div>

            {salon.services.length === 0 ? (
              <div className="salon-empty">
                <div className="salon-empty-icon">
                  ✂
                </div>

                <h3>
                  No services available
                </h3>

                <p>
                  This salon hasn't added any
                  bookable services yet.
                </p>
              </div>
            ) : (
              <div className="services-grid">

                {salon.services.map(
                  (service, index) => (
                    <article
                      key={service.id}
                      className="service-card"
                    >

                      <div className="service-card-top">

                        <div className="service-number">
                          {String(index + 1).padStart(
                            2,
                            "0",
                          )}
                        </div>

                        <div className="service-icon">
                          {index % 3 === 0
                            ? "✂"
                            : index % 3 === 1
                            ? "✦"
                            : "◈"}
                        </div>

                      </div>

                      <div className="service-card-content">

                        <h3>
                          {service.name}
                        </h3>

                        <p>
                          {service.description ||
                            "Professional salon service."}
                        </p>

                        <div className="service-meta">

                          <div className="service-price">
                            <span>
                              From
                            </span>

                            <strong>
                              ₹
                              {service.price.toString()}
                            </strong>
                          </div>

                          <div className="service-duration">
                            <span>
                              ⏱
                            </span>

                            {service.durationMinutes}
                            {" "}
                            min
                          </div>

                        </div>

                        <Link
                          href={`/salons/${salon.slug}/book?serviceId=${service.id}`}
                          className="service-book-button"
                        >
                          <span>
                            Book this service
                          </span>

                          <span className="service-book-arrow">
                            →
                          </span>
                        </Link>

                      </div>

                    </article>
                  ),
                )}

              </div>
            )}

          </section>

          {/* STAFF */}

          <section className="salon-section staff-section">

            <div className="salon-section-heading">

              <div>
                <span className="section-eyebrow">
                  OUR TEAM
                </span>

                <h2>
                  Meet our professionals
                </h2>

                <p>
                  Experienced professionals dedicated
                  to making your visit exceptional.
                </p>
              </div>

            </div>

            {salon.staff.length === 0 ? (
              <div className="salon-empty">
                <div className="salon-empty-icon">
                  👤
                </div>

                <h3>
                  No staff available
                </h3>

                <p>
                  Staff information hasn't been
                  added for this salon yet.
                </p>
              </div>
            ) : (
              <div className="staff-grid">

                {salon.staff.map(
                  (staff, index) => (
                    <article
                      key={staff.id}
                      className="staff-card"
                    >

                      <div className="staff-avatar">
                        {staff.displayName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="staff-card-info">

                        <div className="staff-role">
                          SALON PROFESSIONAL
                        </div>

                        <h3>
                          {staff.displayName}
                        </h3>

                        <p className="staff-specialization">
                          {staff.specialization ||
                            "Salon professional"}
                        </p>

                        <div className="staff-experience">
                          <span>
                            ✦
                          </span>

                          {staff.experienceYears}
                          {" "}
                          years experience
                        </div>

                      </div>

                    </article>
                  ),
                )}

              </div>
            )}

          </section>

          {/* FINAL CTA */}

          <section className="salon-booking-cta">

            <div className="salon-booking-cta-decoration">
              ✦
            </div>

            <div className="salon-booking-cta-content">

              <span>
                READY FOR YOUR NEXT LOOK?
              </span>

              <h2>
                Your salon experience
                starts here.
              </h2>

              <p>
                Choose a service above and book
                your appointment in just a few steps.
              </p>

            </div>

            <Link
              href="#services"
              className="cta-button"
              onClick={(event) => {
                event.preventDefault();

                document
                  .querySelector(".salon-section")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              Explore services
              <span>
                →
              </span>
            </Link>

          </section>

        </section>
      </main>
    </>
  );
}