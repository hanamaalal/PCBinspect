import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDTO } from './dto/CreateUserDTO';
import { RegisterResponse } from './response/RegisterResponse';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDTO } from './dto/LoginDTO';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { updateResponse } from './response/updateResponse';
import { UpdateUserDTO } from './dto/UpdateUserDTO';

@Injectable()
export class UtilisateurService {
    constructor(private prisma:PrismaService,
               private jwtService:JwtService,
    ){}
    async register(playload:CreateUserDTO):Promise<RegisterResponse>{
        if(playload.password!==playload.confirmpassword){
            throw new BadRequestException('le mot de passe et sa confirmatio ne correspond pas');
        }
        const existant=await this.prisma.utilisateur.findUnique({
            where:{email:playload.email},
        });
        if(existant){
            throw new ConflictException('ce email est deja utilise');
        }
     const passwordhash=await this.encryptePassword(playload.password,10);
     playload.password=passwordhash;
     return await this.prisma.utilisateur.create({
        data:{
            firstname:playload.firstname,
            lastname:playload.lastname,
            email:playload.email,
            password:playload.password,
            role:playload.role,
        },
        select:{
            email:true,
            id:true,
        },//typee script need to know the type of retour(registerresponse)
     });
    }
   async login(loginDto:LoginDTO):Promise<{
    accessToken:string;
    user:{
        id:string;
        email:string;
        role:Role;
        firstname?:string|null;
        lastname?:string|null;
    }
}>{
        const user=await this.prisma.utilisateur.findFirst({
            where:{
                email:loginDto.email,
            }

        });
            console.log("USER TROUVE :", user);

        if(!user){
            throw new UnauthorizedException('');
        }
        const isMatched=await this.decryptePassword(
            loginDto.password,
            user.password,
        );
            console.log("PASSWORD MATCH :", isMatched);

        if(!isMatched){
            throw new UnauthorizedException('invalid password')
        }
        const accessToken=await this.jwtService.signAsync({
            email:user.email,
            id:user.id,
            role:user.role,

        },
        {expiresIn:'1d'},
     );
     return { accessToken,
                user:{
                    id:user.id,
                    email:user.email,
                    role:user.role,
                    firstname:user.firstname,
                    lastname:user.lastname,
                   
 }};
    }
    private async encryptePassword(
        plainText,
        saltRounds
    ):Promise<string>{
    return  await bcrypt.hash(plainText, saltRounds);
    }
    private async decryptePassword(
        plainText,
        hash
    ){
        return await bcrypt.compare(plainText,hash);
    }
    async update(id:string,data:UpdateUserDTO):Promise<updateResponse>{
        const user=await this.prisma.utilisateur.findUnique({
            where:{id},
        });
        if(!user){
            throw new BadRequestException('User not found');
        }
        return this.prisma.utilisateur.update({
            where:{id},
            data:{
                firstname:data.firstname,
                lastname:data.lastname,
                email:data.email,
                role:data.role,
               

            },
            select:{
                id:true,
                email:true,
                role:true,
            },
        });

    }
    async getMe(id:string){

    const user = await this.prisma.utilisateur.findUnique({

        where:{
            id:id
        },

        select:{
            firstname:true,
            lastname:true,
            role:true,
            email:true
        }

    });


    if(!user){

        throw new BadRequestException(
            "Utilisateur introuvable"
        );

    }


    return user;

}
    async getallusers(){
        return this.prisma.utilisateur.findMany({
            select:{
                id:true,
                 firstname:true,
                lastname:true,
                email:true,
                role:true,
            },
        });
    }
    async delete(id:string){
    const user=await this.prisma.utilisateur.findUnique({
        where:{id},
    });
    if(!user){
        throw new BadRequestException('user not found');
    }
    return this.prisma.utilisateur.delete({
        where:{id},
        select:{
            id:true,
            email:true,
            role:true,
        }
    })

    
    }
}
