import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {  Prisma, ResultatInspection } from '@prisma/client';

import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
@Injectable()
export class HistoriqueService {

constructor(
 private prisma:PrismaService
){}


async getHistorique(query:{
 page?:number;
 limit?:number;
 date?:string;
 sn?:string;
 of?:string;
 statut?:ResultatInspection;
}){


const page=query.page || 1;
const limit=query.limit || 5;
const where:Prisma.InspectionWhereInput={};
if(query.sn){
        where.sn={
                contains:query.sn,
                mode:"insensitive"
        }
}
if(query.of){
        where.of={
            OF:{
            contains:query.of,
            mode:"insensitive"
            }
        }
}
if(query.statut){
where.resultat=query.statut;
}

if(query.date){
    const debut=new Date(query.date);
    const fin=new Date(query.date);
    fin.setDate(fin.getDate()+1);
        where.dateHeure={
        gte:debut,
        lt:fin
        }
}

const total =
await this.prisma.inspection.count({
 where
});

const inspections =
await this.prisma.inspection.findMany({
    where,
        include:{
            of:true,
            defauts:true
        },

   orderBy:{
        dateHeure:"desc"
    },
skip:(page-1)*limit,
take:limit
});

return {
    data: inspections.map((item)=>({
        id:item.id,
        dateHeure:item.dateHeure,
        sn:item.sn,
        of:item.of.OF,
        resultat:item.resultat,
        nombreDefauts:item.defauts.length,
        defauts:item.defauts.map(d=>({
        id:d.id,
        defaut:d.defautdetecte,
        jugement:d.jugement
    }))
    })),
    total,
    page,
    totalPages:Math.ceil(total/limit)
    };
    }






async getHistoriqueExport(query:{
 date?:string;
 sn?:string;
 of?:string;
 statut?:ResultatInspection;
}){

const where:Prisma.InspectionWhereInput={};
if(query.sn){
    where.sn={
        contains:query.sn,
        mode:"insensitive"
    };
}

if(query.of){
    where.of={
    OF:{
        contains:query.of,
        mode:"insensitive"
    }

};

}
if(query.statut){
    where.resultat=query.statut;
}

if(query.date){

const debut=new Date(query.date);
const fin=new Date(query.date);
fin.setDate(fin.getDate()+1);
where.dateHeure={
    gte:debut,
    lt:fin
};
}

const inspections = await this.prisma.inspection.findMany({
where,
include:{
    of:true,
    defauts:{
        include:{
            zone:true
        }
    }
},
orderBy:{
dateHeure:"desc"
}

});

return inspections.map(item=>({
    id:item.id,
    dateHeure:item.dateHeure,
    sn:item.sn,
    of:item.of.OF,
    resultat:item.resultat,
    nombreDefauts:item.defauts.length,
    defauts:item.defauts.map(d=>(
    {
        id:d.id,
        defaut:d.defautdetecte,
        zone:d.zone?.nom,
        jugement:d.jugement
    }
))
}));
}

async exportExcel(
  query: {
    date?: string;
    sn?: string;
    of?: string;
    statut?: ResultatInspection;
  },
) {
  const where: Prisma.InspectionWhereInput = {};

  if (query.sn) {
    where.sn = {
      contains: query.sn,
      mode: "insensitive",
    };
  }

  if (query.of) {
    where.of = {
      OF: {
        contains: query.of,
        mode: "insensitive",
      },
    };
  }

  if (query.statut) {
    where.resultat = query.statut;
  }

  if (query.date) {
    const debut = new Date(query.date);
    const fin = new Date(query.date);
    fin.setDate(fin.getDate() + 1);

    where.dateHeure = {
      gte: debut,
      lt: fin,
    };
  }

  const inspections = await this.prisma.inspection.findMany({
    where,
    include: {
      of: true,
      operateur: true,
      defauts: {
        include: {
          zone: true,
        },
      },
    },
    orderBy: {
      dateHeure: "desc",
    },
  });

  if (inspections.length === 0) {
    throw new NotFoundException("Aucune inspection trouvée.");
  }

  // -----------------------------
  // Création dossier exports
  // -----------------------------

  const exportFolder = path.join(process.cwd(), "exports");

  if (!fs.existsSync(exportFolder)) {
    fs.mkdirSync(exportFolder, { recursive: true });
  }

  // -----------------------------
  // Fichier par opérateur
  // -----------------------------

  const operateur = inspections[0].operateur;

  const fileName = `Historique_${operateur.firstname}_${operateur.lastname}.xlsx`;

  const filePath = path.join(exportFolder, fileName);

  const workbook = new ExcelJS.Workbook();

  if (fs.existsSync(filePath)) {
    await workbook.xlsx.readFile(filePath);
  } else {
    workbook.creator = "PCB Inspect";
    workbook.created = new Date();
  }

  // -----------------------------
  // Nouvelle feuille
  // -----------------------------

  const now = new Date();

  const sheetName =
    now
      .toLocaleDateString("fr-FR")
      .replace(/\//g, "-") +
    "_" +
    now
      .toLocaleTimeString("fr-FR")
      .replace(/:/g, "-");

  const sheet = workbook.addWorksheet(sheetName);

  // -----------------------------
  // Titre
  // -----------------------------

  sheet.mergeCells("A1:H1");

  const title = sheet.getCell("A1");

  title.value = "RAPPORT D'INSPECTION PCB";

  title.font = {
    bold: true,
    size: 18,
    color: { argb: "FFFFFF" },
  };

  title.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "009688" },
  };

  title.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  sheet.getRow(1).height = 30;

  // -----------------------------
  // Informations
  // -----------------------------

  sheet.getCell("A3").value = "Opérateur";
  sheet.getCell("B3").value =
    `${operateur.firstname} ${operateur.lastname}`;

  sheet.getCell("A4").value = "Date export";
  sheet.getCell("B4").value =
    now.toLocaleString("fr-FR");

  sheet.getCell("A5").value = "Nombre inspections";
  sheet.getCell("B5").value =
    inspections.length;

  // -----------------------------
  // Colonnes
  // -----------------------------

  sheet.columns = [
    { header: "Date", key: "date", width: 15 },
    { header: "Heure", key: "heure", width: 12 },
    { header: "SN", key: "sn", width: 22 },
    { header: "OF", key: "of", width: 15 },
    { header: "Résultat", key: "resultat", width: 15 },
    { header: "Opérateur", key: "operateur", width: 25 },
    { header: "Nb défauts", key: "nb", width: 12 },
    { header: "Détails", key: "details", width: 60 },
  ];

  sheet.getRow(7).values = [
    "Date",
    "Heure",
    "SN",
    "OF",
    "Résultat",
    "Opérateur",
    "Nb défauts",
    "Détails",
  ];

  sheet.getRow(7).eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: "FFFFFF" },
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "00695C" },
    };

    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };
  });

  // -----------------------------
  // Données
  // -----------------------------

  inspections.forEach((item) => {
    sheet.addRow({
      date: item.dateHeure.toLocaleDateString("fr-FR"),
      heure: item.dateHeure.toLocaleTimeString("fr-FR"),
      sn: item.sn,
      of: item.of.OF,
      resultat: item.resultat,
      operateur:
        `${item.operateur.firstname} ${item.operateur.lastname}`,
      nb: item.defauts.length,
      details: item.defauts
        .map(
          (d) =>
            `${d.defautdetecte}| ${d.jugement}`,
        )
        .join("\n"),
    });
  });

  // -----------------------------
  // Style
  // -----------------------------

  sheet.eachRow((row, index) => {
    if (index >= 8) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };

        cell.alignment = {
          vertical: "middle",
          wrapText: true,
        };
      });

      const resultat = row.getCell(5);

      resultat.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb:
            resultat.value === "GOOD"
              ? "C8E6C9"
              : "FFCDD2",
        },
      };
    }
  });

  // -----------------------------
  // Sauvegarde
  // -----------------------------

  await workbook.xlsx.writeFile(filePath);

  return await workbook.xlsx.writeBuffer();
}

    async getInspectionDetails(id:string){
        const inspection =await this.prisma.inspection.findUnique({
                    where:{
                    id
                    },
                    include:{
                        of:true,
                        reference:true,
                        operateur:true,
                        defauts:{
                            include:{
                            zone:true
                            }
                        }
                    }
    });
    if(!inspection){
            throw new NotFoundException("Inspection introuvable");
    }

    return {
        id:inspection.id,
        sn:inspection.sn,
        of:inspection.of.OF,
        resultat:inspection.resultat,
        dateHeure:inspection.dateHeure,
        jugementOperateurBO: inspection.reference.jugementOperateurBO,
        operateur:{
            id:inspection.operateur.id,
            firstname:inspection.operateur.firstname,
            lastname:inspection.operateur.lastname
        },
        defauts:
        inspection.defauts.map((d)=>({
            id:d.id,
            defaut:d.defautdetecte,
            zone:d.zone.nom,
            zoneId:d.zone.id,
            jugement:d.jugement
        }))
    };
    }
    async exportCsv(query:{
        date?:string;
        sn?:string;
        of?:string;
        statut?:ResultatInspection;
    }){
    const where:Prisma.InspectionWhereInput={};
    if(query.sn){
        where.sn={
            contains:query.sn,
            mode:"insensitive"
        }
    }
    if(query.of){
        where.of={
            OF:{
                contains:query.of,
                mode:"insensitive"
            }
        }
    }
    if(query.statut){
    where.resultat=query.statut;
    }
    if(query.date){
    const debut=new Date(query.date);
    const fin=new Date(query.date);
    fin.setDate(fin.getDate()+1);
    where.dateHeure={
        gte:debut,
        lt:fin
    };
    }
    const inspections =
    await this.prisma.inspection.findMany({
        where,
        include:{
            of:true,
            operateur:true,
            defauts:{
                include:{
                zone:true
                }
            }
        },
        orderBy:{
            dateHeure:"desc"
        }
    });
    let csv ="Date,Heure,SN,OF,Statut,Operateur,Nombre Défauts,Détails Défauts\n";
    for(const item of inspections){
    const date=item.dateHeure.toLocaleDateString("fr-FR");
    const heure=item.dateHeure.toLocaleTimeString("fr-FR");
    const operateur =`${item.operateur.firstname ?? ""}${item.operateur.lastname ?? ""}`;
    const defauts =item.defauts.map(d=>
                                    `${d.defautdetecte} - ${d.zone.nom} - ${d.jugement}`
                                    ).join(" | ");
    csv +=
    `"${date}","${heure}","${item.sn}","${item.of.OF}","${item.resultat}","${operateur}","${item.defauts.length}","${defauts}"\n`;
    }
    return csv;
}
}