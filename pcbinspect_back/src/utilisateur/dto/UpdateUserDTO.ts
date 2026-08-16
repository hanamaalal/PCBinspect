import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { Role } from "@prisma/client";


export class UpdateUserDTO {


@IsOptional()
@IsString()
firstname?:string;


@IsOptional()
@IsString()
lastname?:string;



@IsOptional()
@IsEmail()
email?:string;



@IsOptional()
@IsEnum(Role)
role?:Role;


}