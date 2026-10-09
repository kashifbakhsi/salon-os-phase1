"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "../../../context/AuthContext";
import {
  getOwnerWorkingHours,
  updateOwnerWorkingHours,
  type OwnerWorkingHour,
} from "../../../lib/api";

type WorkingHourForm = {
  dayOfWeek: number;
  open: boolean;
  openTime: string;
  closeTime: string;
};

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DEFAULT_HOURS: WorkingHourForm[] = [
  {
    dayOfWeek: 0,
    open: false,
    openTime: "09:00",
    closeTime: "20:00",
  },
  {
    dayOfWeek: 1,
    open: true,
    openTime: "09:00",
    closeTime: "20:00",
  },
  {
    dayOfWeek: 2,
    open: true,
    openTime: "09:00",
    closeTime: "20:00",
  },
  {
    dayOfWeek: 3,
    open: true,
    openTime: "09:00",
    closeTime: "20:00",
  },
  {
    dayOfWeek: 4,
    open: true,
    openTime: "09:00",
    closeTime: "20:00",
  },
  {
    dayOfWeek: 5,
    open: true,
    openTime: "09:00",
    closeTime: "20:00",
  },
  {
    dayOfWeek: 6,
    open: true,
    openTime: "10:00",
    closeTime: "21:00",
  },
];

export default function WorkingHoursPage() {
  const router = useRouter();

  const { user } = useAuth();

  const [hours, setHours] =
    useState<WorkingHourForm[]>(DEFAULT_HOURS);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    if (!user) {
      router.replace(
        "/login?redirect=/owner/working-hours",
      );
      return;
    }

    if (user.role !== "SALON_ADMIN") {
      router.replace("/");
      return;
    }

    loadWorkingHours();
  }, [user, router]);

  async function loadWorkingHours() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("salonos_token");

      if (!token) {
        router.replace(
          "/login?redirect=/owner/working-hours",
        );
        return;
      }

      const data =
        await getOwnerWorkingHours(token);

      if (data && data.length === 7) {
        const formattedHours =
          DAYS.map((_, index) => {
            const existing = data.find(
              (item) =>
                item.dayOfWeek === index,
            );

            if (!existing) {
              return DEFAULT_HOURS[index];
            }

            return {
              dayOfWeek:
                existing.dayOfWeek,
              open: existing.open,
              openTime:
                existing.openTime,
              closeTime:
                existing.closeTime,
            };
          });

        setHours(formattedHours);
      }
    } catch (err) {
      console.error(
        "Failed to load working hours:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load working hours.",
      );
    } finally {
      setLoading(false);
    }
  }

  function updateHour(
    dayOfWeek: number,
    field: keyof WorkingHourForm,
    value: string | boolean,
  ) {
    setHours((current) =>
      current.map((hour) =>
        hour.dayOfWeek === dayOfWeek
          ? {
              ...hour,
              [field]: value,
            }
          : hour,
      ),
    );

    setSuccess("");
    setError("");
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token =
        localStorage.getItem("salonos_token");

      if (!token) {
        router.replace(
          "/login?redirect=/owner/working-hours",
        );
        return;
      }

      for (const hour of hours) {
        if (!hour.open) continue;

        if (
          hour.openTime >= hour.closeTime
        ) {
          setError(
            `Closing time must be after opening time for ${DAYS[hour.dayOfWeek]}.`,
          );
          return;
        }
      }

      await updateOwnerWorkingHours(
        token,
        hours,
      );

      setSuccess(
        "Working hours updated successfully.",
      );

      await loadWorkingHours();
    } catch (err) {
      console.error(
        "Failed to save working hours:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save working hours.",
      );
    } finally {
      setSaving(false);
    }
  }

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
          padding: "24px",
        }}
      >
        <p>Loading working hours...</p>
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
          maxWidth: "1000px",
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
            marginBottom: "28px",
            flexWrap: "wrap",
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
                background: "transparent",
                padding: 0,
                marginBottom: "10px",
                cursor: "pointer",
                fontSize: "14px",
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
              Working Hours
            </h1>

            <p
              style={{
                marginTop: "8px",
                marginBottom: 0,
                opacity: 0.7,
                fontSize: "15px",
              }}
            >
              Set the opening and closing
              hours for your salon.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "12px 22px",
              borderRadius: "10px",
              border: "none",
              cursor: saving
                ? "not-allowed"
                : "pointer",
              fontWeight: 600,
              fontSize: "15px",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              borderRadius: "10px",
              border: "1px solid rgba(220, 38, 38, 0.35)",
              background:
                "rgba(220, 38, 38, 0.08)",
              color: "#b91c1c",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              borderRadius: "10px",
              border: "1px solid rgba(22, 163, 74, 0.35)",
              background:
                "rgba(22, 163, 74, 0.08)",
              color: "#15803d",
              fontSize: "14px",
            }}
          >
            {success}
          </div>
        )}

        {/* Working Hours Card */}
        <section
          style={{
            borderRadius: "16px",
            border: "1px solid rgba(128, 128, 128, 0.2)",
            overflow: "hidden",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1.4fr 0.8fr 1fr 1fr",
              gap: "16px",
              padding: "18px 20px",
              borderBottom:
                "1px solid rgba(128, 128, 128, 0.2)",
              fontWeight: 600,
              fontSize: "14px",
              opacity: 0.8,
            }}
          >
            <div>Day</div>
            <div>Open</div>
            <div>Opening Time</div>
            <div>Closing Time</div>
          </div>

          {/* Rows */}
          {hours.map((hour) => {
            const day =
              DAYS[hour.dayOfWeek];

            return (
              <div
                key={hour.dayOfWeek}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1.4fr 0.8fr 1fr 1fr",
                  gap: "16px",
                  alignItems: "center",
                  padding: "18px 20px",
                  borderBottom:
                    hour.dayOfWeek === 6
                      ? "none"
                      : "1px solid rgba(128, 128, 128, 0.15)",
                }}
              >
                {/* Day */}
                <div
                  style={{
                    fontWeight: 600,
                  }}
                >
                  {day}
                </div>

                {/* Open Toggle */}
                <div>
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={hour.open}
                      onChange={(event) =>
                        updateHour(
                          hour.dayOfWeek,
                          "open",
                          event.target.checked,
                        )
                      }
                      style={{
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                      }}
                    />

                    <span
                      style={{
                        fontSize: "14px",
                      }}
                    >
                      {hour.open
                        ? "Open"
                        : "Closed"}
                    </span>
                  </label>
                </div>

                {/* Opening Time */}
                <div>
                  <input
                    type="time"
                    value={hour.openTime}
                    disabled={!hour.open}
                    onChange={(event) =>
                      updateHour(
                        hour.dayOfWeek,
                        "openTime",
                        event.target.value,
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border:
                        "1px solid rgba(128, 128, 128, 0.3)",
                      background:
                        "transparent",
                      opacity: hour.open
                        ? 1
                        : 0.45,
                    }}
                  />
                </div>

                {/* Closing Time */}
                <div>
                  <input
                    type="time"
                    value={hour.closeTime}
                    disabled={!hour.open}
                    onChange={(event) =>
                      updateHour(
                        hour.dayOfWeek,
                        "closeTime",
                        event.target.value,
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border:
                        "1px solid rgba(128, 128, 128, 0.3)",
                      background:
                        "transparent",
                      opacity: hour.open
                        ? 1
                        : 0.45,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </section>

        {/* Information */}
        <div
          style={{
            marginTop: "20px",
            padding: "16px 18px",
            borderRadius: "12px",
            border: "1px solid rgba(128, 128, 128, 0.18)",
            fontSize: "14px",
            lineHeight: 1.6,
            opacity: 0.8,
          }}
        >
          <strong>How this works:</strong>{" "}
          Salon working hours define when customers
          can potentially book appointments. Staff
          availability, staff services, blocked
          periods, and existing appointments will
          also be checked before an appointment slot
          becomes available.
        </div>
      </div>
    </main>
  );
}