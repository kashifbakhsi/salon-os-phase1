"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useAuth,
} from "../../../context/AuthContext";

import {
  api,
} from "../../../lib/api";
import Link from "next/link";
type SalonStatus =
  | "PENDING"
  | "ACTIVE"
  | "SUSPENDED"
  | "BLOCKED";

type SalonService = {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  durationMinutes: number;
  active: boolean;
};

type SalonStaff = {
  id: string;
  displayName: string;
  bio?: string | null;
  specialization?: string | null;
  experienceYears: number;
  active: boolean;

  user: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
  };
};

type WorkingHour = {
  id: string;
  dayOfWeek: number;
  isClosed: boolean;
  openTime?: string | null;
  closeTime?: string | null;
};

type MySalon = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;

  phone?: string | null;
  email?: string | null;

  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;

  status: SalonStatus;

  services: SalonService[];
  staff: SalonStaff[];
  workingHours: WorkingHour[];
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

export default function OwnerDashboardPage() {
  const router = useRouter();

  const {
    user,
    token,
    loading: authLoading,
    logout,
  } = useAuth();

  const [salon, setSalon] =
    useState<MySalon | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || !token) {
      router.replace(
        "/login?redirect=/owner/dashboard",
      );
      return;
    }

    if (
      user.role !==
      "SALON_ADMIN"
    ) {
      router.replace("/");
      return;
    }

    loadSalon(token);
  }, [
    authLoading,
    user,
    token,
    router,
  ]);

  async function loadSalon(
    authToken: string,
  ) {
    setLoading(true);
    setError("");

    try {
      const data =
        await api<MySalon>(
          "/salons/mine",
          {
            token: authToken,
          },
        );

      setSalon(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load salon.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  if (authLoading || loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "40px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>
          Loading your salon dashboard...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <h1>
            Salon Owner Dashboard
          </h1>

          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              borderRadius: "10px",
              background:
                "rgba(220, 38, 38, 0.08)",
            }}
          >
            {error}
          </div>

          <button
            onClick={() =>
              token &&
              loadSalon(token)
            }
            style={{
              marginTop: "16px",
              padding:
                "10px 18px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <h1>
            Salon Owner Dashboard
          </h1>

          <p>
            No salon is currently
            associated with your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "20px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                opacity: 0.65,
                fontSize: "14px",
              }}
            >
              SalonOS Owner Portal
            </p>

            <h1
              style={{
                margin:
                  "5px 0 4px",
              }}
            >
              Welcome,{" "}
              {user.name}
            </h1>

            <p
              style={{
                margin: 0,
                opacity: 0.7,
              }}
            >
              Manage your salon
              business from one place.
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding:
                "10px 18px",
              borderRadius: "8px",
              border:
                "1px solid #ccc",
              background:
                "transparent",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </header>

        {/* =====================================================
            STATUS
        ====================================================== */}

        <section
          style={{
            padding: "20px",
            borderRadius: "14px",
            border:
              "1px solid rgba(0,0,0,0.08)",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin:
                    "0 0 5px",
                }}
              >
                {salon.name}
              </h2>

              <p
                style={{
                  margin: 0,
                  opacity: 0.7,
                }}
              >
                /{salon.slug}
              </p>
            </div>

            <StatusBadge
              status={salon.status}
            />
          </div>

          {salon.status ===
            "PENDING" && (
            <div
              style={{
                marginTop: "18px",
                padding:
                  "14px 16px",
                borderRadius: "10px",
                background:
                  "rgba(234, 179, 8, 0.10)",
              }}
            >
              <strong>
                Salon pending approval
              </strong>

              <p
                style={{
                  margin:
                    "5px 0 0",
                }}
              >
                Your salon profile has
                been submitted. It will
                become visible to
                customers after platform
                approval.
              </p>
            </div>
          )}

          {salon.status ===
            "SUSPENDED" && (
            <div
              style={{
                marginTop: "18px",
                padding:
                  "14px 16px",
                borderRadius: "10px",
                background:
                  "rgba(234, 179, 8, 0.10)",
              }}
            >
              Your salon is currently
              suspended. Customers cannot
              book it while suspended.
            </div>
          )}

          {salon.status ===
            "BLOCKED" && (
            <div
              style={{
                marginTop: "18px",
                padding:
                  "14px 16px",
                borderRadius: "10px",
                background:
                  "rgba(220, 38, 38, 0.08)",
              }}
            >
              Your salon has been blocked
              by the platform.
            </div>
          )}
        </section>

        {/* =====================================================
            QUICK STATS
        ====================================================== */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <StatCard
            title="Services"
            value={
              salon.services.length
            }
          />

          <StatCard
            title="Staff"
            value={
              salon.staff.length
            }
          />

          <StatCard
            title="Active Services"
            value={
              salon.services.filter(
                (service) =>
                  service.active,
              ).length
            }
          />

          <StatCard
            title="Active Staff"
            value={
              salon.staff.filter(
                (staff) =>
                  staff.active,
              ).length
            }
          />
        </section>

        {/* =====================================================
            DASHBOARD ACTIONS
        ====================================================== */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <DashboardCard
            title="Salon Profile"
            description="Update your salon name, contact information, address and description."
          />

          <DashboardCard
            title="Services"
            description="Add, edit, activate or deactivate services offered by your salon."
          />

          <DashboardCard
            title="Staff"
            description="Manage your staff members and assign services to them."
          />

          <DashboardCard
            title="Working Hours"
            description="Configure your salon's weekly operating schedule."
          />

          <DashboardCard
            title="Appointments"
            description="View and manage customer appointments."
          />
        </section>

        {/* =====================================================
            SALON PROFILE
        ====================================================== */}

        <section
          style={{
            padding: "22px",
            borderRadius: "14px",
            border:
              "1px solid rgba(0,0,0,0.08)",
            marginBottom: "20px",
          }}
        >
          <h2>
            Salon Profile
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "18px",
              marginTop: "18px",
            }}
          >
            <InfoItem
              label="Salon name"
              value={
                salon.name
              }
            />

            <InfoItem
              label="Salon email"
              value={
                salon.email ||
                "Not provided"
              }
            />

            <InfoItem
              label="Salon phone"
              value={
                salon.phone ||
                "Not provided"
              }
            />

            <InfoItem
              label="City"
              value={
                salon.city ||
                "Not provided"
              }
            />

            <InfoItem
              label="State"
              value={
                salon.state ||
                "Not provided"
              }
            />

            <InfoItem
              label="PIN code"
              value={
                salon.postalCode ||
                "Not provided"
              }
            />

            <InfoItem
              label="Address"
              value={
                salon.address ||
                "Not provided"
              }
            />
          </div>

          {salon.description && (
            <div
              style={{
                marginTop: "20px",
              }}
            >
              <strong>
                Description
              </strong>

              <p
                style={{
                  marginTop: "6px",
                  opacity: 0.75,
                  lineHeight: 1.6,
                }}
              >
                {
                  salon.description
                }
              </p>
            </div>
          )}
        </section>

        {/* =====================================================
            SERVICES
        ====================================================== */}

        <section
          style={{
            padding: "22px",
            borderRadius: "14px",
            border:
              "1px solid rgba(0,0,0,0.08)",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin:
                    "0 0 5px",
                }}
              >
                Services
              </h2>

              <p
                style={{
                  margin: 0,
                  opacity: 0.65,
                }}
              >
                {salon.services.length}{" "}
                service
                {salon.services.length !==
                1
                  ? "s"
                  : ""}
              </p>
            </div>

            
            <Link
  href="/owner/services"
  className="primary-button" 
>
  Manage Services
</Link>

          </div>

          {salon.services.length ===
          0 ? (
            <EmptyState
              message="No services have been added yet."
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "14px",
                marginTop: "18px",
              }}
            >
              {salon.services.map(
                (service) => (
                  <div
                    key={service.id}
                    style={{
                      padding:
                        "16px",
                      borderRadius:
                        "10px",
                      border:
                        "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        gap: "10px",
                      }}
                    >
                      <strong>
                        {
                          service.name
                        }
                      </strong>

                      <span>
                        ₹
                        {Number(
                          service.price,
                        ).toFixed(
                          0,
                        )}
                      </span>
                    </div>

                    <p
                      style={{
                        margin:
                          "8px 0",
                        opacity:
                          0.65,
                        fontSize:
                          "14px",
                      }}
                    >
                      {
                        service.durationMinutes
                      }{" "}
                      minutes
                    </p>

                    {service.description && (
                      <p
                        style={{
                          margin:
                            "8px 0 0",
                          opacity:
                            0.7,
                          fontSize:
                            "14px",
                        }}
                      >
                        {
                          service.description
                        }
                      </p>
                    )}

                    <div
                      style={{
                        marginTop:
                          "12px",
                        fontSize:
                          "12px",
                        fontWeight:
                          600,
                        opacity:
                          0.7,
                      }}
                    >
                      {service.active
                        ? "ACTIVE"
                        : "INACTIVE"}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        {/* =====================================================
            STAFF
        ====================================================== */}

        <section
          style={{
            padding: "22px",
            borderRadius: "14px",
            border:
              "1px solid rgba(0,0,0,0.08)",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin:
                    "0 0 5px",
                }}
              >
                Staff
              </h2>

              <p
                style={{
                  margin: 0,
                  opacity: 0.65,
                }}
              >
                Manage your salon
                team.
              </p>
            </div>

            <button
  type="button"
  onClick={() =>
    router.push("/owner/staff")
  }
>
  Manage Staff
</button>
<button
  type="button"
  onClick={() =>
    router.push("/owner/working-hours")
  }
>
  Working Hours
</button>
<button
  type="button"
  onClick={() =>
    router.push("/owner/appointments")
  }
  style={{
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  }}
>
  Appointments
</button>
          </div>

          {salon.staff.length ===
          0 ? (
            <EmptyState
              message="No staff members have been added yet."
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "14px",
                marginTop: "18px",
              }}
            >
              {salon.staff.map(
                (staff) => (
                  <div
                    key={staff.id}
                    style={{
                      padding:
                        "16px",
                      borderRadius:
                        "10px",
                      border:
                        "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <strong>
                      {
                        staff.displayName
                      }
                    </strong>

                    <p
                      style={{
                        margin:
                          "7px 0",
                        opacity:
                          0.65,
                        fontSize:
                          "14px",
                      }}
                    >
                      {
                        staff.specialization ||
                        "General stylist"
                      }
                    </p>

                    <p
                      style={{
                        margin:
                          "7px 0",
                        fontSize:
                          "14px",
                      }}
                    >
                      {
                        staff.experienceYears
                      }{" "}
                      years experience
                    </p>

                    {staff.user
                      ?.email && (
                      <p
                        style={{
                          margin:
                            "7px 0",
                          fontSize:
                            "13px",
                          opacity:
                            0.7,
                        }}
                      >
                        {
                          staff.user
                            .email
                        }
                      </p>
                    )}

                    <div
                      style={{
                        marginTop:
                          "12px",
                        fontSize:
                          "12px",
                        fontWeight:
                          600,
                        opacity:
                          0.7,
                      }}
                    >
                      {staff.active
                        ? "ACTIVE"
                        : "INACTIVE"}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        {/* =====================================================
            WORKING HOURS
        ====================================================== */}

        <section
          style={{
            padding: "22px",
            borderRadius: "14px",
            border:
              "1px solid rgba(0,0,0,0.08)",
            marginBottom: "20px",
          }}
        >
          <h2>
            Working Hours
          </h2>

          {salon.workingHours.length ===
          0 ? (
            <EmptyState
              message="Working hours have not been configured."
            />
          ) : (
            <div
              style={{
                display: "grid",
                gap: "8px",
                marginTop: "15px",
              }}
            >
              {salon.workingHours.map(
                (hour) => (
                  <div
                    key={hour.id}
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      gap: "15px",
                      padding:
                        "12px 14px",
                      borderRadius:
                        "8px",
                      background:
                        "rgba(0,0,0,0.03)",
                    }}
                  >
                    <strong>
                      {
                        DAYS[
                          hour.dayOfWeek
                        ]
                      }
                    </strong>

                    <span>
                      {hour.isClosed
                        ? "Closed"
                        : `${hour.openTime || "--"} - ${hour.closeTime || "--"}`}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// =============================================================
// SMALL UI COMPONENTS
// =============================================================

function StatusBadge({
  status,
}: {
  status: SalonStatus;
}) {
  return (
    <span
      style={{
        display:
          "inline-flex",
        alignItems: "center",
        padding:
          "7px 12px",
        borderRadius:
          "999px",
        fontSize:
          "12px",
        fontWeight: 700,
        letterSpacing:
          "0.03em",
        background:
          status === "ACTIVE"
            ? "rgba(22, 163, 74, 0.12)"
            : status ===
                "PENDING"
              ? "rgba(234, 179, 8, 0.15)"
              : "rgba(220, 38, 38, 0.12)",
      }}
    >
      {status}
    </span>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "14px",
        border:
          "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <p
        style={{
          margin: 0,
          opacity: 0.65,
          fontSize: "14px",
        }}
      >
        {title}
      </p>

      <strong
        style={{
          display: "block",
          marginTop: "8px",
          fontSize: "30px",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function DashboardCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "14px",
        border:
          "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <h3
        style={{
          margin:
            "0 0 8px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          opacity: 0.65,
          lineHeight: 1.5,
          fontSize: "14px",
        }}
      >
        {description}
      </p>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "12px",
          opacity: 0.55,
          marginBottom:
            "5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: 600,
          lineHeight: 1.5,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div
      style={{
        padding:
          "30px 10px",
        textAlign: "center",
        opacity: 0.6,
      }}
    >
      {message}
    </div>
  );
}

const actionButtonStyle = {
  padding: "10px 16px",
  borderRadius: "8px",
  border:
    "1px solid currentColor",
  background: "transparent",
  cursor: "pointer",
  fontWeight: 600,
};