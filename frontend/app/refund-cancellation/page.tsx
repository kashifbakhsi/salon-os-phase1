import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RefundCancellationPage() {
  return (
    <>

      <main className="info-page">
        <div className="legal-page-container">

          <div className="legal-header">
            <span className="info-eyebrow">
              BOOKING POLICY
            </span>

            <h1>
              Refund & Cancellation
            </h1>

            <p>
              Please review the following information
              before cancelling an appointment or
              requesting a refund.
            </p>

            <span className="legal-updated">
              Last updated: September 2026
            </span>
          </div>

          <article className="legal-content">

            <section>
              <h2>
                1. Appointment cancellation
              </h2>

              <p>
                Cancellation availability may depend on
                the salon, service, appointment status,
                and the time remaining before the scheduled
                appointment.
              </p>
            </section>

            <section>
              <h2>
                2. Refund eligibility
              </h2>

              <p>
                Where a booking is eligible for a refund,
                the applicable refund amount and processing
                conditions may depend on the booking and
                the relevant salon policy.
              </p>
            </section>

            <section>
              <h2>
                3. Salon cancellation
              </h2>

              <p>
                If a salon cancels or is unable to fulfil
                a confirmed appointment, customers should
                contact SalonOS support for assistance with
                the applicable resolution.
              </p>
            </section>

            <section>
              <h2>
                4. Failed or unsuccessful payments
              </h2>

              <p>
                If a payment fails or an amount is debited
                without the booking being successfully
                confirmed, please contact support with
                the relevant booking details so the
                transaction can be reviewed.
              </p>
            </section>

            <section>
              <h2>
                5. Refund processing
              </h2>

              <p>
                Approved refunds are processed through the
                applicable payment method. The time taken
                for the amount to appear in your account
                may depend on the payment provider or
                banking institution.
              </p>
            </section>

            <section>
              <h2>
                6. Need help?
              </h2>

              <p>
                If you believe a refund is due or need
                assistance with a cancellation, please
                contact our support team with your booking
                information.
              </p>
            </section>

          </article>

        </div>
      </main>

    </>
  );
}