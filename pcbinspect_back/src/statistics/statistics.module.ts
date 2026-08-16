import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { StatisticsController } from './statistics.controller';

@Module({
  imports:[PrismaModule],
  controllers: [StatisticsController],
  providers: [StatisticsService,PrismaService]
})
export class StatisticsModule {}
