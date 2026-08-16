import { Role } from '@prisma/client';
import { RolesGuard } from '../roles/roles.guard';
import { AuthGuard } from '../utilisateur/auth/auth.guard';
import { DashboardService } from './dashboard.service';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../roles/role.decorator';

@Controller('dashboard')
export class DashboardController {
    constructor(private dashboardservice:DashboardService){}

    @Get()
    @UseGuards(AuthGuard,RolesGuard)
   @Roles(
        Role.ADMIN,
        Role.INGENIEUR,
        Role.OPERATEUR,
        Role.TECHNICIEN
    )
    getDashboard(@Req() req){
        const userId=req.user.id;
        return this.dashboardservice.getDashboard(userId);
    }
}
