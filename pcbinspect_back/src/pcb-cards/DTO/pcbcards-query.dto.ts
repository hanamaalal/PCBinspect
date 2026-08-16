import { ResultatInspection } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class PcbCardsQueryDto {

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number ;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number ;

  @IsOptional()
  @IsString()
  sn?: string;

  @IsOptional()
  @IsString()
  of?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsEnum(ResultatInspection)
  statut?: ResultatInspection;
}