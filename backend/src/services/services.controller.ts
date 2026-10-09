import {
  Controller,
  Get,
  Param,
} from "@nestjs/common";

import { ServicesService } from "./services.service";

@Controller()
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
  ) {}

  @Get("salons/:slug/services")
  async findBySalon(
    @Param("slug") slug: string,
  ) {
    return this.servicesService.findBySalonSlug(slug);
  }

  @Get("services/:serviceId")
  async findOne(
    @Param("serviceId") serviceId: string,
  ) {
    return this.servicesService.findOne(serviceId);
  }
}