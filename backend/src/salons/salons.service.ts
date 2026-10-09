import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SalonsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return this.prisma.salon.findMany({
      where: {
        status: "ACTIVE",
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        latitude: true,
        longitude: true,
        status: true,
      },
    });
  }
  async findMySalon(userId: string) {
  const salon =
    await this.prisma.salon.findFirst({
      where: {
        ownerId: userId,
      },

      include: {
        services: {
          orderBy: {
            name: "asc",
          },
        },

        staff: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },

          orderBy: {
            displayName: "asc",
          },
        },

        workingHours: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },
      },
    });

  if (!salon) {
    throw new NotFoundException(
      "Salon not found.",
    );
  }

  return salon;
}

  async findBySlug(slug: string) {
    const salon = await this.prisma.salon.findFirst({
      where: {
        slug,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        latitude: true,
        longitude: true,
        status: true,

        services: {
          where: {
            active: true,
          },
          orderBy: {
            name: "asc",
          },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            durationMinutes: true,
            active: true,
          },
        },

        staff: {
          where: {
            active: true,
          },
          orderBy: {
            displayName: "asc",
          },
          select: {
            id: true,
            displayName: true,
            bio: true,
            specialization: true,
            experienceYears: true,

            services: {
              select: {
                service: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },

        workingHours: {
          orderBy: {
            dayOfWeek: "asc",
          },
          select: {
            id: true,
            dayOfWeek: true,
            isClosed: true,
            openTime: true,
            closeTime: true,
          },
        },
      },
    });

    if (!salon) {
      throw new NotFoundException(
        "Salon not found",
      );
    }

    return salon;
  }
}