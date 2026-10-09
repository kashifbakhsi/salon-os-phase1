import {
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateAppointmentDto {
  @IsUUID()
  @IsNotEmpty()
  salonId!: string;

  @IsUUID()
  @IsNotEmpty()
  staffId!: string;

  @IsUUID()
  @IsNotEmpty()
  serviceId!: string;

  @IsISO8601()
  @IsNotEmpty()
  startAt!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}