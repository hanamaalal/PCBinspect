import { ProductionService } from './../production/production.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationSnService } from '../verification-sn/verification-sn.service';
import { CreateInspectionDTO } from './dto/createinspectionDTO';

@Injectable ()
export class InspectionService {
    constructor(private prisma:PrismaService,
        private verifsn:VerificationSnService,
        private productionservice:ProductionService
    ){}
 async recevoirinspection(dto:CreateInspectionDTO){
    const production= await this.productionservice.extrairePRF(dto.of);
    if(!production){
        throw new NotFoundException("OF introuvable")
    }
    const config=await this.productionservice.verifierPRF(production.PRF);
    if(!config){
        throw new NotFoundException("Configuration PRF inexistante")
    }
    const jugementBO=config.parametres.jugementOperateurBO;
    const verification=this.verifsn.verifSN({
        sn:dto.SN,
        PRF:production.PRF,
    },
      config.parametres
    );
    if(!verification.valide){
        throw new BadRequestException(verification.erreur) 
    }
    
   
   
   return this.prisma.inspection.create({
    data: {

        // relation OF
        of: {
            connect: {
                id: production.ofId
            }
        },

        // relation Reference via PRF
        reference: {
            connect: {
                PRF: production.PRF
            }
        },

        sn: dto.SN,

        operateur: {
            connect: {
                id: dto.operatorId
            }
        },

        imagePathBottom: dto.imagePathBottom,

        imagePathTop: dto.imagePathTop,

        resultat: dto.resultat,

        tempsInspo: dto.tempsInspo,

        defauts: {
            create: dto.defauts?.map(defaut => ({
                defautdetecte: defaut.defautdetecte,
                zoneId: defaut.zoneId
            })) ?? []
        }
    },

    include: {
        operateur: {
            select:{
                id:true,
                firstname:true,
                lastname:true,
                role:true
            }
        },

        reference:{
            select:{
                jugementOperateurBO:true
            }
        },

        defauts:{
            include:{
                zone:{
                    select:{
                        id:true,
                        nom:true
                    }
                }
            }
        }
    }
});
}

async getDernieresInspections(PRF:string){

 return this.prisma.inspection.findMany({

  where:{
    PRF:PRF
  },

  include:{

    operateur:{
      select:{
        id:true,
        firstname:true,
        lastname:true
      }
    },

    defauts:{
      include:{
        zone:{
          select:{
            id:true,
            nom:true
          }
        }
      }
    }

  },

  orderBy:{
    dateHeure:"desc"
  },

  take:20

 });

}
 async delete(id:string){
    const inspect=await this.prisma.inspection.findUnique({
        where:{id},
    });
    if(!inspect){
        throw new BadRequestException('inspection not found')
    }
    return this.prisma.inspection.delete({
        where:{id},
        select:{
            id:true,
            sn:true,
        }
    })
 }
 async getinspectByPRF(PRF:string){
    return this.prisma.inspection.findMany({
        where:{PRF:PRF},
        include:{
            operateur:{
                select:{
                    id:true,
                    firstname:true,
                    lastname:true,
                    role:true
                }
            },
            defauts:{
                include:{
                    zone:{
                        select:{
                            id:true,
                            nom:true,

                        }
                    }
                }
            }
        },
        orderBy:{
            dateHeure:'desc'
        }
    })
     
    

 }
 async getInspections(){
    return this.prisma.inspection.findMany({
        include:{
            operateur:{
                select:{
                    id:true,
                    firstname:true,
                    lastname:true,
                    role:true
                }
            },
            defauts:{
                include:{
                    zone:{
                        select:{
                            id:true,
                            nom:true
                        }
                    }
                }
            }
        },
        orderBy:{
            dateHeure:'desc'
        }
    });
}
async jugerDefaut(defautId:string,jugement:'PASS'|'FAIL'){
    const defaut=await this.prisma.defautDetecte.findUnique({
        where:{id:defautId},
        include:{
            inspection:{
                include:{
                reference:{
                    select:{
                        jugementOperateurBO:true
                    }
                }
            }}
        }
    });
    if(!defaut){
        throw new NotFoundException('defaut introuvable');
    }
    if(defaut.inspection.reference.jugementOperateurBO===false){
        throw new BadRequestException("jugement pas autorise")
    }
    return this.prisma.defautDetecte.update({
        where:{
            id:defautId
        },
        data:{
            jugement:jugement
        }
    })
}



}
