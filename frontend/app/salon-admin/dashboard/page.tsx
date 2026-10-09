"use client";

import {
useEffect,
useState,
} from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "../../../context/AuthContext";

import {
getSalonAdminDashboard,
} from "../../../lib/api";

import type {
SalonAdminDashboard,
} from "../../../lib/types";

export default function SalonAdminDashboardPage() {
const router = useRouter();

const {
user,
token,
loading: authLoading,
} = useAuth();

const [dashboard, setDashboard] =
useState<SalonAdminDashboard | null>(null);

const [loading, setLoading] =
useState(true);

const [error, setError] =
useState("");

useEffect(() => {
if (authLoading) return;

if (!user || !token) {
  router.replace("/login?redirect=/salon-admin/dashboard");
  return;
}

if (user.role !== "SALON_ADMIN") {
  router.replace("/");
  return;
}

async function loadDashboard() {
  try {
    setLoading(true);
    setError("");

    const data =
      await getSalonAdminDashboard(token);

    setDashboard(data);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to load dashboard",
    );
  } finally {
    setLoading(false);
  }
}

loadDashboard();

}, [
authLoading,
user,
token,
router,
]);

if (
authLoading ||
loading
) {
return ( <main className="min-h-screen flex items-center justify-center"> <p>Loading dashboard...</p> </main>
);
}

if (error) {
return ( <main className="min-h-screen flex items-center justify-center p-6"> <div className="max-w-md w-full"> <h1 className="text-xl font-semibold">
Unable to load dashboard </h1>

```
      <p className="mt-2 text-sm opacity-70">
        {error}
      </p>

      <button
        type="button"
        onClick={() =>
          window.location.reload()
        }
        className="mt-4 px-4 py-2 rounded-lg border"
      >
        Try again
      </button>
    </div>
  </main>
);

}

if (!dashboard) {
return null;
}

const {
salon,
statistics,
todayAppointments,
} = dashboard;

return ( <main className="min-h-screen p-6"> <div className="max-w-7xl mx-auto">

    <div className="mb-8">
      <p className="text-sm opacity-60">
        Salon Dashboard
      </p>

      <h1 className="text-3xl font-bold mt-1">
        {salon.name}
      </h1>

      <p className="mt-2 opacity-70">
        Manage your salon, staff,
        services and appointments.
      </p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

      <DashboardCard
        label="Today's Appointments"
        value={statistics.todayAppointments}
      />

      <DashboardCard
        label="Pending"
        value={statistics.pendingAppointments}
      />

      <DashboardCard
        label="Active Staff"
        value={statistics.activeStaff}
      />

      <DashboardCard
        label="Active Services"
        value={statistics.activeServices}
      />

    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

      <DashboardCard
        label="Customers"
        value={statistics.totalCustomers}
      />

      <DashboardCard
        label="Today's Revenue"
        value={`₹${Number(
          statistics.todayRevenue,
        ).toLocaleString("en-IN")}`}
      />

    </div>

    <section className="mt-8">

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Today's Appointments
        </h2>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/salon-admin/appointments",
            )
          }
          className="text-sm underline"
        >
          View all
        </button>
      </div>

      {todayAppointments.length === 0 ? (
        <div className="border rounded-xl p-8 text-center">
          <p className="opacity-70">
            No appointments scheduled
            for today.
          </p>
        </div>
      ) : (
        <div className="space-y-3">

          {todayAppointments.map(
            (appointment) => (
              <div
                key={appointment.id}
                className="border rounded-xl p-4"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                  <div>
                    <p className="font-semibold">
                      {appointment.service.name}
                    </p>

                    <p className="text-sm opacity-70">
                      {appointment.customer.name}
                    </p>

                    <p className="text-sm opacity-60">
                      Staff:{" "}
                      {appointment.staff.displayName}
                    </p>
                  </div>

                  <div className="text-left md:text-right">

                    <p className="font-medium">
                      {new Date(
                        appointment.startAt,
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>

                    <p className="text-sm opacity-60">
                      {appointment.status}
                    </p>

                  </div>

                </div>
              </div>
            ),
          )}

        </div>
      )}

    </section>

  </div>
</main>

);
}

function DashboardCard({
label,
value,
}: {
label: string;
value: string | number;
}) {
return ( <div className="border rounded-xl p-5"> <p className="text-sm opacity-60">
{label} </p>

```
  <p className="text-2xl font-bold mt-2">
    {value}
  </p>
</div>

);
}
