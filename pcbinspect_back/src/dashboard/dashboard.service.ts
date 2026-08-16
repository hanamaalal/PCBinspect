import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { inspect } from 'util';

@Injectable()
export class DashboardService {

    constructor(private prisma: PrismaService) {}
    private getPoste(date: Date): string {
        const heure = date.getHours();
        if (heure >= 6 && heure < 14) {
            return 'Matin';
        }
        if (heure >= 14 && heure < 22) {
            return 'Apres-midi';
        }

        return 'Nuit';
    }
    async getDashboard(userId:string) {
        const totalPRF = await this.prisma.reference.count();
        const totalOF = await this.prisma.ordreFabrication.count();
        // Toutes les inspections
        const allInspections = await this.prisma.inspection.findMany({
            orderBy:{
                dateHeure:'desc'
            },
            include:{

                of:{
                    include:{
                        reference:true
                    }
                },
                defauts:true
            }
        });
        // Garder uniquement la dernière inspection de chaque SN
        const latestInspections:any[] = [];
        const snDejaVu = new Set<string>();
        for(const inspection of allInspections){
            if(!snDejaVu.has(inspection.sn)){
                snDejaVu.add(inspection.sn);
                latestInspections.push(inspection);
            }
        }
        // Nombre réel de cartes
        const totalPieces = latestInspections.length;

        // Les 5 derniers SN uniques

        const lastInspections = latestInspections
            .slice(0,5)
            .map(inspection=>({
                id:inspection.id,
                sn:inspection.sn,
                resultat:inspection.resultat
            }));

        // Etat des équipements
        const equipements =
            await this.prisma.equipement.findMany({
                select:{
                    id:true,
                    nom:true,
                    statut:true,
                    dateHeurePremierIncident:true
                }
            });
        const unitsStatus = equipements.map(e=>({
            id:e.id,
            name:e.nom,
            status:e.statut,
            lastUpdate:e.dateHeurePremierIncident

        }));

        const user =
            await this.prisma.utilisateur.findUnique({
                where:{
                    id:userId
                },
                select:{
                    firstname:true,
                    lastname:true,
                    role:true
                }
            });

        // Seulement les inspections de l'opérateur connecté
        const operatorInspections =
            latestInspections.filter(
                inspection =>
                    inspection.operateurId === userId
            );
            const aujourdHui=new Date();
            const debutJour=new Date(
                aujourdHui.getFullYear(),
                aujourdHui.getMonth(),
                aujourdHui.getDate(),
                0,0,0
            );
            const finJour=new Date(
                aujourdHui.getFullYear(),
                aujourdHui.getMonth(),
                aujourdHui.getDate(),
                23,59,59
            );
            const inspectionsDuJour=operatorInspections.filter(
                inspection =>
                    inspection.dateHeure>=debutJour && inspection.dateHeure<=finJour
            );
        const historique = inspectionsDuJour.reduce<Record<string,any>>(
        (acc,inspection)=>{
            const poste =
                this.getPoste(
                    inspection.dateHeure
                );
            const prf =
                inspection.of.reference.PRF;
            if(!acc[poste]){
                acc[poste]={};
            }
            if(!acc[poste][prf]){
                acc[poste][prf]={
                    poste,
                    prf,
                    inspections:[]
                };
            }
            acc[poste][prf].inspections.push({
                sn:inspection.sn,
                resultat:inspection.resultat,
                nombreDefauts:inspection.defauts.length,
                dateHeure:inspection.dateHeure
            });
            return acc;
        },{});

        
        let shiftHistory:any[] = Object.values(historique)
            .flatMap((poste:any)=>
                Object.values(poste)
            )
            .flatMap((data:any)=>
                data.inspections.map((inspection:any)=>({
                    id:inspection.sn,
                    shift:data.poste,
                    prf:data.prf,
                    sn:inspection.sn,
                    resultat:inspection.resultat,
                    nombreDefauts:inspection.nombreDefauts,
                    // taux défaut de cette SN uniquement
                    defectRate:Number(
                        ((inspection.nombreDefauts /50)*100).toFixed(2)
                    ),
                    dateHeure:
                        inspection.dateHeure
                }))
            );

        // Trier par date décroissante
        shiftHistory.sort(
            (a,b)=>
            new Date(b.dateHeure).getTime()
            -
            new Date(a.dateHeure).getTime()
        );
        // Garder 2 dernières par poste
        shiftHistory = [
            ...shiftHistory
                .filter(i=>i.shift==="Matin")
                .slice(0,1),
            ...shiftHistory
                .filter(i=>i.shift==="Apres-midi")
                .slice(0,1),
            ...shiftHistory
                .filter(i=>i.shift==="Nuit")
                .slice(0,1)
        ];
        return {
            user,
            totalPRF,
            totalOF,
            totalPieces,
            lastInspections,
            unitsStatus,
            shiftHistory
        };
    }
}