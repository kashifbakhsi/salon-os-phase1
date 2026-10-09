 import {
  IsISO8601,
  IsNotEmpty,
  IsString,
} from "class-validator";

export class RescheduleAppointmentDto {
  @IsISO8601()
  @IsNotEmpty()
  startAt!: string;
}