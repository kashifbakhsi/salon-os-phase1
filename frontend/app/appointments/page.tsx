"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { api } from "../../lib/api";
import { Appointment } from "../../lib/types";

import { useAuth } from "../../context/AuthContext";

export default function AppointmentsPage() {
  const router = useRouter();

  const {
    token,
    loading: authLoading,
    isAuthenticated,
  } = useAuth();

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(
        `/login?redirect=${encodeURIComponent(
          "/appointments",
        )}`,
      );

      return;
    }

    if (!token) {
      return;
    }

    async function loadAppointments() {
      try {
        setLoading(true);
        setError("");

        const data =
          await api<Appointment[]>(
            "/appointments/my",
            {
              token,
            },
          );

        setAppointments(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load appointments.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, [
    authLoading,
    isAuthenticated,
    router,
    token,
  ]);

  function getStatusClass(
    status: string,
  ) {
    return `status-badge status-${status.toLowerCase()}`;
  }

  function formatDate(
    value: string,
  ) {
    return new Date(
      value,
    ).toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    );
  }

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

  if (authLoading || loading) {
    return (
      <div className="page-container">
        <div className="loading-card">
          <div className="spinner" />

          <p>
            Loading your appointments...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <p className="eyebrow">
            MY BOOKINGS
          </p>

          <h1>
            My Appointments
          </h1>

          <p className="page-subtitle">
            Keep track of your salon
            appointments in one place.
          </p>
        </div>

        <Link
          href="/"
          className="primary-button"
        >
          Book an Appointment
        </Link>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="empty-card large">
          <div className="empty-icon">
            ✂
          </div>

          <h2>
            No appointments yet
          </h2>

          <p>
            You haven't booked an
            appointment with a salon
            yet.
          </p>

          <Link
            href="/"
            className="primary-button"
          >
            Explore Salons
          </Link>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map(
            (appointment) => (
              <div
                className="appointment-card"
                key={appointment.id}
              >
                <div className="appointment-date">
                  <span>
                    {new Date(
                      appointment.startAt,
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        month: "short",
                      },
                    )}
                  </span>

                  <strong>
                    {new Date(
                      appointment.startAt,
                    ).getDate()}
                  </strong>

                  <small>
                    {new Date(
                      appointment.startAt,
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        weekday:
                          "short",
                      },
                    )}
                  </small>
                </div>

                <div className="appointment-content">
                  <div className="appointment-top">
                    <div>
                      <h2>
                        {
                          appointment
                            .service
                            .name
                        }
                      </h2>

                      <p>
                        {
                          appointment
                            .salon
                            .name
                        }
                      </p>
                    </div>

                    <span
                      className={getStatusClass(
                        appointment.status,
                      )}
                    >
                      {
                        appointment.status
                      }
                    </span>
                  </div>

                  <div className="appointment-details">
                    <span>
                      📅{" "}
                      {formatDate(
                        appointment.startAt,
                      )}
                    </span>

                    <span>
                      🕐{" "}
                      {formatTime(
                        appointment.startAt,
                      )}
                    </span>

                    <span>
                      👤{" "}
                      {
                        appointment
                          .staff
                          .displayName
                      }
                    </span>

                    <span>
                      ⏱{" "}
                      {
                        appointment
                          .service
                          .durationMinutes
                      }{" "}
                      min
                    </span>
                  </div>

                  <div className="appointment-bottom">
                    <strong className="appointment-price">
                      ₹
                      {Number(
                        appointment
                          .service
                          .price,
                      ).toLocaleString(
                        "en-IN",
                      )}
                    </strong>

                    <Link
                      href={`/appointments/${appointment.id}`}
                      className="secondary-button"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}