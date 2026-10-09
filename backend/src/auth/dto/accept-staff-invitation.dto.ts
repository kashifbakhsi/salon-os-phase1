import {
  IsNotEmpty,
  IsString,
  MinLength,
} from "class-validator";

export class AcceptStaffInvitationDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}