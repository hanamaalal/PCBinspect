import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipementDTO } from './dto/CreateEquipementDTO';

@Injectable()
export class EquipementsService {
    constructor(private prisma:PrismaService){}
    async  create(dto:CreateEquipementDTO){
        return this.prisma.equipement.create({data:{
            nom:dto.nom,
            statut:dto.statut,
            dateHeurePremierIncident:dto.statut==="NOK"&& dto.dateHeurePremierIncident
            ? new Date(dto.dateHeurePremierIncident.replace(" ","T"))
            : null
        }});

    }
    async findAll(){
        return this.prisma.equipement.findMany();
    }
    async findOne(id:string){
        return this.prisma.equipement.findUnique({
            where:{
                id
            }
        })
    }
    async update(id:string,dto:CreateEquipementDTO){
        return this.prisma.equipement.update({
            where:{
                id
            },
          data:{
            nom:dto.nom,
            statut:dto.statut,

            dateHeurePremierIncident:dto.statut==="OK"
            ?null
             :dto.dateHeurePremierIncident
                ? new Date(dto.dateHeurePremierIncident.replace(" ","T"))
                : undefined
          }
            });
    }
    async delete(id:string){
        return this.prisma.equipement.delete({
            where:{id}
        })
    }
}
