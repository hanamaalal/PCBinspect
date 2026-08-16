import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";


export class LoginDTO{
    

   
    @IsEmail()
    @IsNotEmpty()
    email!:string;
    @MinLength(8)
    @IsNotEmpty()
    password!:string;
   
}