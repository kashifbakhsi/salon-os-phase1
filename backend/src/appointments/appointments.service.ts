
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { AppointmentStatus } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =========================================================
  // CREATE APPOINTMENT
  // =========================================================

  async create(dto: {
    customerId: string;
    salonId: string;
    staffId: string;
    serviceId: string;
    startAt: string;
    notes?: string;
  }) {
    const startAt = new Date(dto.startAt);

    if (Number.isNaN(startAt.getTime())) {
      throw new BadRequestException(
        "Invalid startAt date",
      );
    }

    if (startAt <= new Date()) {
      throw new BadRequestException(
        "Appointment must be in the future",
      );
    }

    // ---------------------------------------------------------
    // Service validation
    // ---------------------------------------------------------

    const service =
      await this.prisma.service.findUnique({
        where: {
          id: dto.serviceId,
        },
      });

    if (!service || !service.active) {
      throw new NotFoundException(
        "Service not found or inactive",
      );
    }

    if (service.salonId !== dto.salonId) {
      throw new BadRequestException(
        "Service does not belong to this salon",
      );
    }

    // ---------------------------------------------------------
    // Salon validation
    // ---------------------------------------------------------

    const salon =
      await this.prisma.salon.findUnique({
        where: {
          id: dto.salonId,
        },
      });

    if (!salon) {
      throw new NotFoundException(
        "Salon not found",
      );
    }

    if (salon.status !== "ACTIVE") {
      throw new BadRequestException(
        "Salon is not currently active",
      );
    }

    // ---------------------------------------------------------
    // Customer validation
    // ---------------------------------------------------------

    const customer =
      await this.prisma.user.findUnique({
        where: {
          id: dto.customerId,
        },
      });

    if (!customer) {
      throw new NotFoundException(
        "Customer not found",
      );
    }

    if (customer.role !== "CUSTOMER") {
      throw new BadRequestException(
        "Selected user is not a customer",
      );
    }

    // ---------------------------------------------------------
    // Staff validation
    // ---------------------------------------------------------

    const staff =
      await this.prisma.staff.findUnique({
        where: {
          id: dto.staffId,
        },
      });

    if (!staff || !staff.active) {
      throw new NotFoundException(
        "Staff member not found or inactive",
      );
    }

    if (staff.salonId !== dto.salonId) {
      throw new BadRequestException(
        "Staff does not belong to this salon",
      );
    }

    // ---------------------------------------------------------
    // Staff service validation
    // ---------------------------------------------------------

    const staffService =
      await this.prisma.staffService.findUnique({
        where: {
          staffId_serviceId: {
            staffId: dto.staffId,
            serviceId: dto.serviceId,
          },
        },
      });

    if (!staffService) {
      throw new BadRequestException(
        "Selected staff member cannot perform this service",
      );
    }

    // ---------------------------------------------------------
    // Calculate end time
    // ---------------------------------------------------------

    const endAt = new Date(
      startAt.getTime() +
        service.durationMinutes * 60 * 1000,
    );

    const dayOfWeek = startAt.getDay();

    // =========================================================
    // SALON WORKING HOURS
    // =========================================================

    const salonHours =
      await this.prisma.salonWorkingHour.findUnique({
        where: {
          salonId_dayOfWeek: {
            salonId: dto.salonId,
            dayOfWeek,
          },
        },
      });

    if (!salonHours || salonHours.isClosed) {
      throw new BadRequestException(
        "Salon is closed on this day",
      );
    }

    if (
      !salonHours.openTime ||
      !salonHours.closeTime
    ) {
      throw new BadRequestException(
        "Salon working hours are not configured",
      );
    }

    if (
      !this.isWithinWorkingHours(
        startAt,
        endAt,
        salonHours.openTime,
        salonHours.closeTime,
      )
    ) {
      throw new BadRequestException(
        "Appointment is outside salon working hours",
      );
    }

    // =========================================================
    // STAFF WORKING HOURS
    // =========================================================

    const staffHours =
      await this.prisma.staffWorkingHour.findUnique({
        where: {
          staffId_dayOfWeek: {
            staffId: dto.staffId,
            dayOfWeek,
          },
        },
      });

    if (!staffHours || staffHours.isClosed) {
      throw new BadRequestException(
        "Staff is not working on this day",
      );
    }

    if (
      !staffHours.openTime ||
      !staffHours.closeTime
    ) {
      throw new BadRequestException(
        "Staff working hours are not configured",
      );
    }

    if (
      !this.isWithinWorkingHours(
        startAt,
        endAt,
        staffHours.openTime,
        staffHours.closeTime,
      )
    ) {
      throw new BadRequestException(
        "Appointment is outside staff working hours",
      );
    }

    // =========================================================
    // STAFF BLOCKED PERIOD
    // =========================================================

    const blocked =
      await this.prisma.staffBlock.findFirst({
        where: {
          staffId: dto.staffId,

          startAt: {
            lt: endAt,
          },

          endAt: {
            gt: startAt,
          },
        },
      });

    if (blocked) {
      throw new BadRequestException(
        "Staff is unavailable during this time",
      );
    }

    // =========================================================
    // EXISTING APPOINTMENT / DOUBLE BOOKING
    // =========================================================

    const existing =
      await this.prisma.appointment.findFirst({
        where: {
          staffId: dto.staffId,

          status: {
            in: [
              AppointmentStatus.PENDING,
              AppointmentStatus.CONFIRMED,
              AppointmentStatus.IN_PROGRESS,
            ],
          },

          startAt: {
            lt: endAt,
          },

          endAt: {
            gt: startAt,
          },
        },
      });

    if (existing) {
      throw new BadRequestException(
        "This staff member is already booked during this time",
      );
    }

    // =========================================================
    // CREATE APPOINTMENT
    // =========================================================

    return this.prisma.appointment.create({
      data: {
        customerId: dto.customerId,
        salonId: dto.salonId,
        staffId: dto.staffId,
        serviceId: dto.serviceId,
        startAt,
        endAt,
        notes: dto.notes,
        status: AppointmentStatus.PENDING,
      },

      include: this.appointmentInclude(),
    });
  }

  // =========================================================
  // GET ONE
  // =========================================================

  async findOne(id: string) {
    const appointment =
      await this.prisma.appointment.findUnique({
        where: {
          id,
        },

        include: this.appointmentInclude(true),
      });

    if (!appointment) {
      throw new NotFoundException(
        "Appointment not found",
      );
    }

    return appointment;
  }

  // =========================================================
  // GET ONE FOR CUSTOMER
  // =========================================================
  // IMPORTANT:
  // Customer can only access their own appointment.
  // =========================================================

  async findOneForCustomer(
    appointmentId: string,
    customerId: string,
  ) {
    const appointment =
      await this.prisma.appointment.findUnique({
        where: {
          id: appointmentId,
        },

        include: this.appointmentInclude(true),
      });

    if (!appointment) {
      throw new NotFoundException(
        "Appointment not found",
      );
    }

    if (
      appointment.customerId !==
      customerId
    ) {
      throw new ForbiddenException(
        "You do not have access to this appointment",
      );
    }

    return appointment;
  }

  // =========================================================
  // CUSTOMER APPOINTMENTS
  // =========================================================

  async findByCustomer(
    customerId: string,
  ) {
    const customer =
      await this.prisma.user.findUnique({
        where: {
          id: customerId,
        },
      });

    if (!customer) {
      throw new NotFoundException(
        "Customer not found",
      );
    }

    if (customer.role !== "CUSTOMER") {
      throw new ForbiddenException(
        "Only customers can access customer appointments",
      );
    }

    return this.prisma.appointment.findMany({
      where: {
        customerId,
      },

      orderBy: {
        startAt: "desc",
      },

      include: this.appointmentInclude(true),
    });
  }

  // =========================================================
  // STAFF APPOINTMENTS
  // =========================================================

  async findByStaff(
    staffId: string,
    date?: string,
  ) {
    const staff =
      await this.prisma.staff.findUnique({
        where: {
          id: staffId,
        },
      });

    if (!staff) {
      throw new NotFoundException(
        "Staff member not found",
      );
    }

    const where: any = {
      staffId,
    };

    if (date) {
      const range =
        this.getDateRange(date);

      where.startAt = {
        gte: range.start,
        lt: range.end,
      };
    }

    return this.prisma.appointment.findMany({
      where,

      orderBy: {
        startAt: "asc",
      },

      include: this.appointmentInclude(true),
    });
  }

  // =========================================================
  // SALON / ADMIN APPOINTMENTS
  // =========================================================

  async findBySalon(
    salonId: string,
    date?: string,
    status?: string,
  ) {
    const salon =
      await this.prisma.salon.findUnique({
        where: {
          id: salonId,
        },
      });

    if (!salon) {
      throw new NotFoundException(
        "Salon not found",
      );
    }

    const where: any = {
      salonId,
    };

    if (date) {
      const range =
        this.getDateRange(date);

      where.startAt = {
        gte: range.start,
        lt: range.end,
      };
    }

    if (status) {
      if (
        !Object.values(
          AppointmentStatus,
        ).includes(
          status as AppointmentStatus,
        )
      ) {
        throw new BadRequestException(
          "Invalid appointment status",
        );
      }

      where.status =
        status as AppointmentStatus;
    }

    return this.prisma.appointment.findMany({
      where,

      orderBy: {
        startAt: "asc",
      },

      include: this.appointmentInclude(true),
    });
  }

  // =========================================================
  // CANCEL APPOINTMENT
  // =========================================================
  // General internal/admin cancel method.
  // =========================================================

  async cancel(
    id: string,
    reason?: string,
  ) {
    const appointment =
      await this.prisma.appointment.findUnique({
        where: {
          id,
        },
      });

    if (!appointment) {
      throw new NotFoundException(
        "Appointment not found",
      );
    }

    if (
      appointment.status ===
        AppointmentStatus.COMPLETED ||
      appointment.status ===
        AppointmentStatus.CANCELLED ||
      appointment.status ===
        AppointmentStatus.NO_SHOW
    ) {
      throw new BadRequestException(
        `Appointment cannot be cancelled because it is already ${appointment.status}`,
      );
    }

    if (
      appointment.startAt <= new Date()
    ) {
      throw new BadRequestException(
        "Past appointments cannot be cancelled",
      );
    }

    const existingNotes =
      appointment.notes ?? "";

    const cancellationNote = reason
      ? `Cancellation reason: ${reason}`
      : "Appointment cancelled";

    const notes = existingNotes
      ? `${existingNotes}\n${cancellationNote}`
      : cancellationNote;

    return this.prisma.appointment.update({
      where: {
        id,
      },

      data: {
        status:
          AppointmentStatus.CANCELLED,
        notes,
      },

      include:
        this.appointmentInclude(true),
    });
  }

  // =========================================================
  // CUSTOMER CANCEL
  // =========================================================

  async cancelForCustomer(
    appointmentId: string,
    customerId: string,
    reason?: string,
  ) {
    const appointment =
      await this.findOneForCustomer(
        appointmentId,
        customerId,
      );

    if (
      appointment.status ===
        AppointmentStatus.COMPLETED ||
      appointment.status ===
        AppointmentStatus.CANCELLED ||
      appointment.status ===
        AppointmentStatus.NO_SHOW
    ) {
      throw new BadRequestException(
        `Appointment cannot be cancelled because it is already ${appointment.status}`,
      );
    }

    if (
      new Date(appointment.startAt) <=
      new Date()
    ) {
      throw new BadRequestException(
        "Past appointments cannot be cancelled",
      );
    }

    const existingNotes =
      appointment.notes ?? "";

    const cancellationNote = reason
      ? `Cancellation reason: ${reason}`
      : "Appointment cancelled by customer";

    const notes = existingNotes
      ? `${existingNotes}\n${cancellationNote}`
      : cancellationNote;

    return this.prisma.appointment.update({
      where: {
        id: appointmentId,
      },

      data: {
        status:
          AppointmentStatus.CANCELLED,
        notes,
      },

      include:
        this.appointmentInclude(true),
    });
  }

  // =========================================================
  // RESCHEDULE APPOINTMENT
  // =========================================================

  async reschedule(
    id: string,
    newStartAtString: string,
  ) {
    const appointment =
      await this.prisma.appointment.findUnique({
        where: {
          id,
        },

        include: {
          service: true,
          staff: true,
          salon: true,
        },
      });

    if (!appointment) {
      throw new NotFoundException(
        "Appointment not found",
      );
    }

    if (
      appointment.status ===
        AppointmentStatus.COMPLETED ||
      appointment.status ===
        AppointmentStatus.CANCELLED ||
      appointment.status ===
        AppointmentStatus.NO_SHOW
    ) {
      throw new BadRequestException(
        "This appointment cannot be rescheduled",
      );
    }

    const newStartAt =
      new Date(newStartAtString);

    if (
      Number.isNaN(
        newStartAt.getTime(),
      )
    ) {
      throw new BadRequestException(
        "Invalid new start time",
      );
    }

    if (
      newStartAt <= new Date()
    ) {
      throw new BadRequestException(
        "New appointment time must be in the future",
      );
    }

    const newEndAt = new Date(
      newStartAt.getTime() +
        appointment.service
          .durationMinutes *
          60 *
          1000,
    );

    const dayOfWeek =
      newStartAt.getDay();

    // =========================================================
    // SALON HOURS
    // =========================================================

    const salonHours =
      await this.prisma.salonWorkingHour.findUnique({
        where: {
          salonId_dayOfWeek: {
            salonId:
              appointment.salonId,
            dayOfWeek,
          },
        },
      });

    if (
      !salonHours ||
      salonHours.isClosed
    ) {
      throw new BadRequestException(
        "Salon is closed on the selected day",
      );
    }

    if (
      !salonHours.openTime ||
      !salonHours.closeTime
    ) {
      throw new BadRequestException(
        "Salon working hours are not configured",
      );
    }

    if (
      !this.isWithinWorkingHours(
        newStartAt,
        newEndAt,
        salonHours.openTime,
        salonHours.closeTime,
      )
    ) {
      throw new BadRequestException(
        "New appointment is outside salon working hours",
      );
    }

    // =========================================================
    // STAFF HOURS
    // =========================================================

    const staffHours =
      await this.prisma.staffWorkingHour.findUnique({
        where: {
          staffId_dayOfWeek: {
            staffId:
              appointment.staffId,
            dayOfWeek,
          },
        },
      });

    if (
      !staffHours ||
      staffHours.isClosed
    ) {
      throw new BadRequestException(
        "Staff is unavailable on the selected day",
      );
    }

    if (
      !staffHours.openTime ||
      !staffHours.closeTime
    ) {
      throw new BadRequestException(
        "Staff working hours are not configured",
      );
    }

    if (
      !this.isWithinWorkingHours(
        newStartAt,
        newEndAt,
        staffHours.openTime,
        staffHours.closeTime,
      )
    ) {
      throw new BadRequestException(
        "New appointment is outside staff working hours",
      );
    }

    // =========================================================
    // STAFF BLOCK
    // =========================================================

    const blocked =
      await this.prisma.staffBlock.findFirst({
        where: {
          staffId:
            appointment.staffId,

          startAt: {
            lt: newEndAt,
          },

          endAt: {
            gt: newStartAt,
          },
        },
      });

    if (blocked) {
      throw new BadRequestException(
        "Staff is unavailable during the selected time",
      );
    }

    // =========================================================
    // DOUBLE BOOKING
    // =========================================================

    const conflicting =
      await this.prisma.appointment.findFirst({
        where: {
          id: {
            not: id,
          },

          staffId:
            appointment.staffId,

          status: {
            in: [
              AppointmentStatus.PENDING,
              AppointmentStatus.CONFIRMED,
              AppointmentStatus.IN_PROGRESS,
            ],
          },

          startAt: {
            lt: newEndAt,
          },

          endAt: {
            gt: newStartAt,
          },
        },
      });

    if (conflicting) {
      throw new BadRequestException(
        "Staff is already booked during the selected time",
      );
    }

    // =========================================================
    // UPDATE
    // =========================================================

    return this.prisma.appointment.update({
      where: {
        id,
      },

      data: {
        startAt: newStartAt,
        endAt: newEndAt,
      },

      include:
        this.appointmentInclude(true),
    });
  }

  // =========================================================
  // CUSTOMER RESCHEDULE
  // =========================================================
  // Customer can only reschedule their own appointment.
  // =========================================================

  async rescheduleForCustomer(
    appointmentId: string,
    customerId: string,
    newStartAtString: string,
  ) {
    const appointment =
      await this.findOneForCustomer(
        appointmentId,
        customerId,
      );

    if (
      appointment.status ===
        AppointmentStatus.COMPLETED ||
      appointment.status ===
        AppointmentStatus.CANCELLED ||
      appointment.status ===
        AppointmentStatus.NO_SHOW
    ) {
      throw new BadRequestException(
        "This appointment cannot be rescheduled",
      );
    }

    if (
      new Date(appointment.startAt) <=
      new Date()
    ) {
      throw new BadRequestException(
        "Past appointments cannot be rescheduled",
      );
    }

    return this.reschedule(
      appointmentId,
      newStartAtString,
    );
  }

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  async updateStatus(
    id: string,
    status: AppointmentStatus,
  ) {
    const appointment =
      await this.prisma.appointment.findUnique({
        where: {
          id,
        },
      });

    if (!appointment) {
      throw new NotFoundException(
        "Appointment not found",
      );
    }

    this.validateStatusTransition(
      appointment.status,
      status,
    );

    return this.prisma.appointment.update({
      where: {
        id,
      },

      data: {
        status,
      },

      include:
        this.appointmentInclude(true),
    });
  }

  // =========================================================
  // STATUS TRANSITION RULES
  // =========================================================

  private validateStatusTransition(
    current: AppointmentStatus,
    next: AppointmentStatus,
  ) {
    if (current === next) {
      return;
    }

    const allowed: Record<
      AppointmentStatus,
      AppointmentStatus[]
    > = {
      PENDING: [
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.CANCELLED,
      ],

      CONFIRMED: [
        AppointmentStatus.IN_PROGRESS,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.NO_SHOW,
      ],

      IN_PROGRESS: [
        AppointmentStatus.COMPLETED,
      ],

      COMPLETED: [],

      CANCELLED: [],

      NO_SHOW: [],
    };

    if (
      !allowed[current].includes(next)
    ) {
      throw new BadRequestException(
        `Cannot change appointment from ${current} to ${next}`,
      );
    }
  }

  // =========================================================
  // WORKING HOURS CHECK
  // =========================================================

  private isWithinWorkingHours(
    startAt: Date,
    endAt: Date,
    openTime: string,
    closeTime: string,
  ) {
    const startMinutes =
      startAt.getHours() * 60 +
      startAt.getMinutes();

    const endMinutes =
      endAt.getHours() * 60 +
      endAt.getMinutes();

    const [
      openHour,
      openMinute,
    ] = openTime
      .split(":")
      .map(Number);

    const [
      closeHour,
      closeMinute,
    ] = closeTime
      .split(":")
      .map(Number);

    const openMinutes =
      openHour * 60 +
      openMinute;

    const closeMinutes =
      closeHour * 60 +
      closeMinute;

    return (
      startMinutes >= openMinutes &&
      endMinutes <= closeMinutes
    );
  }

  // =========================================================
  // DATE RANGE
  // =========================================================

  private getDateRange(
    date: string,
  ) {
    const start = new Date(
      `${date}T00:00:00`,
    );

    if (
      Number.isNaN(
        start.getTime(),
      )
    ) {
      throw new BadRequestException(
        "Invalid date. Use YYYY-MM-DD",
      );
    }

    const end = new Date(start);

    end.setDate(
      end.getDate() + 1,
    );

    return {
      start,
      end,
    };
  }

  // =========================================================
  // COMMON INCLUDE
  // =========================================================

  private appointmentInclude(
    includePayment = false,
  ) {
    return {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },

      salon: {
        select: {
          id: true,
          name: true,
          slug: true,
          phone: true,
        },
      },

      staff: {
        select: {
          id: true,
          displayName: true,
          specialization: true,
          experienceYears: true,
        },
      },

      service: {
        select: {
          id: true,
          name: true,
          price: true,
          durationMinutes: true,
        },
      },

      ...(includePayment
        ? {
            payment: true,
          }
        : {}),
    };
  }
}
