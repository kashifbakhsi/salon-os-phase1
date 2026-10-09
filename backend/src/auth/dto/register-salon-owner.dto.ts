
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

export class RegisterSalonOwnerDto {
  // -----------------------------------------
  // OWNER INFORMATION
  // -----------------------------------------

  @IsString()
  @IsNotEmpty({
    message: "Owner name is required.",
  })
  @MinLength(2, {
    message: "Owner name must contain at least 2 characters.",
  })
  ownerName!: string;

  @IsOptional()
  @IsEmail({}, {
    message: "Please provide a valid owner email.",
  })
  ownerEmail?: string;

  @IsOptional()
  @Matches(/^[0-9]{10}$/, {
    message: "Owner phone must contain exactly 10 digits.",
  })
  ownerPhone?: string;

  @IsString()
  @MinLength(8, {
    message: "Password must contain at least 8 characters.",
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    },
  )
  password!: string;

  // -----------------------------------------
  // SALON INFORMATION
  // -----------------------------------------

  @IsString()
  @IsNotEmpty({
    message: "Salon name is required.",
  })
  @MinLength(2, {
    message: "Salon name must contain at least 2 characters.",
  })
  salonName!: string;

  @IsOptional()
  @Matches(/^[0-9]{10}$/, {
    message: "Salon phone must contain exactly 10 digits.",
  })
  salonPhone?: string;

  @IsOptional()
  @IsEmail({}, {
    message: "Please provide a valid salon email.",
  })
  salonEmail?: string;

  @IsString()
  @IsNotEmpty({
    message: "Salon address is required.",
  })
  address!: string;

  @IsString()
  @IsNotEmpty({
    message: "City is required.",
  })
  city!: string;

  @IsString()
  @IsNotEmpty({
    message: "State is required.",
  })
  state!: string;

  @IsOptional()
  @Matches(/^[0-9]{6}$/, {
    message: "PIN code must contain exactly 6 digits.",
  })
  postalCode?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
