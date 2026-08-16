import { Module } from '@nestjs/common';
import { InspectionService } from './inspection.service';
import { InspectionController } from './inspection.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { ProductionService } from '../production/production.service';
import { VerificationSnService } from '../verification-sn/verification-sn.service';

@Module({
  imports:[PrismaModule],
  providers: [InspectionService,PrismaService,ProductionService,VerificationSnService],
  controllers: [InspectionController],
  exports:[InspectionService]
})
export class InspectionModule {}
