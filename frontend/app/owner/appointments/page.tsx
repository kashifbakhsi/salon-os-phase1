"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "../../../context/AuthContext";

import {
  getOwnerAppointments,
  updateOwnerAppointmentStatus,
  type OwnerAppointment,
  type OwnerAppointmentStatus,
} from "../../../lib/api";

const STATUS_OPTIONS: OwnerAppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

function formatDate(
  value: string,
) {
  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

function formatTime(
  value: string,
) {
  return new Date(value).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

function formatPrice(
  value: string | number,
) {
  return `₹${Number(value).toLocaleString(
    "en-IN",
  )}`;
}

function statusLabel(
  status: OwnerAppointmentStatus,
) {
  return status.replace(
    "_",
    " ",
  );
}

export default function OwnerAppointmentsPage() {
  const router = useRouter();

  const { user } = useAuth();

  const [appointments, setAppointments] =
    useState<OwnerAppointment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      OwnerAppointmentStatus | ""
    >("");

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace(
        "/login?redirect=/owner/appointments",
      );
      return;
    }

    if (user.role !== "SALON_ADMIN") {
      router.replace("/");
      return;
    }

    loadAppointments();
  }, [user, router]);

  async function loadAppointments() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem(
          "salonos_token",
        );

      if (!token) {
        router.replace(
          "/login?redirect=/owner/appointments",
        );
        return;
      }

      const data =
        await getOwnerAppointments(
          token,
          statusFilter
            ? {
                status: statusFilter,
              }
            : undefined,
        );

      setAppointments(data);
    } catch (err) {
      console.error(
        "Failed to load appointments:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load appointments.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(
    appointmentId: string,
    status: OwnerAppointmentStatus,
  ) {
    try {
      const token =
        localStorage.getItem(
          "salonos_token",
        );

      if (!token) {
        router.replace(
          "/login?redirect=/owner/appointments",
        );
        return;
      }

      setUpdatingId(appointmentId);
      setError("");

      const updated =
        await updateOwnerAppointmentStatus(
          token,
          appointmentId,
          status,
        );

      setAppointments(
        (current) =>
          current.map((appointment) =>
            appointment.id ===
            appointmentId
              ? updated
              : appointment,
          ),
      );
    } catch (err) {
      console.error(
        "Failed to update appointment:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update appointment.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredAppointments =
    useMemo(() => {
      if (!statusFilter) {
        return appointments;
      }

      return appointments.filter(
        (appointment) =>
          appointment.status ===
          statusFilter,
      );
    }, [
      appointments,
      statusFilter,
    ]);

  if (
    loading ||
    !user ||
    user.role !== "SALON_ADMIN"
  ) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Loading appointments...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <div>
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/owner/dashboard",
                )
              }
              style={{
                border: "none",
                background:
                  "transparent",
                padding: 0,
                marginBottom: "10px",
                cursor: "pointer",
                opacity: 0.75,
              }}
            >
              ← Back to Dashboard
            </button>

            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: 700,
              }}
            >
              Appointments
            </h1>

            <p
              style={{
                marginTop: "8px",
                marginBottom: 0,
                opacity: 0.7,
              }}
            >
              View and manage appointments
              booked at your salon.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAppointments}
            style={{
              padding: "11px 18px",
              borderRadius: "10px",
              border: "1px solid rgba(128,128,128,0.3)",
              background:
                "transparent",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              borderRadius: "10px",
              border:
                "1px solid rgba(220,38,38,0.35)",
              background:
                "rgba(220,38,38,0.08)",
              color: "#b91c1c",
            }}
          >
            {error}
          </div>
        )}

        {/* Filters */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <label
            style={{
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Status:
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | OwnerAppointmentStatus
                  | "",
              )
            }
            style={{
              padding:
                "10px 12px",
              borderRadius: "8px",
              border:
                "1px solid rgba(128,128,128,0.3)",
              background:
                "transparent",
            }}
          >
            <option value="">
              All Statuses
            </option>

            {STATUS_OPTIONS.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {statusLabel(status)}
                </option>
              ),
            )}
          </select>
        </div>

        {/* Empty state */}
        {filteredAppointments.length ===
          0 && (
          <section
            style={{
              padding: "50px 24px",
              textAlign: "center",
              borderRadius: "16px",
              border:
                "1px solid rgba(128,128,128,0.2)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
              }}
            >
              No appointments found
            </h2>

            <p
              style={{
                opacity: 0.7,
              }}
            >
              Customer bookings will appear
              here automatically.
            </p>
          </section>
        )}

        {/* Appointment Cards */}
        <div
          style={{
            display: "grid",
            gap: "16px",
          }}
        >
          {filteredAppointments.map(
            (appointment) => (
              <article
                key={appointment.id}
                style={{
                  padding: "20px",
                  borderRadius: "16px",
                  border:
                    "1px solid rgba(128,128,128,0.2)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "flex-start",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Appointment information */}
                  <div
                    style={{
                      flex: 1,
                      minWidth:
                        "280px",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        gap: "10px",
                        alignItems:
                          "center",
                        flexWrap:
                          "wrap",
                        marginBottom:
                          "10px",
                      }}
                    >
                      <h2
                        style={{
                          margin: 0,
                          fontSize:
                            "20px",
                        }}
                      >
                        {
                          appointment
                            .service
                            .name
                        }
                      </h2>

                      <span
                        style={{
                          padding:
                            "5px 9px",
                          borderRadius:
                            "999px",
                          fontSize:
                            "12px",
                          fontWeight: 600,
                          border:
                            "1px solid rgba(128,128,128,0.25)",
                        }}
                      >
                        {statusLabel(
                          appointment.status,
                        )}
                      </span>
                    </div>

                    <div
                      style={{
                        display:
                          "grid",
                        gap: "7px",
                        fontSize:
                          "14px",
                      }}
                    >
                      <div>
                        <strong>
                          Date:
                        </strong>{" "}
                        {formatDate(
                          appointment.startAt,
                        )}
                      </div>

                      <div>
                        <strong>
                          Time:
                        </strong>{" "}
                        {formatTime(
                          appointment.startAt,
                        )}{" "}
                        –{" "}
                        {formatTime(
                          appointment.endAt,
                        )}
                      </div>

                      <div>
                        <strong>
                          Customer:
                        </strong>{" "}
                        {
                          appointment
                            .customer
                            .name
                        }
                      </div>

                      {appointment
                        .customer
                        .phone && (
                        <div>
                          <strong>
                            Phone:
                          </strong>{" "}
                          {
                            appointment
                              .customer
                              .phone
                          }
                        </div>
                      )}

                      {appointment
                        .customer
                        .email && (
                        <div>
                          <strong>
                            Email:
                          </strong>{" "}
                          {
                            appointment
                              .customer
                              .email
                          }
                        </div>
                      )}

                      <div>
                        <strong>
                          Staff:
                        </strong>{" "}
                        {
                          appointment
                            .staff
                            .displayName
                        }
                      </div>

                      <div>
                        <strong>
                          Price:
                        </strong>{" "}
                        {formatPrice(
                          appointment
                            .service
                            .price,
                        )}
                      </div>

                      <div>
                        <strong>
                          Duration:
                        </strong>{" "}
                        {
                          appointment
                            .service
                            .durationMinutes
                        }{" "}
                        minutes
                      </div>

                      {appointment.notes && (
                        <div
                          style={{
                            marginTop:
                              "6px",
                          }}
                        >
                          <strong>
                            Notes:
                          </strong>{" "}
                          {
                            appointment.notes
                          }
                        </div>
                      )}

                      {appointment.payment && (
                        <div>
                          <strong>
                            Payment:
                          </strong>{" "}
                          {
                            appointment
                              .payment
                              .status
                          }
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      gap: "8px",
                      minWidth:
                        "150px",
                    }}
                  >
                    {appointment
                      .status ===
                      "PENDING" && (
                      <>
                        <button
                          type="button"
                          disabled={
                            updatingId ===
                            appointment.id
                          }
                          onClick={() =>
                            handleStatusChange(
                              appointment.id,
                              "CONFIRMED",
                            )
                          }
                          style={{
                            padding:
                              "10px 14px",
                            borderRadius:
                              "8px",
                            border:
                              "none",
                            cursor:
                              "pointer",
                            fontWeight:
                              600,
                          }}
                        >
                          Confirm
                        </button>

                        <button
                          type="button"
                          disabled={
                            updatingId ===
                            appointment.id
                          }
                          onClick={() =>
                            handleStatusChange(
                              appointment.id,
                              "CANCELLED",
                            )
                          }
                          style={{
                            padding:
                              "10px 14px",
                            borderRadius:
                              "8px",
                            border:
                              "1px solid rgba(220,38,38,0.3)",
                            background:
                              "transparent",
                            cursor:
                              "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {appointment
                      .status ===
                      "CONFIRMED" && (
                      <>
                        <button
                          type="button"
                          disabled={
                            updatingId ===
                            appointment.id
                          }
                          onClick={() =>
                            handleStatusChange(
                              appointment.id,
                              "IN_PROGRESS",
                            )
                          }
                          style={{
                            padding:
                              "10px 14px",
                            borderRadius:
                              "8px",
                            border:
                              "none",
                            cursor:
                              "pointer",
                            fontWeight:
                              600,
                          }}
                        >
                          Start
                        </button>

                        <button
                          type="button"
                          disabled={
                            updatingId ===
                            appointment.id
                          }
                          onClick={() =>
                            handleStatusChange(
                              appointment.id,
                              "CANCELLED",
                            )
                          }
                          style={{
                            padding:
                              "10px 14px",
                            borderRadius:
                              "8px",
                            border:
                              "1px solid rgba(220,38,38,0.3)",
                            background:
                              "transparent",
                            cursor:
                              "pointer",
                          }}
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          disabled={
                            updatingId ===
                            appointment.id
                          }
                          onClick={() =>
                            handleStatusChange(
                              appointment.id,
                              "NO_SHOW",
                            )
                          }
                          style={{
                            padding:
                              "10px 14px",
                            borderRadius:
                              "8px",
                            border:
                              "1px solid rgba(128,128,128,0.3)",
                            background:
                              "transparent",
                            cursor:
                              "pointer",
                          }}
                        >
                          No Show
                        </button>
                      </>
                    )}

                    {appointment
                      .status ===
                      "IN_PROGRESS" && (
                      <button
                        type="button"
                        disabled={
                          updatingId ===
                          appointment.id
                        }
                        onClick={() =>
                          handleStatusChange(
                            appointment.id,
                            "COMPLETED",
                          )
                        }
                        style={{
                          padding:
                            "10px 14px",
                          borderRadius:
                            "8px",
                          border:
                            "none",
                          cursor:
                            "pointer",
                          fontWeight:
                            600,
                        }}
                      >
                        Complete
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/owner/appointments/${appointment.id}`,
                        )
                      }
                      style={{
                        padding:
                          "10px 14px",
                        borderRadius:
                          "8px",
                        border:
                          "1px solid rgba(128,128,128,0.3)",
                        background:
                          "transparent",
                        cursor:
                          "pointer",
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      </div>
    </main>
  );
}