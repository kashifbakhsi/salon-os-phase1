
import type {
  SalonAdminDashboard,
} from "./types";

/* =========================================================
   API CONFIGURATION
   ========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api";

/* =========================================================
   COMMON API TYPES
   ========================================================= */

type ApiOptions = RequestInit & {
  token?: string;
};

/* =========================================================
   COMMON API FUNCTION
   ========================================================= */

export async function api<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const {
    token,
    headers,
    ...fetchOptions
  } = options;

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...fetchOptions,

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...(headers || {}),
      },

      cache: "no-store",
    },
  );

  const contentType =
    response.headers.get("content-type");

  const data =
    contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    let message =
      "Something went wrong";

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data
    ) {
      const apiMessage = data.message;

      if (Array.isArray(apiMessage)) {
        message = apiMessage.join(", ");
      } else {
        message = String(apiMessage);
      }
    } else if (
      typeof data === "string" &&
      data.trim()
    ) {
      message = data;
    }

    throw new Error(message);
  }

  return data as T;
}

/* =========================================================
   SALON ADMIN DASHBOARD
   ========================================================= */

export async function getSalonAdminDashboard(
  token: string,
): Promise<SalonAdminDashboard> {
  return api<SalonAdminDashboard>(
    "/salon-admin/dashboard",
    {
      token,
    },
  );
}

/* =========================================================
   OWNER APPOINTMENTS
   ========================================================= */

export type OwnerAppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type OwnerAppointment = {
  id: string;

  startAt: string;
  endAt: string;

  status: OwnerAppointmentStatus;

  notes?: string | null;

  customer: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
  };

  staff: {
    id: string;
    displayName: string;
    active?: boolean;
  };

  service: {
    id: string;
    name: string;
    description?: string | null;
    price: string | number;
    durationMinutes: number;
  };

  payment?: {
    id: string;
    provider?: string | null;
    amount: string | number;
    currency: string;
    status: string;
    paidAt?: string | null;
  } | null;
};

export async function getOwnerAppointments(
  token: string,
  filters?: {
    status?: OwnerAppointmentStatus;
    staffId?: string;
    serviceId?: string;
    date?: string;
  },
): Promise<OwnerAppointment[]> {
  const params =
    new URLSearchParams();

  if (filters?.status) {
    params.set(
      "status",
      filters.status,
    );
  }

  if (filters?.staffId) {
    params.set(
      "staffId",
      filters.staffId,
    );
  }

  if (filters?.serviceId) {
    params.set(
      "serviceId",
      filters.serviceId,
    );
  }

  if (filters?.date) {
    params.set(
      "date",
      filters.date,
    );
  }

  const query =
    params.toString();

  return api<OwnerAppointment[]>(
    `/salon-admin/appointments${
      query ? `?${query}` : ""
    }`,
    {
      token,
    },
  );
}

export async function getOwnerAppointment(
  token: string,
  appointmentId: string,
): Promise<OwnerAppointment> {
  return api<OwnerAppointment>(
    `/salon-admin/appointments/${appointmentId}`,
    {
      token,
    },
  );
}

export async function updateOwnerAppointmentStatus(
  token: string,
  appointmentId: string,
  status: OwnerAppointmentStatus,
): Promise<OwnerAppointment> {
  return api<OwnerAppointment>(
    `/salon-admin/appointments/${appointmentId}/status`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify({
        status,
      }),
    },
  );
}

/* =========================================================
   OWNER WORKING HOURS
   ========================================================= */

export type OwnerWorkingHour = {
  id: string;
  dayOfWeek: number;
  open: boolean;
  openTime: string;
  closeTime: string;
};

export async function getOwnerWorkingHours(
  token: string,
): Promise<OwnerWorkingHour[]> {
  return api<OwnerWorkingHour[]>(
    "/salon-admin/working-hours",
    {
      token,
    },
  );
}

export async function updateOwnerWorkingHours(
  token: string,
  hours: {
    dayOfWeek: number;
    open: boolean;
    openTime: string;
    closeTime: string;
  }[],
): Promise<OwnerWorkingHour[]> {
  return api<OwnerWorkingHour[]>(
    "/salon-admin/working-hours",
    {
      method: "PATCH",
      token,
      body: JSON.stringify({
        hours,
      }),
    },
  );
}

/* =========================================================
   OWNER STAFF
   ========================================================= */

export type OwnerStaffService = {
  id: string;
  name: string;
  price: string | number;
  durationMinutes: number;
  active: boolean;
};

export type OwnerStaff = {
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
    role: string;
  };

  services: {
    service: OwnerStaffService;
  }[];
};

export type CreateOwnerStaffData = {
  displayName: string;
  email?: string;
  phone?: string;
  bio?: string;
  specialization?: string;
  experienceYears?: number;
  serviceIds?: string[];
};

export type UpdateOwnerStaffData = {
  displayName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  specialization?: string;
  experienceYears?: number;
  active?: boolean;
  serviceIds?: string[];
};

export async function getOwnerStaff(
  token: string,
): Promise<OwnerStaff[]> {
  return api<OwnerStaff[]>(
    "/salon-admin/staff",
    {
      token,
    },
  );
}

export async function createOwnerStaff(
  token: string,
  data: CreateOwnerStaffData,
): Promise<OwnerStaff> {
  return api<OwnerStaff>(
    "/salon-admin/staff",
    {
      method: "POST",
      token,
      body: JSON.stringify(data),
    },
  );
}

export async function updateOwnerStaff(
  token: string,
  staffId: string,
  data: UpdateOwnerStaffData,
): Promise<OwnerStaff> {
  return api<OwnerStaff>(
    `/salon-admin/staff/${staffId}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    },
  );
}

export async function deactivateOwnerStaff(
  token: string,
  staffId: string,
): Promise<OwnerStaff> {
  return api<OwnerStaff>(
    `/salon-admin/staff/${staffId}`,
    {
      method: "DELETE",
      token,
    },
  );
}

/* =========================================================
   STAFF INVITATIONS
   ========================================================= */

export type StaffInvitationResponse = {
  message: string;
  invitationUrl: string;
  expiresAt: string;
};

export async function createStaffInvitation(
  token: string,
  data: {
    email?: string;
    phone?: string;
  },
): Promise<StaffInvitationResponse> {
  return api<StaffInvitationResponse>(
    "/salon-admin/staff/invitations",
    {
      method: "POST",
      token,
      body: JSON.stringify(data),
    },
  );
}

/* =========================================================
   OWNER SERVICES
   ========================================================= */

export type OwnerService = {
  id: string;
  salonId: string;
  name: string;
  description?: string | null;
  price: string | number;
  durationMinutes: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateOwnerServiceData = {
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  active?: boolean;
};

export type UpdateOwnerServiceData = {
  name?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
  active?: boolean;
};

export function getOwnerServices(
  token: string,
): Promise<OwnerService[]> {
  return api<OwnerService[]>(
    "/salon-admin/services",
    {
      token,
    },
  );
}

export function createOwnerService(
  token: string,
  data: CreateOwnerServiceData,
): Promise<OwnerService> {
  return api<OwnerService>(
    "/salon-admin/services",
    {
      method: "POST",
      token,
      body: JSON.stringify(data),
    },
  );
}

export function updateOwnerService(
  token: string,
  serviceId: string,
  data: UpdateOwnerServiceData,
): Promise<OwnerService> {
  return api<OwnerService>(
    `/salon-admin/services/${serviceId}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    },
  );
}

export function deleteOwnerService(
  token: string,
  serviceId: string,
): Promise<OwnerService> {
  return api<OwnerService>(
    `/salon-admin/services/${serviceId}`,
    {
      method: "DELETE",
      token,
    },
  );
}

