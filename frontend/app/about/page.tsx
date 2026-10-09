import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      

      <main className="info-page">
        <div className="info-page-container">

          <div className="info-hero">
            <span className="info-eyebrow">
              ABOUT SALONOS
            </span>

            <h1>
              Making salon booking
              <span> simple.</span>
            </h1>

            <p>
              SalonOS is designed to make discovering
              salons and managing appointments easier,
              clearer, and more convenient.
            </p>
          </div>

          <section className="info-card">
            <h2>
              Our mission
            </h2>

            <p>
              We believe booking a salon appointment
              should be simple and transparent. SalonOS
              brings salons, services, professionals,
              and customers together through a modern
              digital booking experience.
            </p>

            <p>
              Our goal is to reduce the friction around
              finding the right service, choosing a
              convenient appointment time, and keeping
              track of upcoming bookings.
            </p>
          </section>

          <section className="info-grid">

            <div className="info-card">
              <div className="info-card-icon">
                ✦
              </div>

              <h2>
                Simple
              </h2>

              <p>
                A clean and straightforward experience
                designed around the way customers
                actually book appointments.
              </p>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                ◈
              </div>

              <h2>
                Convenient
              </h2>

              <p>
                Discover services, compare options,
                and manage appointments from one place.
              </p>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                ♡
              </div>

              <h2>
                Customer focused
              </h2>

              <p>
                Every part of SalonOS is designed to
                make the customer journey easier.
              </p>
            </div>

          </section>

          <div className="info-cta">
            <h2>
              Ready for your next salon visit?
            </h2>

            <p>
              Explore available salons and find a
              service that works for you.
            </p>

            <Link
              href="/"
              className="primary-button"
            >
              Explore salons →
            </Link>
          </div>

        </div>
      </main>

      
    </>
  );
}