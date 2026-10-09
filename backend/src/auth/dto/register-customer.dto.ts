
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

export class RegisterCustomerDto {
  @IsString()
  @MinLength(2, {
    message: "Name must contain at least 2 characters.",
  })
  name!: string;

  @IsOptional()
  @IsEmail({}, {
    message: "Please provide a valid email address.",
  })
  email?: string;

  @IsOptional()
  @Matches(/^[0-9]{10}$/, {
    message: "Phone must contain exactly 10 digits.",
  })
  phone?: string;

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
}
