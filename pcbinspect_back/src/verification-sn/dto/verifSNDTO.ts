import { IsNotEmpty, IsString } from "class-validator";

export class verifierSNDTO{
    @IsString()
    @IsNotEmpty()
    sn!:string;
    @IsString()
    @IsNotEmpty()
    PRF!:string;
}