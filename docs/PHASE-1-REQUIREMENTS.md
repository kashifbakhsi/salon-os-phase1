# SalonOS — Phase 1 Requirements

## 1. Product goal

SalonOS solves two primary problems:

1. Customers can discover salons, services, stylists, and available appointment slots.
2. Salon owners can manage their salon, staff, services, availability, appointments, customers, and payments.

## 2. User roles

### CUSTOMER
- Register/login
- Browse salons
- View salon details
- View services and prices
- View stylists
- Check available slots
- Book appointments
- Pay online
- Cancel/reschedule
- View appointment history
- Leave reviews

### SALON_ADMIN
- Manage salon profile
- Manage services
- Manage staff
- Configure working hours
- Manage appointments
- View customers
- View payments
- View revenue
- Manage offers

### STAFF
- Login
- View assigned appointments
- View daily schedule
- View appointment customer information
- Mark appointments as completed
- Manage personal availability

### SUPER_ADMIN
- View/manage salons
- Approve or block salons
- Manage users
- View platform-level statistics
- Handle reports

## 3. Customer booking flow

Home → Find Salon → Salon Details → Service → Stylist → Date → Available Slot → Login/Register → Confirm Appointment → Payment → Confirmation

## 4. Core modules

- Authentication
- Users and roles
- Salons
- Services
- Staff
- Availability
- Appointments
- Payments
- Customer dashboard
- Salon admin dashboard
- Staff dashboard

## 5. Appointment statuses

- PENDING
- CONFIRMED
- IN_PROGRESS
- COMPLETED
- CANCELLED
- NO_SHOW

## 6. Payment statuses

- PENDING
- PAID
- FAILED
- REFUNDED

## 7. Booking rules

- A staff member cannot have overlapping appointments.
- A customer cannot book an unavailable slot.
- Payment must be verified server-side.
- Cancelling an appointment releases its slot.
- Only authorized salon admins can modify their own salon.
- Customers cannot access admin APIs.
- Appointment and payment state are maintained separately.

## 8. Multi-salon architecture

The platform supports multiple salons from the beginning.

Each salon owns its:
- Services
- Staff
- Working hours
- Availability rules
- Appointments
- Customers/appointment relationships

## 9. MVP

### Included
- Authentication
- Role-based authorization
- Salon management
- Services
- Staff
- Working hours
- Availability
- Appointment booking
- Customer dashboard
- Admin dashboard
- Payment integration
- Appointment history

### Later
- WhatsApp notifications
- Email notifications
- Reviews
- Coupons
- Rescheduling
- No-show tracking
- Revenue analytics
- Live queue
- Memberships
- Loyalty points
- Inventory
- AI hairstyle recommendations
- Multi-branch support
- SaaS subscription plans
