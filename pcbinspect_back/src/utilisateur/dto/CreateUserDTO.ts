import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export enum Role{
    OPERATEUR='OPERATEUR',
    TECHNICIEN='TECHNICIEN',
    INGENIEUR='INGENIEUR',
    ADMIN='ADMIN',
}
export class CreateUserDTO{
    

    firstname?: string;
    lastname?:string;
    @IsEmail()
    @IsNotEmpty()
    email!:string;
    @MinLength(8)
    @IsNotEmpty()
    password!:string;
    @IsNotEmpty()
    confirmpassword!:string;

    @IsNotEmpty()
    role!:Role
}