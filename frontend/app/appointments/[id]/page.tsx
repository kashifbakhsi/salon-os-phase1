"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { api } from "../../../lib/api";
import { Appointment } from "../../../lib/types";

import { useAuth } from "../../../context/AuthContext";

export default function AppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = String(params.id);

const {
  token,
  loading: authLoading,
  isAuthenticated,
} = useAuth();

  const [appointment, setAppointment] =
    useState<Appointment | null>(null);

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
          `/appointments/${id}`,
        )}`,
      );

      return;
    }

    if (!token) {
      return;
    }

    async function loadAppointment() {
      try {
        setLoading(true);
        setError("");

        const data =
          await api<Appointment>(
            `/appointments/${id}`,
            {
              token,
            },
          );

        setAppointment(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load appointment.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadAppointment();
  }, [
    authLoading,
    id,
    isAuthenticated,
    router,
    token,
  ]);

  function formatDate(
    value: string,
  ) {
    return new Date(
      value,
    ).toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
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

  if (
    authLoading ||
    loading
  ) {
    return (
      <div className="page-container">
        <div className="loading-card">
          <div className="spinner" />
          <p>
            Loading appointment...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="empty-card">
          <h2>
            Appointment unavailable
          </h2>

          <p>{error}</p>

          <Link
            href="/appointments"
            className="primary-button"
          >
            My Appointments
          </Link>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  return (
    <div className="page-container">
      <Link
        href="/appointments"
        className="back-link"
      >
        ← My Appointments
      </Link>

      <div className="details-header">
        <div>
          <p className="eyebrow">
            APPOINTMENT DETAILS
          </p>

          <h1>
            {
              appointment.service
                .name
            }
          </h1>

          <p className="page-subtitle">
            {appointment.salon.name}
          </p>
        </div>

        <span
          className={`status-badge status-${appointment.status.toLowerCase()}`}
        >
          {appointment.status}
        </span>
      </div>

      <div className="details-layout">
        <div className="details-card">
          <h2>
            Appointment information
          </h2>

          <div className="details-grid">
            <div className="detail-item">
              <span>Date</span>

              <strong>
                {formatDate(
                  appointment.startAt,
                )}
              </strong>
            </div>

            <div className="detail-item">
              <span>Time</span>

              <strong>
                {formatTime(
                  appointment.startAt,
                )}
              </strong>
            </div>

            <div className="detail-item">
              <span>Professional</span>

              <strong>
                {
                  appointment.staff
                    .displayName
                }
              </strong>
            </div>

            <div className="detail-item">
              <span>Duration</span>

              <strong>
                {
                  appointment.service
                    .durationMinutes
                }{" "}
                minutes
              </strong>
            </div>
          </div>
        </div>

        <div className="details-card">
          <h2>
            Salon information
          </h2>

          <div className="salon-detail">
            <div className="salon-detail-icon">
              ✦
            </div>

            <div>
              <strong>
                {
                  appointment.salon
                    .name
                }
              </strong>

              {appointment.salon
                .phone && (
                <p>
                  📞{" "}
                  {
                    appointment.salon
                      .phone
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="details-card">
          <h2>
            Payment
          </h2>

          <div className="payment-summary">
            <span>
              Service price
            </span>

            <strong>
              ₹
              {Number(
                appointment.service
                  .price,
              ).toLocaleString(
                "en-IN",
              )}
            </strong>
          </div>

          <p className="payment-note">
            Payment processing will be
            connected in the next
            phase.
          </p>
        </div>
      </div>
    </div>
  );
}