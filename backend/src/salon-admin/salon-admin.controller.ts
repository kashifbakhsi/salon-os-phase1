

import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

import { SalonAdminService } from "./salon-admin.service";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
} from "@nestjs/common";



import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { CreateStaffDto } from "./dto/create-staff.dto";
import { UpdateStaffDto } from "./dto/update-staff.dto";
import {
  CreateStaffInvitationDto,
} from "./dto/create-staff-invitation.dto";
import {
  UpdateWorkingHoursDto,
} from "./dto/update-working-hours.dto";
import { AppointmentStatus } from "../generated/prisma/client";

import { UpdateAppointmentStatusDto } from "./dto/update-appointment-status.dto";


@Controller("salon-admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("SALON_ADMIN")
export class SalonAdminController {
constructor(
private readonly salonAdminService: SalonAdminService,
) {}
@Get("appointments")
async getOwnerAppointments(
  @CurrentUser() user: { sub: string },
  @Query("status")
  status?: AppointmentStatus,
  @Query("staffId")
  staffId?: string,
  @Query("serviceId")
  serviceId?: string,
  @Query("date")
  date?: string,
) {
  return this.salonAdminService.getOwnerAppointments(
    user.sub,
    {
      status,
      staffId,
      serviceId,
      date,
    },
  );
}
@Get("appointments/:id")
async getOwnerAppointment(
  @CurrentUser() user: { sub: string },
  @Param("id") appointmentId: string,
) {
  return this.salonAdminService.getOwnerAppointment(
    user.sub,
    appointmentId,
  );
}
@Patch("appointments/:id/status")
async updateOwnerAppointmentStatus(
  @CurrentUser() user: { sub: string },
  @Param("id") appointmentId: string,
  @Body() dto: UpdateAppointmentStatusDto,
) {
  return this.salonAdminService.updateOwnerAppointmentStatus(
    user.sub,
    appointmentId,
    dto.status,
  );
}
@Get("working-hours")
async getSalonWorkingHours(
  @CurrentUser() user: { sub: string },
) {
  return this.salonAdminService.getSalonWorkingHours(
    user.sub,
  );
}
@Patch("working-hours")
async updateSalonWorkingHours(
  @CurrentUser() user: { sub: string },
  @Body() dto: UpdateWorkingHoursDto,
) {
  return this.salonAdminService.updateSalonWorkingHours(
    user.sub,
    dto,
  );
}

@Post("staff/invitations")
async createStaffInvitation(
  @CurrentUser() user: { sub: string },
  @Body() dto: CreateStaffInvitationDto,
) {
  return this.salonAdminService.createStaffInvitation(
    user.sub,
    dto,
  );
}
@Get("staff")
async getStaff(
  @CurrentUser() user: { sub: string },
) {
  return this.salonAdminService.getStaff(
    user.sub,
  );
}
@Post("staff")
async createStaff(
  @CurrentUser() user: { sub: string },
  @Body() dto: CreateStaffDto,
) {
  return this.salonAdminService.createStaff(
    user.sub,
    dto,
  );
}
@Patch("staff/:id")
async updateStaff(
  @CurrentUser() user: { sub: string },
  @Param("id") staffId: string,
  @Body() dto: UpdateStaffDto,
) {
  return this.salonAdminService.updateStaff(
    user.sub,
    staffId,
    dto,
  );
}
@Delete("staff/:id")
async deactivateStaff(
  @CurrentUser() user: { sub: string },
  @Param("id") staffId: string,
) {
  return this.salonAdminService.deactivateStaff(
    user.sub,
    staffId,
  );
}
@Get("services")
async getServices(
  @CurrentUser() user: { sub: string },
) {
  return this.salonAdminService.getServices(
    user.sub,
  );
}
@Post("services")
async createService(
  @CurrentUser() user: { sub: string },
  @Body() dto: CreateServiceDto,
) {
  return this.salonAdminService.createService(
    user.sub,
    dto,
  );
}
@Patch("services/:id")
async updateService(
  @CurrentUser() user: { sub: string },
  @Param("id") id: string,
  @Body() dto: UpdateServiceDto,
) {
  return this.salonAdminService.updateService(
    user.sub,
    id,
    dto,
  );
}
@Delete("services/:id")
async deleteService(
  @CurrentUser() user: { sub: string },
  @Param("id") id: string,
) {
  return this.salonAdminService.deleteService(
    user.sub,
    id,
  );
}
@Get("dashboard")
async getDashboard(
@CurrentUser() user: { sub: string },
) {
return this.salonAdminService.getDashboard(
user.sub,
);
}
}
