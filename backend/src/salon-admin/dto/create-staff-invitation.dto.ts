import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
} from "class-validator";

export class CreateStaffInvitationDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber("IN")
  phone?: string;
}