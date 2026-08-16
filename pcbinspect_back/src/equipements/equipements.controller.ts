import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { EquipementsService } from './equipements.service';
import { CreateEquipementDTO } from './dto/CreateEquipementDTO';

@Controller('equipements')
export class EquipementsController {
    constructor(private equipementservice:EquipementsService){}
   @Post()
create(
    @Body() dto:CreateEquipementDTO
){
    return this.equipementservice.create(dto);
}



@Get()
findAll(){
    return this.equipementservice.findAll();
}



@Get(':id')
findOne(
    @Param('id') id:string
){

    return this.equipementservice.findOne(id);
}



@Put(':id')
update(
    @Param('id') id:string,
    @Body() dto:CreateEquipementDTO
){
    return this.equipementservice.update(id,dto);
}



@Delete(':id')
remove(
    @Param('id') id:string
){
    return this.equipementservice.delete(id);
}
}
