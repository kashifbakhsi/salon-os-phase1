import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
     

      <main className="info-page">
        <div className="legal-page-container">

          <div className="legal-header">
            <span className="info-eyebrow">
              LEGAL
            </span>

            <h1>
              Privacy Policy
            </h1>

            <p>
              Your privacy matters to us. This policy
              explains how SalonOS handles information
              when you use our platform.
            </p>

            <span className="legal-updated">
              Last updated: September 2026
            </span>
          </div>

          <article className="legal-content">

            <section>
              <h2>
                1. Information we collect
              </h2>

              <p>
                When you create an account or use
                SalonOS, we may collect information
                such as your name, email address,
                phone number, account details, and
                appointment information.
              </p>
            </section>

            <section>
              <h2>
                2. How we use your information
              </h2>

              <p>
                Information may be used to create and
                manage your account, process bookings,
                communicate important appointment
                information, provide customer support,
                and improve the SalonOS experience.
              </p>
            </section>

            <section>
              <h2>
                3. Appointment information
              </h2>

              <p>
                Information related to your salon
                appointments may be used to coordinate
                your booking and provide relevant
                service information.
              </p>
            </section>

            <section>
              <h2>
                4. Data security
              </h2>

              <p>
                We take reasonable measures to protect
                information handled through SalonOS.
                However, no internet-based service can
                guarantee absolute security.
              </p>
            </section>

            <section>
              <h2>
                5. Third-party services
              </h2>

              <p>
                SalonOS may use trusted third-party
                services for infrastructure, payments,
                communication, analytics, or other
                operational requirements. Such services
                may process information according to
                their own privacy policies.
              </p>
            </section>

            <section>
              <h2>
                6. Your choices
              </h2>

              <p>
                If you have questions regarding your
                account information or wish to request
                appropriate changes, please contact us.
              </p>
            </section>

            <section>
              <h2>
                7. Contact
              </h2>

              <p>
                For privacy-related questions, please
                contact the SalonOS support team through
                our Contact Us page.
              </p>
            </section>

          </article>

        </div>
      </main>

      
    </>
  );
}