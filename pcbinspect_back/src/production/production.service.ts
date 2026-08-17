import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgrammeDTO } from './dto/CreateProgrammeDTO';


@Injectable()
export class ProductionService {

constructor(private prisma: PrismaService){}
async extrairePRF(ordre:string){
  const of = await this.prisma.ordreFabrication.findUnique({
    where:{
      OF:ordre
    },
    select:{
      id:true,
      OF:true,
      PRF:true,
    }
  });
  if(!of){
    throw new NotFoundException( 'Ordre de fabrication introuvable' );
  }
  return {
    ofId:of.id,
    of:of.OF,
    PRF:of.PRF
  };
}
async createProgramme(dto:CreateProgrammeDTO){
  const ref = await this.prisma.reference.findUnique({
    where:{
      PRF:dto.PRF
    }
  });
  if(!ref){
    throw new NotFoundException( 'Référence invalide');
  }
  const programme = await this.prisma.programme.create({
    data:{
      PRF:dto.PRF,
      Zone:{
        create:dto.zones.map(z=>({
          nom:z.nom
        }))
      }
    },
    include:{
      Zone:true
    }
  });
  return programme;
}
async getProgrammes() {
  return await this.prisma.programme.findMany({
    include: {
      Zone: {
        select: {
          id: true,
          nom: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });
}
async getProgramme(PRF:string){
  const programme =await this.prisma.programme.findFirst({
    where:{
      PRF:PRF
    },
    include:{
      Zone:{
        select:{
          id:true,
          nom:true
        }
      }
    },
    orderBy:{
      id:'desc'
    }
  });
  if(!programme){
    throw new NotFoundException( 'Aucun programme trouvé pour ce PRF');

  }
  return {
    id:programme.id,
    PRF:programme.PRF,
    zones:programme.Zone
  };
}

async verifierPRF(prf:string){
  const reference =  await this.prisma.reference.findUnique({
    where:{
      PRF:prf
    },
    include:{
      programme:{
        include:{
          Zone:{
            select:{
              id:true,
              nom:true
            }
          }
        },
        orderBy:{
          id:'desc'
        },
        take:1
      }
    }
  });
  if(!reference){
    throw new NotFoundException('Référence introuvable');
  }
  const programme = reference.programme[0];
  if(!programme){
    throw new NotFoundException('Aucun programme associé à cette référence');
  }
  return {
    PRF:reference.PRF,
    programme:{
      id:programme.id,
      zones:programme.Zone
    },
    parametres:{
      verifSN:reference.verifSN,
      nombreSN: reference.nombreSN,
      longeurSN:reference.longeurSN,
      partieFixe:reference.partieFixe,
      postpartiefixe:reference.postpartiefixe,
      activationInterblocage:reference.activationInterblocage,
      indicePartieFixe:reference.indicePartieFixe,
      statutSN:reference.statutSN,
      jugementOperateurBO:reference.jugementOperateurBO
    }
  };
}

async updateProgramme(id:string,dto:CreateProgrammeDTO){
  const programme=await this.prisma.programme.findUnique({
    where:{
      id
    }
  });
  if(!programme){
    throw new NotFoundException("Programme introuvable");
  }

  // supprimer les anciennes zones
  await this.prisma.programme.update({
    where:{
      id
    },
    data:{
      Zone:{
        deleteMany:{}
      }
    }
  });
  // recréer les zones
  return this.prisma.programme.update({
    where:{
      id
    },
    data:{
      Zone:{
        create:dto.zones.map(z=>({
          nom:z.nom
        }))
      }
    },
    include:{
      Zone:true
    }
  });
}

async lancerProduction(of:string){
  const production=await this.extrairePRF(of);
  const configuration = await this.verifierPRF(production.PRF);
  return {
    OF:production.of,
    ofId:production.ofId,
    PRF:configuration.PRF,
    programme:configuration.programme,
    parametres:configuration.parametres
  };
}
}