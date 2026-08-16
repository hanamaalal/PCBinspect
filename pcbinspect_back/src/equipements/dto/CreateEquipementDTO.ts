import { StatutEquipement } from "@prisma/client";
import { IsEnum } from "class-validator";

export class CreateEquipementDTO{
    nom!:string;
    @IsEnum(StatutEquipement)
    statut!:StatutEquipement;
    dateHeurePremierIncident?:string;
}