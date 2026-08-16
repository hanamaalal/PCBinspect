import { UtilisateurService } from './utilisateur.service';
import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CreateUserDTO } from './dto/CreateUserDTO';
import { LoginDTO } from './dto/LoginDTO';
import { Roles } from '../roles/role.decorator';
import { Role } from '@prisma/client';
import { AuthGuard } from './auth/auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { get } from 'http';
import { UpdateUserDTO } from './dto/UpdateUserDTO';

@Controller('utilisateur')
export class UtilisateurController {
    constructor(private utilisateurservise:UtilisateurService){ }
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.ADMIN)
    @Post('/register')
    async create(
        @Body()
        createUserDTO:CreateUserDTO,

    ){
      return  await this.utilisateurservise.register(createUserDTO);
    }

    @Post('/login')
    async login(
        @Body()
        loginDTO:LoginDTO,
    ){
        return  await this.utilisateurservise.login(loginDTO);
    }



    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.ADMIN)
    @Put(':id')
    async update(
    @Param('id') id:string,
    @Body()
    updateUserDTO:UpdateUserDTO,
    ){

    return this.utilisateurservise.update(id, updateUserDTO);

    }

    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.ADMIN)
    @Get()
    getallusers(){
        return   this.utilisateurservise.getallusers();
    }

    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    async delete(
        @Param('id') id:string,
        ){
            return await this.utilisateurservise.delete(id)
        }

@UseGuards(AuthGuard)
@Get('/me')
async getMe(@Req() req){

    return this.utilisateurservise.getMe(req.user.id);

}


}
