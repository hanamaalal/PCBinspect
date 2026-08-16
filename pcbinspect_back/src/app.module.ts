import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UtilisateurModule } from './utilisateur/utilisateur.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReferenceModule } from './reference/reference.module';
import { ProductionModule } from './production/production.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EquipementsModule } from './equipements/equipements.module';
import { HistoriqueModule } from './historique/historique.module';
import { CarteModeleModule } from './carte_modele/carte_modele.module';
import { InspectionModule } from './inspection/inspection.module';
import { VerificationSnModule } from './verification-sn/verification-sn.module';
import { PcbCardsModule } from './pcb-cards/pcb-cards.module';
import { StatisticsModule } from './statistics/statistics.module';

import { RobotGateway } from './robot/robot.gateway';

@Module({
  imports: [
    UtilisateurModule,
    PrismaModule,
    ReferenceModule,
    ProductionModule,
    DashboardModule,
    EquipementsModule,
    HistoriqueModule,
    CarteModeleModule,
    InspectionModule,
    VerificationSnModule,
    PcbCardsModule,
    StatisticsModule,

    ServeStaticModule.forRoot({
      rootPath: join(
        process.cwd(),
        '..',
        'robot_simulator',
        'captures',
      ),

      serveRoot: '/captures',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],

  controllers: [
    AppController,
  ],

  providers: [
    AppService,
    RobotGateway,
  ],
})
export class AppModule {}