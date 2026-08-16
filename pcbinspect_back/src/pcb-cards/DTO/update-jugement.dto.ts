
import { IsEnum } from "class-validator";
import { JugementOperateur } from "@prisma/client";

export class UpdateJugementDto {
  @IsEnum(JugementOperateur)
  jugement: JugementOperateur;
}
