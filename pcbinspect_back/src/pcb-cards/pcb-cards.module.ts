import { Module } from '@nestjs/common';
import { PcbCardsService } from './pcb-cards.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PcbCardsController } from './pcb-cards.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports:[PrismaModule],
controllers:[PcbCardsController],
  providers: [PcbCardsService,PrismaService]
})
export class PcbCardsModule {}
