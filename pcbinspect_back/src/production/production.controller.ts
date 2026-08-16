import { Role } from '@prisma/client';
import { ProductionService } from './production.service';
import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../utilisateur/auth/auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/role.decorator';
import { CreateProgrammeDTO } from './dto/CreateProgrammeDTO';

@Controller('production')
export class ProductionController {
    constructor(private productionService :ProductionService){}

   
    @UseGuards(AuthGuard,RolesGuard)
    @Get(':OF')
    @Roles(Role.OPERATEUR,Role.ADMIN,Role.INGENIEUR,Role.TECHNICIEN)
    extrairePRF(@Param('OF')OF:string){
        return this.productionService.extrairePRF(OF);
    }

    @Post('/programme')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.INGENIEUR,Role.TECHNICIEN)
    createProgramme(@Body() dto:CreateProgrammeDTO){
        return this.productionService.createProgramme(dto);
    }
    @Get('/programmes')
async getProgrammes() {
  return this.productionService.getProgrammes();
}

    @Get('lancer/:of')
    async lancerProduction(
        @Param('of') of:string
    ){
        return await this.productionService.lancerProduction(of);
    }

   
    @Get('/programme/:PRF')
    async getProgramme(
        @Param('PRF') PRF:string
    ){
        return this.productionService.getProgramme(PRF);
    }

    @UseGuards(AuthGuard,RolesGuard)
    @Put('/programme/:id')
    async updateProgramme(
    @Param('id') id:string,
    @Body() dto:CreateProgrammeDTO
    ){
    return this.productionService.updateProgramme(id,dto);
}

}
