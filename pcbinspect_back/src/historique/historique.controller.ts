import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { HistoriqueService } from './historique.service';
import { ResultatInspection } from '@prisma/client';
import type{ Response } from 'express';


@Controller('historique')
export class HistoriqueController {
  constructor(private readonly historiqueService: HistoriqueService ) {}
  
  @Get()
  async getHistorique(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('date') date?: string,
    @Query('sn') sn?: string,
    @Query('of') of?: string,
    @Query('statut') statut?: ResultatInspection,
  ) {
    return this.historiqueService.getHistorique({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 5,
      date,
      sn,
      of,
      statut,
    });
  }

  @Get('export')
  async exportCsv(
    @Res() res: Response,
    @Query('date') date?: string,
    @Query('sn') sn?: string,
    @Query('of') of?: string,
    @Query('statut') statut?: ResultatInspection,
  ) {
    const csv =await this.historiqueService.exportCsv({
        date,
        sn,
        of,
        statut,
      });
    res.setHeader(
      'Content-Type',
      'text/csv; charset=utf-8'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=historique.csv'
    );
    res.send(csv);
  }
  
  @Get("export-data")
  getExportData(@Query() query:any){
  return this.historiqueService.getHistoriqueExport(query);
  }

  @Get(':id')
  async getInspectionDetails(
    @Param('id') id:string
  ){
    return this.historiqueService.getInspectionDetails(id);
  }

  @Get("export/excel")
async exportExcel(
 @Query() query,
 @Res() res:Response
){

const buffer =
await this.historiqueService.exportExcel(query);


res.set({

"Content-Type":
"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

"Content-Disposition":
'attachment; filename="Historique_Inspection.xlsx"'

});


res.send(buffer);

}
}