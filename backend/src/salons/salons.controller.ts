import {
  Controller,
  Get,
  Param,
  UseGuards,
} from "@nestjs/common";

import { SalonsService } from "./salons.service";


import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("salons")
export class SalonsController {
  constructor(
    private readonly salonsService: SalonsService,
  ) {}
@Get("mine")
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles("SALON_ADMIN")
getMySalon(
  @CurrentUser()
  user: {
    sub: string;
    role: string;
  },
) {
  return this.salonsService.findMySalon(
    user.sub,
  );
}
  @Get()
  async findAll() {
    return this.salonsService.findAll();
  }

  @Get(":slug")
  async findBySlug(
    @Param("slug") slug: string,
  ) {
    return this.salonsService.findBySlug(slug);
  }
}