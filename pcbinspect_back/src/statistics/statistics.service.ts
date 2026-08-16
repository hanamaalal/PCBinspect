import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChampFiltre, FiltresStatistiquesDTO } from './dto/statistiques.dto';

@Injectable()
export class StatisticsService {

  constructor(private prisma: PrismaService) {}
  async getStatistiques(filtres: FiltresStatistiquesDTO) {
    console.log("Filtres reçus :", filtres);
    console.log("Champ :", filtres.champ);
    console.log("Valeur SN :", filtres.valeur);
    const where:any = {};
    if(filtres.champ){
      switch(filtres.champ){
       case ChampFiltre.OF:
        if(filtres.valeur){
        where.of = {
            OF:{
            contains:filtres.valeur,
            mode:"insensitive"
            }
        };
        }
        break;

       case ChampFiltre.PRF:
        if(filtres.valeur){
        where.PRF = {
            contains:filtres.valeur,
            mode:"insensitive"
        };
        }
        break;

        case ChampFiltre.SN:
          where.sn = {
            contains:filtres.valeur,
            mode:'insensitive'
          };
        break;

       case ChampFiltre.DATE:
        if(filtres.date){
        const debut = new Date(filtres.date);
        debut.setHours(0,0,0,0);
        const fin = new Date(filtres.date);
        fin.setHours(23,59,59,999);
        where.dateHeure = {
            gte: debut,
            lte: fin
        };
        }
        break;

        case ChampFiltre.PROGRAMME:
          where.reference = {
            programme:{
              some:{
                id:filtres.valeur
              }
            }
          };
        break;

      }
    }

    const inspections = await this.prisma.inspection.findMany({
      where,
      include:{
        defauts:{
          include:{
            zone:{
              select:{
                nom:true
              }
            }
          }
        },
        of:{
          select:{
            OF:true,
            PRF:true
          }
        }
      },
      orderBy:{
        dateHeure:'desc'
      }
    });
    const total = inspections.length;
    if(total===0){
      return this.retournerVide();
    }

    // Groupement par SN
const inspectionsParSN: Record<string, typeof inspections> = {};
for (const inspection of inspections) {
  if (!inspectionsParSN[inspection.sn]) {
    inspectionsParSN[inspection.sn] = [];
  }
  inspectionsParSN[inspection.sn].push(inspection);
}

// Première inspection de chaque SN
const premieresInspections = Object.values(inspectionsParSN).map(list =>
  [...list].sort(
    (a,b)=>
      new Date(a.dateHeure).getTime()
      -
      new Date(b.dateHeure).getTime()
  )[0]
);

// Nombre total de SN uniques
const nombreSN =premieresInspections.length;
// SN GOOD dès le premier passage
const snPremierPassageGood =premieresInspections.filter(
  i => i.resultat === "GOOD"
 ).length;

const firstPassYield =Number(((snPremierPassageGood / nombreSN) * 100).toFixed(1));
// Nombre d'inspections GOOD finales
const piecesConformes =inspections.filter(
  i => i.resultat === "GOOD"
).length;


// Nombre d'inspections NOT GOOD
const piecesNonConformes =inspections.filter(
  i => i.resultat === "NOT_GOOD"
).length;


// Taux conformité finale
const tauxConformite =Number(((piecesConformes / total) * 100).toFixed(1));
// Taux défauts
const tauxDefauts =Number(((piecesNonConformes / total) * 100).toFixed(1));
const inspectionsAvecTemps = inspections.filter(i =>
          i.tempsInspo !== null
      );
const tempsMoyenInspection = inspectionsAvecTemps.length > 0
      ?
      Number(
        (
          inspectionsAvecTemps.reduce(
            (somme,i)=>somme + (i.tempsInspo ?? 0),
            0
          )/inspectionsAvecTemps.length
        ).toFixed(1)
      ):0;
  //pareto
const compteurDefauts:Record<string,number> = {};
    for(const inspection of inspections){
      for(const defaut of inspection.defauts){
        const nom = `${defaut.defautdetecte}`;
        compteurDefauts[nom] = (compteurDefauts[nom] ?? 0) + 1;
      }
    }
const pareto = Object.entries(compteurDefauts).map(([nom,count])=>({
        nom,
        count
      }))
      .sort(
        (a,b)=>b.count - a.count
      );
const nombreTotalDefauts = pareto.reduce(
        (total,item)=>total + item.count,0
      );
 return {
      firstPassYield,
      tempsMoyenInspection,
      tauxConformite,
      tauxDefauts,
      nombreTotalInspections:
        total,
      nombreTotalDefauts,
      pareto,

    };
  }
  private retournerVide(){
    return {
      firstPassYield:0,
      tempsMoyenInspection:0,
      tauxConformite:0,
      tauxDefauts:0,
      nombreTotalInspections:0,
      nombreTotalDefauts:0,
      pareto:[],
    };
  }
}
