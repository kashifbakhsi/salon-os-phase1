import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from "@nestjs/common";

import { AuthService } from "./auth.service";

import { RegisterCustomerDto } from "./dto/register-customer.dto";
import { RegisterSalonOwnerDto } from "./dto/register-salon-owner.dto";
import { LoginDto } from "./dto/login.dto";

import { JwtAuthGuard } from "./guards/jwt-auth.guard";

import { CurrentUser } from "./decorators/current-user.decorator";
import {
  AcceptStaffInvitationDto,
} from "./dto/accept-staff-invitation.dto";


@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}
@Post("staff/accept-invitation")
async acceptStaffInvitation(
  @Body()
  dto: AcceptStaffInvitationDto,
) {
  return this.authService.acceptStaffInvitation(
    dto,
  );
}
  // =========================================================
  // CUSTOMER REGISTRATION
  // =========================================================

  @Post("register/customer")
  async registerCustomer(
    @Body()
    dto: RegisterCustomerDto,
  ) {
    return this.authService.registerCustomer(
      dto,
    );
  }

  // =========================================================
  // SALON OWNER REGISTRATION
  // =========================================================

  @Post("register/salon-owner")
  async registerSalonOwner(
    @Body()
    dto: RegisterSalonOwnerDto,
  ) {
    return this.authService.registerSalonOwner(
      dto,
    );
  }

  // =========================================================
  // LOGIN
  // =========================================================

  @Post("login")
  async login(
    @Body() dto: LoginDto,
  ) {
    return this.authService.login(
      dto.identifier,
      dto.password,
    );
  }

  // =========================================================
  // CURRENT USER
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(
    @CurrentUser()
    user: {
      sub: string;
      role: string;
    },
  ) {
    return this.authService.getMe(
      user.sub,
    );
  }
}