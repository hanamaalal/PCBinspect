import { Module } from '@nestjs/common';
import { HistoriqueController } from './historique.controller';
import { HistoriqueService } from './historique.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports:[PrismaModule],
  controllers: [HistoriqueController],
  providers: [HistoriqueService,PrismaService]
})
export class HistoriqueModule {}
