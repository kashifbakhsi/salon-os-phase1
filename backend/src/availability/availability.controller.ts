import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from "@nestjs/common";

import { AvailabilityService } from "./availability.service";

@Controller("salons")
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Get(":slug/availability")
  async getAvailability(
    @Param("slug") slug: string,
    @Query("serviceId") serviceId: string,
    @Query("date") date: string,
  ) {
    if (!serviceId) {
      throw new BadRequestException(
        "serviceId is required",
      );
    }

    if (!date) {
      throw new BadRequestException(
        "date is required in YYYY-MM-DD format",
      );
    }

    return this.availabilityService.getAvailability(
      slug,
      serviceId,
      date,
    );
  }
}