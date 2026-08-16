import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';

@Module({
  imports:[PrismaModule],
  controllers:[ProductionController],
  providers: [ProductionService,PrismaService]
})
export class ProductionModule {}
