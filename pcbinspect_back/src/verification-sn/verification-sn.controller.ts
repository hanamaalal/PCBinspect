import { Role } from '@prisma/client';
import { RolesGuard } from '../roles/roles.guard';
import { AuthGuard } from '../utilisateur/auth/auth.guard';
import { VerificationSnService } from './verification-sn.service';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../roles/role.decorator';
import { verifierSNDTO } from './dto/verifSNDTO';
import { ProductionService } from '../production/production.service';

@Controller('verification_sn')
export class VerificationSnController {
    constructor(private verifiersnservice:VerificationSnService,
       private productionService:ProductionService
    ){}
     @Post('/verifSN')
        @UseGuards(AuthGuard,RolesGuard)
        @Roles(Role.OPERATEUR,Role.ADMIN,Role.INGENIEUR,Role.TECHNICIEN)
        async verifierSN(@Body()dto:verifierSNDTO){
            const config=await this.productionService.verifierPRF(dto.PRF)
            return this.verifiersnservice.verifSN(dto,config.parametres);
        }
}
