import { IsArray, IsEnum, IsOptional, IsString } from "class-validator";
import { ResultatInspection } from "@prisma/client";


export class CreateInspectionDTO {

    @IsString()
    SN!:string;


    @IsString()
    of!:string;


    @IsString()
    PRF!:string;


    @IsOptional()
    imagePathTop?:string;


    @IsOptional()
    imagePathBottom?:string;


    @IsEnum(ResultatInspection)
    resultat!:ResultatInspection;


    @IsOptional()
    tempsInspo?:number;
 
    @IsString()
    operatorId!:string;

    defauts?:{
        defautdetecte:string;
        zoneId:string;
    }[];

}