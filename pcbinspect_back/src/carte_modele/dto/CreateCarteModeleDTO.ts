import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from "class-validator";

export class DefautAttenduDTO {
  @IsString()
  @IsNotEmpty()
  defautAttendu!: string;

  @IsString()
  @IsNotEmpty()
  zoneId!: string;
}

export class CreateCarteModeleDTO {
  @IsString()
  @IsNotEmpty()
  sn!: string;

  @IsString()
  @IsNotEmpty()
  PRF!: string;

  @Transform(({ value }) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }

    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DefautAttenduDTO)
  defautAttendu!: DefautAttenduDTO[];
}