import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

type TimeRange = {
  start: number;
  end: number;
};

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getAvailability(
    slug: string,
    serviceId: string,
    dateString: string,
  ) {
    // ---------------------------------------------------------
    // 1. Validate date
    // ---------------------------------------------------------

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      throw new BadRequestException(
        "Invalid date. Use YYYY-MM-DD",
      );
    }

    const date = new Date(
      `${dateString}T00:00:00`,
    );

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(
        "Invalid date",
      );
    }

    // ---------------------------------------------------------
    // 2. Find salon
    // ---------------------------------------------------------

    const salon = await this.prisma.salon.findFirst({
      where: {
        slug,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!salon) {
      throw new NotFoundException(
        "Salon not found",
      );
    }

    // ---------------------------------------------------------
    // 3. Find service
    // ---------------------------------------------------------

    const service =
      await this.prisma.service.findFirst({
        where: {
          id: serviceId,
          salonId: salon.id,
          active: true,
        },
        select: {
          id: true,
          name: true,
          durationMinutes: true,
        },
      });

    if (!service) {
      throw new NotFoundException(
        "Service not found for this salon",
      );
    }

    // ---------------------------------------------------------
    // 4. Determine day of week
    // ---------------------------------------------------------

    const dayOfWeek = date.getDay();

    // ---------------------------------------------------------
    // 5. Salon working hours
    // ---------------------------------------------------------

    const salonHours =
      await this.prisma.salonWorkingHour.findUnique({
        where: {
          salonId_dayOfWeek: {
            salonId: salon.id,
            dayOfWeek,
          },
        },
      });

    if (
      !salonHours ||
      salonHours.isClosed ||
      !salonHours.openTime ||
      !salonHours.closeTime
    ) {
      return {
        date: dateString,
        salon,
        service,
        slots: [],
        message: "Salon is closed on this day",
      };
    }

    // ---------------------------------------------------------
    // 6. Find eligible staff
    // ---------------------------------------------------------

    const staff = await this.prisma.staff.findMany({
      where: {
        salonId: salon.id,
        active: true,
        services: {
          some: {
            serviceId: service.id,
          },
        },
      },
      select: {
        id: true,
        displayName: true,
        specialization: true,

        workingHours: {
          where: {
            dayOfWeek,
          },
        },

        blockedPeriods: {
          where: {
            startAt: {
              lt: new Date(
                `${dateString}T23:59:59`,
              ),
            },
            endAt: {
              gt: new Date(
                `${dateString}T00:00:00`,
              ),
            },
          },
          select: {
            startAt: true,
            endAt: true,
          },
        },
      },
    });

    if (staff.length === 0) {
      return {
        date: dateString,
        salon,
        service,
        slots: [],
        message:
          "No staff members are available for this service",
      };
    }

    // ---------------------------------------------------------
    // 7. Get existing appointments
    // ---------------------------------------------------------

    const dayStart = new Date(
      `${dateString}T00:00:00`,
    );

    const dayEnd = new Date(
      `${dateString}T23:59:59`,
    );

    const appointments =
      await this.prisma.appointment.findMany({
        where: {
          salonId: salon.id,
          startAt: {
            lt: dayEnd,
          },
          endAt: {
            gt: dayStart,
          },
          status: {
            in: [
              "PENDING",
              "CONFIRMED",
              "IN_PROGRESS",
            ],
          },
        },
        select: {
          staffId: true,
          startAt: true,
          endAt: true,
        },
      });

    // ---------------------------------------------------------
    // 8. Generate slots
    // ---------------------------------------------------------

    const slotDuration = service.durationMinutes;

    const results: {
      startAt: string;
      endAt: string;
      staff: {
        id: string;
        displayName: string;
        specialization: string | null;
      }[];
    }[] = [];

    for (const staffMember of staff) {
      const staffHours =
        staffMember.workingHours[0];

      if (
        !staffHours ||
        staffHours.isClosed ||
        !staffHours.openTime ||
        !staffHours.closeTime
      ) {
        continue;
      }

      const salonRange = this.parseRange(
        salonHours.openTime,
        salonHours.closeTime,
      );

      const staffRange = this.parseRange(
        staffHours.openTime,
        staffHours.closeTime,
      );

      const startMinute = Math.max(
        salonRange.start,
        staffRange.start,
      );

      const endMinute = Math.min(
        salonRange.end,
        staffRange.end,
      );

      for (
        let minute = startMinute;
        minute + slotDuration <= endMinute;
        minute += 30
      ) {
        const startAt = this.buildDate(
          dateString,
          minute,
        );

        const endAt = new Date(
          startAt.getTime() +
            slotDuration * 60 * 1000,
        );

        // Don't offer slots in the past.
        if (
          endAt.getTime() <= Date.now()
        ) {
          continue;
        }

        // Existing appointment conflict.
        const appointmentConflict =
          appointments.some((appointment) => {
            if (
              appointment.staffId !==
              staffMember.id
            ) {
              return false;
            }

            return this.overlaps(
              startAt,
              endAt,
              appointment.startAt,
              appointment.endAt,
            );
          });

        if (appointmentConflict) {
          continue;
        }

        // Staff blocked-period conflict.
        const blockedConflict =
          staffMember.blockedPeriods.some(
            (block) =>
              this.overlaps(
                startAt,
                endAt,
                block.startAt,
                block.endAt,
              ),
          );

        if (blockedConflict) {
          continue;
        }

        const existingSlot = results.find(
          (slot) =>
            slot.startAt ===
            startAt.toISOString(),
        );

        if (existingSlot) {
          existingSlot.staff.push({
            id: staffMember.id,
            displayName:
              staffMember.displayName,
            specialization:
              staffMember.specialization,
          });
        } else {
          results.push({
            startAt:
              startAt.toISOString(),
            endAt:
              endAt.toISOString(),
            staff: [
              {
                id: staffMember.id,
                displayName:
                  staffMember.displayName,
                specialization:
                  staffMember.specialization,
              },
            ],
          });
        }
      }
    }

    results.sort((a, b) =>
      a.startAt.localeCompare(b.startAt),
    );

    return {
      date: dateString,
      salon,
      service,
      slots: results,
    };
  }

  private parseRange(
    openTime: string,
    closeTime: string,
  ): TimeRange {
    return {
      start: this.timeToMinutes(openTime),
      end: this.timeToMinutes(closeTime),
    };
  }

  private timeToMinutes(
    time: string,
  ): number {
    const [hours, minutes] =
      time.split(":").map(Number);

    return hours * 60 + minutes;
  }

  private buildDate(
    dateString: string,
    minutes: number,
  ): Date {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return new Date(
      `${dateString}T${String(hours).padStart(
        2,
        "0",
      )}:${String(mins).padStart(2, "0")}:00`,
    );
  }

  private overlaps(
    startA: Date,
    endA: Date,
    startB: Date,
    endB: Date,
  ): boolean {
    return (
      startA < endB &&
      endA > startB
    );
  }
}