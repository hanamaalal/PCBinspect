
import { Module } from '@nestjs/common';
import { VerificationSnController } from './verification-sn.controller';
import { VerificationSnService } from './verification-sn.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { ProductionService } from '../production/production.service';

@Module({
  imports:[PrismaModule],
  controllers: [VerificationSnController],
  providers: [VerificationSnService,PrismaService,ProductionService]
})
export class VerificationSnModule {}
