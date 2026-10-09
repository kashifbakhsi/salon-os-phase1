"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useParams, useRouter, useSearchParams } from "next/navigation";

import { api } from "../../../../lib/api";
import {
  AvailabilitySlot,
  Salon,
  Service,
} from "../../../../lib/types";

import { useAuth } from "../../../../context/AuthContext";

type SalonDetails = Salon & {
  staff: {
    id: string;
    displayName: string;
    specialization?: string | null;
    experienceYears: number;
    active: boolean;
  }[];
};

type BookingSlot = {
  startAt: string;
  endAt: string;
  staff: SalonDetails["staff"];
};

export default function BookingPage() {
  const params = useParams();
  const searchParams =
    useSearchParams();

  const router = useRouter();

  const slug = String(params.slug);

  const serviceId =
    searchParams.get(
      "serviceId",
    );

  const {
    user,
    token,
    loading: authLoading,
    isAuthenticated,
  } = useAuth();

  const [salon, setSalon] =
    useState<SalonDetails | null>(
      null,
    );

  const [service, setService] =
    useState<Service | null>(null);

  const [date, setDate] =
    useState("");

  const [slots, setSlots] =
    useState<BookingSlot[]>([]);

  const [selectedSlot, setSelectedSlot] =
    useState<BookingSlot | null>(
      null,
    );

  const [selectedStaffId, setSelectedStaffId] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [availabilityLoading, setAvailabilityLoading] =
    useState(false);

  const [booking, setBooking] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
   * Set today's date as the minimum
   * booking date.
   */
  useEffect(() => {
    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    setDate(today);
  }, []);

  /*
   * If the customer is not logged in,
   * send them to login and preserve
   * the booking URL.
   */
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      const currentPath =
        `/salons/${slug}/book?serviceId=${serviceId}`;

      router.replace(
        `/login?redirect=${encodeURIComponent(
          currentPath,
        )}`,
      );
    }
  }, [
    authLoading,
    isAuthenticated,
    router,
    serviceId,
    slug,
  ]);

  /*
   * Load salon and selected service.
   */
  useEffect(() => {
    if (!serviceId) {
      setError(
        "No service was selected.",
      );
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const salonData =
          await api<SalonDetails>(
            `/salons/${slug}`,
          );

        const services =
          await api<Service[]>(
            `/salons/${slug}/services`,
          );

        const selectedService =
          services.find(
            (item) =>
              item.id === serviceId,
          );

        if (!selectedService) {
          throw new Error(
            "Selected service was not found.",
          );
        }

        setSalon(salonData);
        setService(selectedService);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load booking information.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug, serviceId]);

  /*
   * Load available slots when date
   * or service changes.
   */
  useEffect(() => {
    if (!date || !serviceId) {
      return;
    }

    async function loadAvailability() {
      try {
        setAvailabilityLoading(true);
        setError("");
        setSelectedSlot(null);
        setSelectedStaffId("");

        const response =
  await api<
    AvailabilitySlot[] | {
      slots?: AvailabilitySlot[];
      data?: AvailabilitySlot[];
    }
  >(
    `/salons/${slug}/availability?serviceId=${encodeURIComponent(
      serviceId,
    )}&date=${encodeURIComponent(
      date,
    )}`,
  );

const normalizedSlots = Array.isArray(
  response,
)
  ? response
  : Array.isArray(response.slots)
    ? response.slots
    : Array.isArray(response.data)
      ? response.data
      : [];

setSlots(normalizedSlots);
      } catch (error) {
        setSlots([]);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load availability.",
        );
      } finally {
        setAvailabilityLoading(false);
      }
    }

    loadAvailability();
  }, [date, serviceId, slug]);

  /*
   * Once a slot is selected, show only
   * staff available for that slot.
   */
  const availableStaff =
    useMemo(() => {
      if (!selectedSlot) {
        return [];
      }

      return selectedSlot.staff.filter(
        (staff) => staff.active,
      );
    }, [selectedSlot]);

  function formatTime(
    value: string,
  ) {
    return new Date(
      value,
    ).toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
      },
    );
  }

  function handleSlotSelect(
    slot: BookingSlot,
  ) {
    setSelectedSlot(slot);

    if (slot.staff.length === 1) {
      setSelectedStaffId(
        slot.staff[0].id,
      );
    } else {
      setSelectedStaffId("");
    }

    setSuccess("");
    setError("");
  }

  async function handleBooking() {
    if (!token || !user) {
      const currentPath =
        `/salons/${slug}/book?serviceId=${serviceId}`;

      router.push(
        `/login?redirect=${encodeURIComponent(
          currentPath,
        )}`,
      );

      return;
    }

    if (user.role !== "CUSTOMER") {
      setError(
        "Only customer accounts can create appointments.",
      );
      return;
    }

    if (!salon || !service) {
      return;
    }

    if (!selectedSlot) {
      setError(
        "Please select a time slot.",
      );
      return;
    }

    if (!selectedStaffId) {
      setError(
        "Please select a staff member.",
      );
      return;
    }

    try {
      setBooking(true);
      setError("");
      setSuccess("");

      const appointment =
        await api<{
          id: string;
          status: string;
        }>("/appointments", {
          method: "POST",

          token,

          body: JSON.stringify({
            salonId: salon.id,
            staffId: selectedStaffId,
            serviceId: service.id,
            startAt:
              selectedSlot.startAt,
            notes:
              notes.trim() || undefined,
          }),
        });

      setSuccess(
        "Appointment booked successfully!",
      );

      setTimeout(() => {
        router.push(
          `/appointments/${appointment.id}`,
        );
      }, 800);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create appointment.",
      );
    } finally {
      setBooking(false);
    }
  }

  if (
    authLoading ||
    loading
  ) {
    return (
      <div className="page-container">
        <div className="loading-card">
          <div className="spinner" />
          <p>
            Preparing your booking...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error && !salon) {
    return (
      <div className="page-container">
        <div className="empty-card">
          <h2>
            Unable to load booking
          </h2>

          <p>{error}</p>

          <button
            className="secondary-button"
            onClick={() =>
              router.back()
            }
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!salon || !service) {
    return null;
  }

  return (
    <div className="page-container booking-page">
      <div className="booking-header">
        <div>
          <p className="eyebrow">
            BOOK APPOINTMENT
          </p>

          <h1>
            Book your appointment
          </h1>

          <p className="page-subtitle">
            Choose a date, time and
            preferred professional.
          </p>
        </div>

        <div className="customer-badge">
          <span className="user-avatar">
            {user?.name
              .charAt(0)
              .toUpperCase()}
          </span>

          <div>
            <small>
              Booking as
            </small>

            <strong>
              {user?.name}
            </strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="form-error booking-message">
          {error}
        </div>
      )}

      {success && (
        <div className="form-success booking-message">
          ✓ {success}
        </div>
      )}

      <div className="booking-layout">
        <section className="booking-main">
          <div className="booking-card">
            <div className="section-heading">
              <span className="step-number">
                1
              </span>

              <div>
                <h2>Select date</h2>

                <p>
                  Choose when you'd like
                  your appointment.
                </p>
              </div>
            </div>

            <input
              type="date"
              className="date-input"
              value={date}
              min={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              onChange={(event) =>
                setDate(
                  event.target.value,
                )
              }
            />
          </div>

          <div className="booking-card">
            <div className="section-heading">
              <span className="step-number">
                2
              </span>

              <div>
                <h2>
                  Choose a time
                </h2>

                <p>
                  Available slots for{" "}
                  {date}
                </p>
              </div>
            </div>

            {availabilityLoading ? (
              <div className="inline-loading">
                <div className="spinner small" />
                Checking availability...
              </div>
            ) : slots.length === 0 ? (
              <div className="empty-slots">
                <div className="empty-icon">
                  🕐
                </div>

                <strong>
                  No slots available
                </strong>

                <p>
                  Try another date.
                </p>
              </div>
            ) : (
              <div className="slot-grid">
                {slots.map(
                  (slot) => {
                    const selected =
                      selectedSlot?.startAt ===
                      slot.startAt;

                    return (
                      <button
                        key={`${slot.startAt}-${slot.endAt}`}
                        type="button"
                        className={`slot-button ${
                          selected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          handleSlotSelect(
                            slot,
                          )
                        }
                      >
                        <span>
                          {formatTime(
                            slot.startAt,
                          )}
                        </span>

                        {slot.staff.length >
                          0 && (
                          <small>
                            {
                              slot.staff
                                .length
                            }{" "}
                            professional
                            {slot.staff
                              .length >
                            1
                              ? "s"
                              : ""}
                          </small>
                        )}
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </div>

          {selectedSlot && (
            <div className="booking-card">
              <div className="section-heading">
                <span className="step-number">
                  3
                </span>

                <div>
                  <h2>
                    Choose professional
                  </h2>

                  <p>
                    Select who you'd like
                    to book with.
                  </p>
                </div>
              </div>

              <div className="staff-grid">
                {availableStaff.map(
                  (staff) => {
                    const selected =
                      selectedStaffId ===
                      staff.id;

                    return (
                      <button
                        key={staff.id}
                        type="button"
                        className={`staff-option ${
                          selected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedStaffId(
                            staff.id,
                          )
                        }
                      >
                        <div className="staff-avatar">
                          {staff.displayName
                            .charAt(
                              0,
                            )
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {
                              staff.displayName
                            }
                          </strong>

                          <span>
                            {staff.specialization ||
                              "Salon Professional"}
                          </span>

                          <small>
                            {
                              staff.experienceYears
                            }{" "}
                            years experience
                          </small>
                        </div>

                        {selected && (
                          <span className="selected-check">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          )}

          <div className="booking-card">
            <div className="section-heading">
              <span className="step-number">
                4
              </span>

              <div>
                <h2>
                  Additional notes
                </h2>

                <p>
                  Anything you'd like the
                  salon to know?
                </p>
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value,
                )
              }
              placeholder="Example: Please keep the appointment as short as possible..."
              rows={4}
            />
          </div>
        </section>

        <aside className="booking-sidebar">
          <div className="summary-card">
            <div className="summary-label">
              YOUR APPOINTMENT
            </div>

            <h2>{service.name}</h2>

            <p className="summary-salon">
              {salon.name}
            </p>

            <div className="summary-divider" />

            <div className="summary-row">
              <span>Date</span>
              <strong>
                {date
                  ? new Date(
                      `${date}T00:00:00`,
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        weekday:
                          "short",
                        day: "numeric",
                        month:
                          "short",
                        year: "numeric",
                      },
                    )
                  : "Select date"}
              </strong>
            </div>

            <div className="summary-row">
              <span>Time</span>
              <strong>
                {selectedSlot
                  ? formatTime(
                      selectedSlot.startAt,
                    )
                  : "Select time"}
              </strong>
            </div>

            <div className="summary-row">
              <span>Professional</span>
              <strong>
                {selectedStaffId
                  ? availableStaff.find(
                      (staff) =>
                        staff.id ===
                        selectedStaffId,
                    )?.displayName
                  : "Select professional"}
              </strong>
            </div>

            <div className="summary-row">
              <span>Duration</span>
              <strong>
                {
                  service.durationMinutes
                }{" "}
                min
              </strong>
            </div>

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Total</span>

              <strong>
                ₹
                {Number(
                  service.price,
                ).toLocaleString(
                  "en-IN",
                )}
              </strong>
            </div>

            <button
              type="button"
              className="primary-button full-width booking-submit"
              onClick={handleBooking}
              disabled={
                booking ||
                !selectedSlot ||
                !selectedStaffId
              }
            >
              {booking
                ? "Confirming..."
                : "Confirm Appointment"}
            </button>

            <p className="secure-note">
              🔒 Your booking is secured
              by SalonOS
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}