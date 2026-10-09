import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <>
      

      <main className="info-page">
        <div className="contact-page-container">

          <div className="contact-hero">

            <span className="info-eyebrow">
              GET IN TOUCH
            </span>

            <h1>
              We're here to help.
            </h1>

            <p>
              Have a question about a booking, salon,
              service, or your SalonOS account? We'd
              love to hear from you.
            </p>

          </div>

          <div className="contact-grid">

            <div className="contact-card">

              <div className="contact-icon">
                ✉
              </div>

              <span>
                EMAIL SUPPORT
              </span>

              <h2>
                Customer Support
              </h2>

              <p>
                For booking questions, account assistance,
                or general support.
              </p>

              <a href="mailto:support@salonos.com">
                support@salonos.com
              </a>

            </div>

            <div className="contact-card">

              <div className="contact-icon">
                ?
              </div>

              <span>
                BOOKING HELP
              </span>

              <h2>
                Need help with a booking?
              </h2>

              <p>
                Keep your appointment details available
                when contacting support so we can assist
                you faster.
              </p>

              <a href="/appointments">
                View my appointments →
              </a>

            </div>

            <div className="contact-card">

              <div className="contact-icon">
                ✦
              </div>

              <span>
                BUSINESS
              </span>

              <h2>
                Salon partnership
              </h2>

              <p>
                Interested in bringing your salon to
                SalonOS? Get in touch with our team.
              </p>

              <a href="mailto:business@salonos.com">
                business@salonos.com
              </a>

            </div>

          </div>

          <div className="contact-note">
            <strong>
              Response time
            </strong>

            <p>
              We aim to respond to customer enquiries
              as soon as reasonably possible. For
              appointment-related issues, please include
              your booking information in your message.
            </p>
          </div>

        </div>
      </main>

      
    </>
  );
}