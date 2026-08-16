import { Module } from '@nestjs/common';
import { CarteModeleController } from './carte_modele.controller';
import { CarteModeleService } from './carte_modele.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductionModule } from '../production/production.module';
import { ProductionService } from '../production/production.service';

@Module({
  imports:[PrismaModule,ProductionModule],
  controllers: [CarteModeleController],
  providers: [CarteModeleService,PrismaService,ProductionService
    
  ]
})
export class CarteModeleModule {}
