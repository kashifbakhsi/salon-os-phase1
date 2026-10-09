import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import {
  createHash,
} from "crypto";


import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

import { PrismaService } from "../prisma/prisma.service";

import { RegisterCustomerDto } from "./dto/register-customer.dto";
import { RegisterSalonOwnerDto } from "./dto/register-salon-owner.dto";
import {
  AcceptStaffInvitationDto,
} from "./dto/accept-staff-invitation.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}
async acceptStaffInvitation(
  dto: AcceptStaffInvitationDto,
) {
  const tokenHash =
    createHash("sha256")
      .update(dto.token)
      .digest("hex");

  const invitation =
    await this.prisma.staffInvitation.findUnique({
      where: {
        tokenHash,
      },
    });

  if (!invitation) {
    throw new BadRequestException(
      "Invalid staff invitation.",
    );
  }

  if (invitation.acceptedAt) {
    throw new BadRequestException(
      "This invitation has already been accepted.",
    );
  }

  if (
    invitation.expiresAt <=
    new Date()
  ) {
    throw new BadRequestException(
      "This staff invitation has expired.",
    );
  }

  const existingUser =
    await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(invitation.email
            ? [
                {
                  email:
                    invitation.email,
                },
              ]
            : []),

          ...(invitation.phone
            ? [
                {
                  phone:
                    invitation.phone,
                },
              ]
            : []),
        ],
      },
    });

  if (existingUser) {
    throw new ConflictException(
      "An account already exists for this staff invitation.",
    );
  }

  const passwordHash =
    await bcrypt.hash(
      dto.password,
      12,
    );

  const result =
    await this.prisma.$transaction(
      async (tx) => {
        const user =
          await tx.user.create({
            data: {
              name: dto.name,
              email:
                invitation.email,
              phone:
                invitation.phone,
              passwordHash,
              role: "STAFF",
            },
          });

        const staff =
          await tx.staff.create({
            data: {
              userId: user.id,
              salonId:
                invitation.salonId,
              displayName: dto.name,
              active: true,
              experienceYears: 0,
            },
          });

        await tx.staffInvitation.update({
          where: {
            id: invitation.id,
          },
          data: {
            acceptedAt:
              new Date(),
          },
        });

        return {
          user,
          staff,
        };
      },
    );

  const token =
    await this.createToken(
      result.user,
    );

  return {
    message:
      "Staff invitation accepted successfully.",
    token,
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      phone: result.user.phone,
      role: result.user.role,
    },
  };
}
  // =========================================================
  // CUSTOMER REGISTRATION
  // =========================================================

  async registerCustomer(
    dto: RegisterCustomerDto,
  ) {
    const email =
      dto.email?.trim().toLowerCase() ||
      undefined;

    const phone =
      dto.phone?.trim() || undefined;

    if (!email && !phone) {
      throw new BadRequestException(
        "Email or phone number is required.",
      );
    }

    await this.ensureIdentityAvailable(
      email,
      phone,
    );

    const passwordHash =
      await bcrypt.hash(
        dto.password,
        12,
      );

    const user =
      await this.prisma.user.create({
        data: {
          name: dto.name.trim(),
          email: email || null,
          phone: phone || null,
          passwordHash,

          // IMPORTANT:
          // Role is controlled by backend.
          role: "CUSTOMER",
        },

        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      });

    const token =
      this.createToken(user);

    return {
      message:
        "Customer registration successful",
      token,
      user,
    };
  }

  // =========================================================
  // SALON OWNER REGISTRATION
  // =========================================================

  async registerSalonOwner(
    dto: RegisterSalonOwnerDto,
  ) {
    const ownerEmail =
      dto.ownerEmail
        ?.trim()
        .toLowerCase() ||
      undefined;

    const ownerPhone =
      dto.ownerPhone?.trim() ||
      undefined;

    if (
      !ownerEmail &&
      !ownerPhone
    ) {
      throw new BadRequestException(
        "Owner email or phone number is required.",
      );
    }

    await this.ensureIdentityAvailable(
      ownerEmail,
      ownerPhone,
    );

    const passwordHash =
      await bcrypt.hash(
        dto.password,
        12,
      );

    const slug =
      await this.generateUniqueSlug(
        dto.salonName,
      );

    const result =
      await this.prisma.$transaction(
        async (tx) => {
          const owner =
            await tx.user.create({
              data: {
                name:
                  dto.ownerName.trim(),

                email:
                  ownerEmail ||
                  null,

                phone:
                  ownerPhone ||
                  null,

                passwordHash,

                // IMPORTANT:
                // Role is controlled by backend.
                role: "SALON_ADMIN",
              },

              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
              },
            });

          const salon =
            await tx.salon.create({
              data: {
                name:
                  dto.salonName.trim(),

                slug,

                description:
                  dto.description
                    ?.trim() ||
                  null,

                phone:
                  dto.salonPhone
                    ?.trim() ||
                  null,

                email:
                  dto.salonEmail
                    ?.trim()
                    .toLowerCase() ||
                  null,

                address:
                  dto.address.trim(),

                city:
                  dto.city.trim(),

                state:
                  dto.state.trim(),

                postalCode:
                  dto.postalCode
                    ?.trim() ||
                  null,

                ownerId: owner.id,

                // New salons are not
                // immediately public.
                status: "PENDING",
              },
            });

          return {
            owner,
            salon,
          };
        },
      );

    const token =
      this.createToken(
        result.owner,
      );

    return {
      message:
        "Salon registration submitted successfully",
      token,
      user: result.owner,
      salon: {
        id: result.salon.id,
        name: result.salon.name,
        slug: result.salon.slug,
        status: result.salon.status,
      },
    };
  }

  // =========================================================
  // CHECK EMAIL / PHONE
  // =========================================================

  private async ensureIdentityAvailable(
    email?: string,
    phone?: string,
  ) {
    if (email) {
      const existingEmail =
        await this.prisma.user.findUnique({
          where: {
            email,
          },
        });

      if (existingEmail) {
        throw new BadRequestException(
          "Email is already registered.",
        );
      }
    }

    if (phone) {
      const existingPhone =
        await this.prisma.user.findUnique({
          where: {
            phone,
          },
        });

      if (existingPhone) {
        throw new BadRequestException(
          "Phone number is already registered.",
        );
      }
    }
  }

  // =========================================================
  // CREATE BASE SLUG
  // =========================================================

  private createSlug(
    value: string,
  ): string {
    return value
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "");
  }

  // =========================================================
  // CREATE UNIQUE SALON SLUG
  // =========================================================

  private async generateUniqueSlug(
    salonName: string,
  ): Promise<string> {
    const baseSlug =
      this.createSlug(
        salonName,
      ) || "salon";

    let slug = baseSlug;

    let counter = 1;

    while (true) {
      const existing =
        await this.prisma.salon.findUnique(
          {
            where: {
              slug,
            },
            select: {
              id: true,
            },
          },
        );

      if (!existing) {
        return slug;
      }

      counter += 1;

      slug = `${baseSlug}-${counter}`;
    }
  }

  // =========================================================
  // LOGIN
  // =========================================================

  async login(
    identifier: string,
    password: string,
  ) {
    const normalized =
      identifier.trim();

    const user =
      await this.prisma.user.findFirst({
        where: {
          OR: [
            {
              email:
                normalized.toLowerCase(),
            },
            {
              phone: normalized,
            },
          ],
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        "Invalid email/phone or password",
      );
    }

    const passwordValid =
      await bcrypt.compare(
        password,
        user.passwordHash,
      );

    if (!passwordValid) {
      throw new UnauthorizedException(
        "Invalid email/phone or password",
      );
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };

    const token =
      this.createToken(
        safeUser,
      );

    return {
      message:
        "Login successful",
      token,
      user: safeUser,
    };
  }

  // =========================================================
  // CURRENT USER
  // =========================================================

  async getMe(
    userId: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        "User no longer exists",
      );
    }

    return user;
  }

  // =========================================================
  // JWT
  // =========================================================

  private createToken(user: {
    id: string;
    role: string;
  }) {
    const secret =
      process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        "JWT_SECRET is not configured",
      );
    }

    return jwt.sign(
      {
        sub: user.id,
        role: user.role,
      },
      secret,
      {
        expiresIn:
          (process.env.JWT_EXPIRES_IN ||
            "7d") as jwt.SignOptions["expiresIn"],
      },
    );
  }
}