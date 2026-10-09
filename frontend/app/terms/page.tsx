import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <>

      <main className="info-page">
        <div className="legal-page-container">

          <div className="legal-header">
            <span className="info-eyebrow">
              LEGAL
            </span>

            <h1>
              Terms & Conditions
            </h1>

            <p>
              These terms explain the general conditions
              that apply when using the SalonOS platform.
            </p>

            <span className="legal-updated">
              Last updated: September 2026
            </span>
          </div>

          <article className="legal-content">

            <section>
              <h2>
                1. Using SalonOS
              </h2>

              <p>
                SalonOS provides a platform for users to
                discover participating salons, view
                available services, and request or manage
                appointments.
              </p>
            </section>

            <section>
              <h2>
                2. Account responsibility
              </h2>

              <p>
                Users are responsible for maintaining
                accurate account information and keeping
                their login credentials secure.
              </p>
            </section>

            <section>
              <h2>
                3. Salon services
              </h2>

              <p>
                Services, prices, availability, duration,
                and other information may be provided by
                individual salons and may change from
                time to time.
              </p>
            </section>

            <section>
              <h2>
                4. Appointments
              </h2>

              <p>
                An appointment should be considered
                confirmed only when the SalonOS booking
                flow indicates that the booking has been
                successfully confirmed.
              </p>
            </section>

            <section>
              <h2>
                5. Cancellations
              </h2>

              <p>
                Cancellation and refund conditions may
                depend on the applicable salon and
                booking. Please review the Refund &
                Cancellation Policy before completing a
                booking.
              </p>
            </section>

            <section>
              <h2>
                6. Acceptable use
              </h2>

              <p>
                Users must not misuse the platform,
                interfere with its operation, attempt
                unauthorized access, or use SalonOS for
                unlawful purposes.
              </p>
            </section>

            <section>
              <h2>
                7. Changes to these terms
              </h2>

              <p>
                We may update these terms when necessary.
                Continued use of the platform after an
                update means that the revised terms may
                apply to your use of SalonOS.
              </p>
            </section>

          </article>

        </div>
      </main>

    </>
  );
}