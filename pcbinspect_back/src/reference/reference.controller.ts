import { Role } from '@prisma/client';
import { RolesGuard } from '../roles/roles.guard';
import { AuthGuard } from '../utilisateur/auth/auth.guard';
import { ReferenceService } from './reference.service';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Roles } from '../roles/role.decorator';
import { CreateReferenceDTO } from './dto/CreateReferenceDTO';

@Controller('reference')
export class ReferenceController {
    constructor(private referenceService:ReferenceService){}

    @Post('/addRef')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.INGENIEUR,Role.TECHNICIEN)
    async create(
        @Body()
        createReferenceDTO:CreateReferenceDTO,
    ){
        return await this.referenceService.CreateRefernce(createReferenceDTO);
    }

    @Put(':id')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.INGENIEUR,Role.TECHNICIEN)
    async update(
        @Param('id') id:string,
        @Body()
        createReferenceDTO:CreateReferenceDTO,
    ){
        return await this.referenceService.update(id,createReferenceDTO);
    }

    @Delete(':id')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.INGENIEUR,Role.TECHNICIEN)
    async delete(
        @Param('id') id:string
    ){
        return await this.referenceService.delete(id)
    }

    @Get('/getall')
    async getallREF()
    {
        return await this.referenceService.getallrefs()
    }
    
    @Get(':PRF')
    async getREF(
        @Param('PRF')PRF:string
    ){
        return await this.referenceService.findOne(PRF)
    }
    

}
