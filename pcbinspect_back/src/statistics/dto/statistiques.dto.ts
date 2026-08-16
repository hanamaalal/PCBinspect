import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';

export enum ChampFiltre {
  OF = 'OF',
  PRF = 'PRF',
  DATE = 'DATE',
  SN = "SN",
  PROGRAMME = 'PROGRAMME',
}

export class FiltresStatistiquesDTO {
  @IsOptional()
  @IsEnum(ChampFiltre)
  champ?: ChampFiltre;

  @IsOptional()
  @IsString()
  valeur?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

 
}