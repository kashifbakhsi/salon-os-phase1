
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";

import { AppointmentsService } from "./appointments.service";

import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { CancelAppointmentDto } from "./dto/cancel-appointment.dto";
import { RescheduleAppointmentDto } from "./dto/reschedule-appointment.dto";
import { UpdateAppointmentStatusDto } from "./dto/update-appointment-status.dto";

@Controller("appointments")
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
  ) {}

  // =========================================================
  // CUSTOMER - CREATE APPOINTMENT
  // =========================================================
  //
  // POST /api/appointments
  //
  // customerId is NEVER accepted from the browser.
  // It comes from JWT.sub.
  //
  // =========================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CUSTOMER")
  @Post()
  async create(
    @Body() dto: CreateAppointmentDto,
    @CurrentUser()
    user: {
      sub: string;
    },
  ) {
    return this.appointmentsService.create({
      ...dto,
      customerId: user.sub,
    });
  }

  // =========================================================
  // CUSTOMER - MY APPOINTMENTS
  // =========================================================
  //
  // GET /api/appointments/my
  //
  // The customer can ONLY see their own appointments.
  //
  // =========================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CUSTOMER")
  @Get("my")
  async findMyAppointments(
    @CurrentUser()
    user: {
      sub: string;
    },
  ) {
    return this.appointmentsService.findByCustomer(
      user.sub,
    );
  }

  // =========================================================
  // STAFF APPOINTMENTS
  // =========================================================
  //
  // GET /api/appointments/staff/:staffId
  //
  // =========================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    "SALON_ADMIN",
    "STAFF",
    "SUPER_ADMIN",
  )
  @Get("staff/:staffId")
  async findByStaff(
    @Param("staffId") staffId: string,
    @Query("date") date?: string,
  ) {
    return this.appointmentsService.findByStaff(
      staffId,
      date,
    );
  }

  // =========================================================
  // SALON / ADMIN APPOINTMENTS
  // =========================================================
  //
  // GET /api/appointments/salon/:salonId
  //
  // =========================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    "SALON_ADMIN",
    "STAFF",
    "SUPER_ADMIN",
  )
  @Get("salon/:salonId")
  async findBySalon(
    @Param("salonId") salonId: string,
    @Query("date") date?: string,
    @Query("status") status?: string,
  ) {
    return this.appointmentsService.findBySalon(
      salonId,
      date,
      status,
    );
  }

  // =========================================================
  // CUSTOMER - GET APPOINTMENT DETAILS
  // =========================================================
  //
  // GET /api/appointments/:id
  //
  // CUSTOMER:
  //   Can ONLY access their own appointment.
  //
  // STAFF / ADMIN:
  //   Can access appointment details.
  //
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @CurrentUser()
    user: {
      sub: string;
      role: string;
    },
  ) {
    if (user.role === "CUSTOMER") {
      return this.appointmentsService.findOneForCustomer(
        id,
        user.sub,
      );
    }

    return this.appointmentsService.findOne(id);
  }

  // =========================================================
  // CUSTOMER - CANCEL APPOINTMENT
  // =========================================================
  //
  // PATCH /api/appointments/:id/cancel
  //
  // Customer ownership is verified using JWT.sub.
  //
  // =========================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CUSTOMER")
  @Patch(":id/cancel")
  async cancelForCustomer(
    @Param("id") id: string,
    @Body() dto: CancelAppointmentDto,
    @CurrentUser()
    user: {
      sub: string;
    },
  ) {
    return this.appointmentsService.cancelForCustomer(
      id,
      user.sub,
      dto.reason,
    );
  }

  // =========================================================
  // CUSTOMER - RESCHEDULE APPOINTMENT
  // =========================================================
  //
  // PATCH /api/appointments/:id/reschedule
  //
  // Customer ownership is verified using JWT.sub.
  //
  // =========================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CUSTOMER")
  @Patch(":id/reschedule")
  async rescheduleForCustomer(
    @Param("id") id: string,
    @Body() dto: RescheduleAppointmentDto,
    @CurrentUser()
    user: {
      sub: string;
    },
  ) {
    return this.appointmentsService.rescheduleForCustomer(
      id,
      user.sub,
      dto.startAt,
    );
  }

  // =========================================================
  // ADMIN / STAFF - UPDATE STATUS
  // =========================================================
  //
  // PATCH /api/appointments/:id/status
  //
  // =========================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    "SALON_ADMIN",
    "STAFF",
    "SUPER_ADMIN",
  )
  @Patch(":id/status")
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateStatus(
      id,
      dto.status,
    );
  }
}

