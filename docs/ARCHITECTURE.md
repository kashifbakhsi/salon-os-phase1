# SalonOS — Architecture

## High-level architecture

```text
Customer / Staff / Admin
          |
          v
      Next.js
      Frontend
          |
       REST API
          |
          v
       NestJS
       Backend
          |
          v
        Prisma
          |
          v
      PostgreSQL

External services:
- Razorpay
- WhatsApp Business API
- Email provider
```

## Frontend routes

```text
/
 /salons
 /salons/[id]
 /login
 /register

 /dashboard
 /appointments
 /appointments/[id]
 /profile

 /admin
 /admin/salon
 /admin/services
 /admin/staff
 /admin/appointments
 /admin/customers
 /admin/payments
 /admin/reports
 /admin/settings

 /staff
 /staff/appointments
 /staff/schedule
 /staff/profile
```

## Backend module plan

```text
AuthModule
UsersModule
SalonsModule
ServicesModule
StaffModule
AvailabilityModule
AppointmentsModule
PaymentsModule
ReviewsModule       # later
NotificationsModule # later
MembershipsModule   # later
QueueModule         # later
```

## Booking calculation

```text
Salon working hours
        +
Staff working hours
        +
Staff leave/blocked periods
        +
Existing appointments
        +
Service duration
        =
Available slots
```

Availability must be calculated on the server and rechecked immediately before creating an appointment.

## Security

- Passwords hashed with bcrypt.
- JWT access authentication.
- Role-based guards.
- Server-side authorization.
- Server-side Razorpay payment verification.
- DTO validation.
- Database constraints and indexes.
