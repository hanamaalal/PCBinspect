import { Module } from '@nestjs/common';
import { EquipementsController } from './equipements.controller';
import { EquipementsService } from './equipements.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports:[PrismaModule],
  controllers: [EquipementsController],
  providers: [EquipementsService]
})
export class EquipementsModule {}
