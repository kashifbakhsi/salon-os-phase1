export type UserRole =
  | "CUSTOMER"
  | "SALON_ADMIN"
  | "STAFF"
  | "SUPER_ADMIN";

export type User = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
  createdAt?: string;
};

export type Salon = {
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
  status: string;
};
export type SalonAdminDashboard = {
salon: {
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
status: string;
};

statistics: {
todayAppointments: number;
pendingAppointments: number;
completedToday: number;
activeServices: number;
activeStaff: number;
totalCustomers: number;
totalAppointments: number;
totalReviews: number;
todayRevenue: string | number;
};

todayAppointments: {
id: string;
startAt: string;
endAt: string;
status: string;
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
};

service: {
  id: string;
  name: string;
  price: string | number;
  durationMinutes: number;
};

payment?: {
  status: string;
  amount: string | number;
  currency: string;
} | null;


}[];
};


export type Service = {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  durationMinutes: number;
  active: boolean;
};

export type Staff = {
  id: string;
  displayName: string;
  bio?: string | null;
  specialization?: string | null;
  experienceYears: number;
  active: boolean;
};

export type AvailabilitySlot = {
  startAt: string;
  endAt: string;
  staff: Staff[];
};

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type Appointment = {
  id: string;

  startAt: string;
  endAt: string;

  status: AppointmentStatus;

  notes?: string | null;

  customer: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
  };

  salon: {
    id: string;
    name: string;
    slug: string;
    phone?: string | null;
  };

  staff: {
    id: string;
    displayName: string;
    specialization?: string | null;
    experienceYears: number;
  };

  service: {
    id: string;
    name: string;
    price: number | string;
    durationMinutes: number;
  };

  payment?: {
    id: string;
    amount: number | string;
    currency: string;
    status: string;
    providerOrderId?: string | null;
    providerPaymentId?: string | null;
    paidAt?: string | null;
  } | null;
  
};