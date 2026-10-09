import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";


import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { CreateStaffDto } from "./dto/create-staff.dto";
import { UpdateStaffDto } from "./dto/update-staff.dto";
import {
  randomBytes,
  createHash,
} from "crypto";
import { CreateStaffInvitationDto } from "./dto/create-staff-invitation.dto";
import {
  UpdateWorkingHoursDto,
} from "./dto/update-working-hours.dto";
import { AppointmentStatus } from "../generated/prisma/client";

@Injectable()
export class SalonAdminService {
constructor(
private readonly prisma: PrismaService,
) {}
async getOwnerAppointments(
  ownerId: string,
  filters?: {
    status?: AppointmentStatus;
    staffId?: string;
    serviceId?: string;
    date?: string;
  },
) {
  const salon =
    await this.getOwnerSalon(ownerId);

  const where: any = {
    salonId: salon.id,
  };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.staffId) {
    where.staffId = filters.staffId;
  }

  if (filters?.serviceId) {
    where.serviceId = filters.serviceId;
  }

  if (filters?.date) {
    const startOfDay = new Date(
      `${filters.date}T00:00:00`,
    );

    const endOfDay = new Date(
      `${filters.date}T23:59:59.999`,
    );

    where.startAt = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  return this.prisma.appointment.findMany({
    where,

    orderBy: {
      startAt: "asc",
    },

    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },

      staff: {
        select: {
          id: true,
          displayName: true,
          active: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },

      service: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          durationMinutes: true,
        },
      },

      payment: {
        select: {
          id: true,
          provider: true,
          amount: true,
          currency: true,
          status: true,
          paidAt: true,
        },
      },
    },
  });
}
async getOwnerAppointment(
  ownerId: string,
  appointmentId: string,
) {
  const salon =
    await this.getOwnerSalon(ownerId);

  const appointment =
    await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        salonId: salon.id,
      },

      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },

        staff: {
          select: {
            id: true,
            displayName: true,
            active: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },

        service: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            durationMinutes: true,
          },
        },

        payment: {
          select: {
            id: true,
            provider: true,
            providerOrderId: true,
            providerPaymentId: true,
            amount: true,
            currency: true,
            status: true,
            paidAt: true,
          },
        },

        salon: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

  if (!appointment) {
    throw new NotFoundException(
      "Appointment not found.",
    );
  }

  return appointment;
}
async updateOwnerAppointmentStatus(
  ownerId: string,
  appointmentId: string,
  status: AppointmentStatus,
) {
  const salon =
    await this.getOwnerSalon(ownerId);

  const appointment =
    await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        salonId: salon.id,
      },
    });

  if (!appointment) {
    throw new NotFoundException(
      "Appointment not found.",
    );
  }

  const currentStatus =
    appointment.status;

  const allowedTransitions: Record<
    AppointmentStatus,
    AppointmentStatus[]
  > = {
    PENDING: [
      AppointmentStatus.CONFIRMED,
      AppointmentStatus.CANCELLED,
      AppointmentStatus.NO_SHOW,
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

  const allowed =
    allowedTransitions[currentStatus] || [];

  if (!allowed.includes(status)) {
    throw new BadRequestException(
      `Appointment cannot move from ${currentStatus} to ${status}.`,
    );
  }

  return this.prisma.appointment.update({
    where: {
      id: appointment.id,
    },

    data: {
      status,
    },

    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },

      staff: {
        select: {
          id: true,
          displayName: true,
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

      payment: {
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          paidAt: true,
        },
      },
    },
  });
}
private validateWorkingHours(
  hours: {
    dayOfWeek: number;
    open: boolean;
    openTime: string;
    closeTime: string;
  }[],
) {
  const days =
    new Set(
      hours.map(
        (hour) =>
          hour.dayOfWeek,
      ),
    );

  if (days.size !== 7) {
    throw new BadRequestException(
      "Working hours must contain exactly one entry for each day.",
    );
  }

  for (const hour of hours) {
    if (!hour.open) {
      continue;
    }

    if (
      hour.openTime >=
      hour.closeTime
    ) {
      throw new BadRequestException(
        `Closing time must be after opening time for day ${hour.dayOfWeek}.`,
      );
    }
  }
}
async getSalonWorkingHours(
  ownerId: string,
) {
  const salon =
    await this.getOwnerSalon(
      ownerId,
    );

  return this.prisma.salonWorkingHour.findMany(
    {
      where: {
        salonId: salon.id,
      },
      orderBy: {
        dayOfWeek: "asc",
      },
    },
  );
}
async updateSalonWorkingHours(
  ownerId: string,
  dto: UpdateWorkingHoursDto,
) {
  const salon =
    await this.getOwnerSalon(
      ownerId,
    );

  this.validateWorkingHours(
    dto.hours,
  );

  await this.prisma.$transaction(
    async (tx) => {
      await tx.salonWorkingHour.deleteMany(
        {
          where: {
            salonId: salon.id,
          },
        },
      );

      await tx.salonWorkingHour.createMany(
        {
          data: dto.hours.map(
            (hour) => ({
              salonId: salon.id,
              dayOfWeek:
                hour.dayOfWeek,
              open: hour.open,
              openTime:
                hour.openTime,
              closeTime:
                hour.closeTime,
            }),
          ),
        },
      );
    },
  );

  return this.getSalonWorkingHours(
    ownerId,
  );
}
async createStaffInvitation(
  ownerId: string,
  dto: CreateStaffInvitationDto,
) {
  const salon = await this.getOwnerSalon(ownerId);

  if (salon.status !== "ACTIVE") {
    throw new BadRequestException(
      "Your salon must be active before staff can be invited.",
    );
  }

  if (!dto.email && !dto.phone) {
    throw new BadRequestException(
      "Staff email or phone is required.",
    );
  }

  const existingUser =
    await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(dto.email
            ? [{ email: dto.email }]
            : []),

          ...(dto.phone
            ? [{ phone: dto.phone }]
            : []),
        ],
      },
    });

  if (existingUser) {
    throw new ConflictException(
      "A user with this email or phone already exists.",
    );
  }

  const pendingInvitation =
    await this.prisma.staffInvitation.findFirst({
      where: {
        salonId: salon.id,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
        OR: [
          ...(dto.email
            ? [{ email: dto.email }]
            : []),

          ...(dto.phone
            ? [{ phone: dto.phone }]
            : []),
        ],
      },
    });

  if (pendingInvitation) {
    throw new ConflictException(
      "An active invitation already exists for this staff member.",
    );
  }

  const rawToken =
    randomBytes(32).toString("hex");

  const tokenHash =
    createHash("sha256")
      .update(rawToken)
      .digest("hex");

  const expiresAt =
    new Date(
      Date.now() +
        24 * 60 * 60 * 1000,
    );

  await this.prisma.staffInvitation.create({
    data: {
      salonId: salon.id,
      email: dto.email,
      phone: dto.phone,
      tokenHash,
      expiresAt,
    },
  });

  const frontendUrl =
    process.env.FRONTEND_URL ||
    "http://localhost:3000";

  const invitationUrl =
    `${frontendUrl}/owner/staff/accept-invitation?token=${rawToken}`;

  return {
    message:
      "Staff invitation created successfully.",
    invitationUrl,
    expiresAt,
  };
}
async getStaff(ownerId: string) {
  const salon = await this.getOwnerSalon(ownerId);

  return this.prisma.staff.findMany({
    where: {
      salonId: salon.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      },
      services: {
        include: {
          service: {
            select: {
              id: true,
              name: true,
              price: true,
              durationMinutes: true,
              active: true,
            },
          },
        },
      },
    },
    orderBy: {
      displayName: "asc",
    },
  });
}
async updateStaff(
  ownerId: string,
  staffId: string,
  dto: UpdateStaffDto,
) {
  const salon = await this.getOwnerSalon(ownerId);

  const staff = await this.prisma.staff.findFirst({
    where: {
      id: staffId,
      salonId: salon.id,
    },
  });

  if (!staff) {
    throw new NotFoundException(
      "Staff member not found.",
    );
  }

  if (dto.email || dto.phone) {
    const existingUser =
      await this.prisma.user.findFirst({
        where: {
          OR: [
            ...(dto.email
              ? [{ email: dto.email }]
              : []),
            ...(dto.phone
              ? [{ phone: dto.phone }]
              : []),
          ],
          NOT: {
            id: staff.userId,
          },
        },
      });

    if (existingUser) {
      throw new ConflictException(
        "Another user already uses this email or phone.",
      );
    }
  }

  if (dto.serviceIds) {
    const validServices =
      await this.prisma.service.count({
        where: {
          id: {
            in: dto.serviceIds,
          },
          salonId: salon.id,
        },
      });

    if (
      validServices !== dto.serviceIds.length
    ) {
      throw new BadRequestException(
        "One or more selected services do not belong to your salon.",
      );
    }
  }

  const updatedStaff =
    await this.prisma.staff.update({
      where: {
        id: staff.id,
      },

      data: {
        displayName:
          dto.displayName ??
          staff.displayName,

        bio:
          dto.bio !== undefined
            ? dto.bio
            : staff.bio,

        specialization:
          dto.specialization !== undefined
            ? dto.specialization
            : staff.specialization,

        experienceYears:
          dto.experienceYears !== undefined
            ? dto.experienceYears
            : staff.experienceYears,

        active:
          dto.active !== undefined
            ? dto.active
            : staff.active,

        ...(dto.serviceIds
          ? {
              services: {
                deleteMany: {},

                create:
                  dto.serviceIds.map(
                    (serviceId) => ({
                      service: {
                        connect: {
                          id: serviceId,
                        },
                      },
                    }),
                  ),
              },
            }
          : {}),

        user: {
          update: {
            ...(dto.displayName
              ? {
                  name: dto.displayName,
                }
              : {}),

            ...(dto.email !== undefined
              ? {
                  email: dto.email,
                }
              : {}),

            ...(dto.phone !== undefined
              ? {
                  phone: dto.phone,
                }
              : {}),
          },
        },
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },

        services: {
          include: {
            service: true,
          },
        },
      },
    });

  return updatedStaff;
}
async deactivateStaff(
  ownerId: string,
  staffId: string,
) {
  const salon = await this.getOwnerSalon(ownerId);

  const staff = await this.prisma.staff.findFirst({
    where: {
      id: staffId,
      salonId: salon.id,
    },
  });

  if (!staff) {
    throw new NotFoundException(
      "Staff member not found.",
    );
  }

  return this.prisma.staff.update({
    where: {
      id: staff.id,
    },

    data: {
      active: false,
    },
  });
}
async createStaff(
  ownerId: string,
  dto: CreateStaffDto,
) {
  const salon = await this.getOwnerSalon(ownerId);

  if (salon.status !== "ACTIVE") {
    throw new BadRequestException(
      "Your salon must be active before staff can be added.",
    );
  }

  if (!dto.email && !dto.phone) {
    throw new BadRequestException(
      "Staff email or phone is required.",
    );
  }

  const existingUser = await this.prisma.user.findFirst({
    where: {
      OR: [
        ...(dto.email
          ? [{ email: dto.email }]
          : []),
        ...(dto.phone
          ? [{ phone: dto.phone }]
          : []),
      ],
    },
  });

  if (existingUser) {
    throw new ConflictException(
      "A user with this email or phone already exists.",
    );
  }

  const user = await this.prisma.user.create({
    data: {
      name: dto.displayName,
      email: dto.email,
      phone: dto.phone,
      passwordHash: "",
      role: "STAFF",
    },
  });

  try {
    const staff = await this.prisma.staff.create({
      data: {
        userId: user.id,
        salonId: salon.id,
        displayName: dto.displayName,
        bio: dto.bio,
        specialization: dto.specialization,
        experienceYears:
          dto.experienceYears ?? 0,
        active: true,

        ...(dto.serviceIds?.length
          ? {
              services: {
                create: dto.serviceIds.map(
                  (serviceId) => ({
                    service: {
                      connect: {
                        id: serviceId,
                      },
                    },
                  }),
                ),
              },
            }
          : {}),
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    return staff;
  } catch (error) {
    await this.prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    throw error;
  }
}
private async getOwnerSalon(ownerId: string) {
  const salon = await this.prisma.salon.findFirst({
    where: {
      ownerId,
    },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });

  if (!salon) {
    throw new NotFoundException(
      "No salon is associated with this owner account.",
    );
  }

  return salon;
}
async getServices(ownerId: string) {
  const salon = await this.getOwnerSalon(ownerId);

  return this.prisma.service.findMany({
    where: {
      salonId: salon.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
async createService(
  ownerId: string,
  dto: CreateServiceDto,
) {
  const salon = await this.getOwnerSalon(ownerId);

  if (salon.status !== "ACTIVE") {
    throw new NotFoundException(
      "Your salon is not currently active.",
    );
  }

  return this.prisma.service.create({
    data: {
      salonId: salon.id,

      name: dto.name.trim(),

      description:
        dto.description?.trim() || null,

      price: dto.price,

      durationMinutes:
        dto.durationMinutes,

      active:
        dto.active ?? true,
    },
  });
}
async updateService(
  ownerId: string,
  serviceId: string,
  dto: UpdateServiceDto,
) {
  const salon = await this.getOwnerSalon(ownerId);

  const service =
    await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        salonId: salon.id,
      },
    });

  if (!service) {
    throw new NotFoundException(
      "Service not found.",
    );
  }

  return this.prisma.service.update({
    where: {
      id: service.id,
    },
    data: {
      ...(dto.name !== undefined
        ? {
            name: dto.name.trim(),
          }
        : {}),

      ...(dto.description !== undefined
        ? {
            description:
              dto.description.trim() ||
              null,
          }
        : {}),

      ...(dto.price !== undefined
        ? {
            price: dto.price,
          }
        : {}),

      ...(dto.durationMinutes !== undefined
        ? {
            durationMinutes:
              dto.durationMinutes,
          }
        : {}),

      ...(dto.active !== undefined
        ? {
            active: dto.active,
          }
        : {}),
    },
  });
}
async deleteService(
  ownerId: string,
  serviceId: string,
) {
  const salon = await this.getOwnerSalon(ownerId);

  const service =
    await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        salonId: salon.id,
      },
    });

  if (!service) {
    throw new NotFoundException(
      "Service not found.",
    );
  }

  const appointmentCount =
    await this.prisma.appointment.count({
      where: {
        serviceId: service.id,
      },
    });

  if (appointmentCount > 0) {
    /*
     * Do not physically delete a service
     * that has appointment history.
     *
     * Instead deactivate it.
     */
    return this.prisma.service.update({
      where: {
        id: service.id,
      },
      data: {
        active: false,
      },
    });
  }

  return this.prisma.service.delete({
    where: {
      id: service.id,
    },
  });
}
async getDashboard(ownerId: string) {
const salon =
await this.prisma.salon.findFirst({
where: {
ownerId,
},
include: {
_count: {
select: {
staff: true,
services: true,
appointments: true,
reviews: true,
},
},
},
});

if (!salon) {
  throw new NotFoundException(
    "No salon found for this account",
  );
}

const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999);

const [
  todayAppointments,
  pendingAppointments,
  completedToday,
  activeServices,
  activeStaff,
  customers,
  todayPaidPayments,
] = await Promise.all([
  this.prisma.appointment.findMany({
    where: {
      salonId: salon.id,
      startAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      staff: {
        select: {
          id: true,
          displayName: true,
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
      payment: {
        select: {
          status: true,
          amount: true,
          currency: true,
        },
      },
    },
    orderBy: {
      startAt: "asc",
    },
  }),

  this.prisma.appointment.count({
    where: {
      salonId: salon.id,
      status: "PENDING",
    },
  }),

  this.prisma.appointment.count({
    where: {
      salonId: salon.id,
      status: "COMPLETED",
      startAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  }),

  this.prisma.service.count({
    where: {
      salonId: salon.id,
      active: true,
    },
  }),

  this.prisma.staff.count({
    where: {
      salonId: salon.id,
      active: true,
    },
  }),

  this.prisma.appointment.findMany({
    where: {
      salonId: salon.id,
    },
    distinct: ["customerId"],
    select: {
      customerId: true,
    },
  }),

  this.prisma.payment.aggregate({
    where: {
      status: "PAID",
      appointment: {
        salonId: salon.id,
        startAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    },
    _sum: {
      amount: true,
    },
  }),
]);

return {
  salon: {
    id: salon.id,
    name: salon.name,
    slug: salon.slug,
    description: salon.description,
    phone: salon.phone,
    email: salon.email,
    address: salon.address,
    city: salon.city,
    state: salon.state,
    postalCode: salon.postalCode,
    status: salon.status,
  },

  statistics: {
    todayAppointments:
      todayAppointments.length,

    pendingAppointments,

    completedToday,

    activeServices,

    activeStaff,

    totalCustomers:
      customers.length,

    totalAppointments:
      salon._count.appointments,

    totalReviews:
      salon._count.reviews,

    todayRevenue:
      todayPaidPayments._sum.amount ?? 0,
  },

  todayAppointments,
};

}
}
