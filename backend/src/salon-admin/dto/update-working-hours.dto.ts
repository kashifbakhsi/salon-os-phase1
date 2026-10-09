import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from "class-validator";

import { Type } from "class-transformer";

class WorkingHourDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @IsBoolean()
  open!: boolean;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    {
      message:
        "openTime must use HH:mm format.",
    },
  )
  openTime!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    {
      message:
        "closeTime must use HH:mm format.",
    },
  )
  closeTime!: string;
}

export class UpdateWorkingHoursDto {
  @IsArray()
  @ArrayMinSize(7)
  @ArrayMaxSize(7)
  @ValidateNested({
    each: true,
  })
  @Type(() => WorkingHourDto)
  hours!: WorkingHourDto[];
}