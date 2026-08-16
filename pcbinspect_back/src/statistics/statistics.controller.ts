import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import { StatisticsService } from './statistics.service';

import {
  FiltresStatistiquesDTO
} from './dto/statistiques.dto';



@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}
  
  @Get()
  async getStatistiques(
    @Query() filtres: FiltresStatistiquesDTO
  ){
    return await this.statisticsService.getStatistiques(filtres);
  }
}