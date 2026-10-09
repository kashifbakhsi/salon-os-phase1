import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findBySalonSlug(slug: string) {
    const salon = await this.prisma.salon.findFirst({
      where: {
        slug,
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    });

    if (!salon) {
      throw new NotFoundException("Salon not found");
    }

    return this.prisma.service.findMany({
      where: {
        salonId: salon.id,
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

        staffServices: {
          where: {
            staff: {
              active: true,
            },
          },
          select: {
            staff: {
              select: {
                id: true,
                displayName: true,
                specialization: true,
                experienceYears: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(serviceId: string) {
    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        active: true,
        salon: {
          status: "ACTIVE",
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        durationMinutes: true,
        active: true,

        salon: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        staffServices: {
          where: {
            staff: {
              active: true,
            },
          },
          select: {
            staff: {
              select: {
                id: true,
                displayName: true,
                bio: true,
                specialization: true,
                experienceYears: true,
              },
            },
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(
        "Service not found",
      );
    }

    return service;
  }
}