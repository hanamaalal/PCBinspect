import { IsNotEmpty, IsString } from "class-validator";

export class LancerProductioDTO{
    @IsString()
    @IsNotEmpty()
    OF!:string;

}