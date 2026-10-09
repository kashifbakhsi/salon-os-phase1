# SalonOS — Database Draft

This is the Phase 1 conceptual model. The exact Prisma schema will be created in Phase 2.

## Models

### User
- id
- name
- email
- phone
- passwordHash
- role
- createdAt
- updatedAt

### Salon
- id
- name
- slug
- description
- phone
- email
- address
- city
- state
- postalCode
- latitude
- longitude
- status
- ownerId
- createdAt
- updatedAt

### Staff
- id
- userId
- salonId
- displayName
- bio
- specialization
- experienceYears
- active
- createdAt
- updatedAt

### Service
- id
- salonId
- name
- description
- price
- durationMinutes
- active
- createdAt
- updatedAt

### StaffService
Join model connecting staff to services they can perform.

### SalonWorkingHour
- id
- salonId
- dayOfWeek
- openTime
- closeTime
- enabled

### StaffWorkingHour
- id
- staffId
- dayOfWeek
- startTime
- endTime
- enabled

### StaffBlock
Used for leave, holidays, or manually blocked periods.

- id
- staffId
- startAt
- endAt
- reason

### Appointment
- id
- customerId
- salonId
- staffId
- serviceId
- startAt
- endAt
- status
- notes
- createdAt
- updatedAt

### Payment
- id
- appointmentId
- provider
- providerOrderId
- providerPaymentId
- amount
- currency
- status
- paidAt
- createdAt
- updatedAt

### Review
Later feature.

- id
- customerId
- salonId
- appointmentId
- rating
- comment
- createdAt

## Relationships

```text
User 1 ---- 0..1 Staff
User 1 ---- N Appointments as customer

Salon 1 ---- N Staff
Salon 1 ---- N Services
Salon 1 ---- N Appointments

Staff N ---- N Services
Staff 1 ---- N Appointments
Staff 1 ---- N StaffBlocks

Service 1 ---- N Appointments

Appointment 1 ---- 0..N Payments
Appointment 1 ---- 0..1 Review
```

## Important constraints

- Salon slug should be unique.
- User email should be unique when present.
- User phone should be unique when present.
- A staff member belongs to one salon.
- A service belongs to one salon.
- An appointment must reference a staff member and service belonging to the same salon.
- Appointment times must be validated for overlap.
- Payment provider IDs should be indexed.
