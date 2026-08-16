import { PcbCardsQueryDto } from './DTO/pcbcards-query.dto';
import { UpdateJugementDto } from './DTO/update-jugement.dto';
import { PcbCardsService } from './pcb-cards.service';
import { Controller, Get, Param, Query,Delete, Body, Patch } from '@nestjs/common';

@Controller('pcb-cards')
export class PcbCardsController {
    constructor(private pcbCardsService:PcbCardsService){}
     @Get()
  getCards(
    @Query() query: PcbCardsQueryDto,
  ) {
    return this.pcbCardsService.getCards(query);
  }

  @Get(':id')
  getCard(
    @Param('id') id: string,
  ) {
    return this.pcbCardsService.getCard(id);
  }
  @Delete(':id')
deleteCard(
    @Param('id') id:string
){

    return this.pcbCardsService.deleteCard(id);

}
@Patch("defauts/:id/jugement") 
async updateDefautJugement(
   @Param("id") 
   id: string, @Body() dto: UpdateJugementDto,
   ) {
     return this.pcbCardsService.updateDefautJugement( id, dto.jugement, ); 
    }
}
