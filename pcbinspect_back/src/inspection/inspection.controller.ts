import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req,Headers, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CreateInspectionDTO } from './dto/createinspectionDTO';
import { InspectionService } from './inspection.service';
import { AuthGuard } from '../utilisateur/auth/auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from '../roles/role.decorator';

@Controller('inspection')
export class InspectionController {
        constructor(private inspectionService:InspectionService){}
    
@Post('/recevoir')
async recevoir(
    @Headers("x-robot-token") token:string,
    @Body() dto:CreateInspectionDTO
){
    console.log(dto);
    if(token !== process.env.ROBOT_TOKEN){
        throw new UnauthorizedException(
            "Robot non autorisé"
        );
    }
    return this.inspectionService.recevoirinspection(dto );
}

    @UseGuards(AuthGuard,RolesGuard)
    @Patch('defaut/:id')
    jugerdefaut(
        @Param('id') id:string,
        @Body() body:{jugement:'PASS'|'FAIL'}
    ){
        return this.inspectionService.jugerDefaut(
            id,
            body.jugement
        )
    }
    
    @Get()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.OPERATEUR, Role.ADMIN, Role.INGENIEUR, Role.TECHNICIEN)
    getInspections(){
        return this.inspectionService.getInspections();
    }

     @Get('prf/:PRF')
    getInspectionsByPRF(
        @Param('PRF')PRF:string
    ){
        return this.inspectionService.getinspectByPRF(PRF);
    }
    
    @Delete(':id')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.ADMIN)
    async delete(
        @Param('id') id:string
    ){
        return await this.inspectionService.delete(id)
    }

}
