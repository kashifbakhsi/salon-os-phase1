import {
  IsEnum,
  IsNotEmpty,
} from "class-validator";

import { AppointmentStatus } from "../../generated/prisma/enums";

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus)
  @IsNotEmpty()
  status!: AppointmentStatus;
}