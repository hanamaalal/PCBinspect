import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

import {
  Prisma,
  ResultatInspection,
  JugementOperateur,
} from "@prisma/client";

@Injectable()
export class PcbCardsService {

  constructor(
    private prisma: PrismaService
  ) {}

  async getCards(query: {
    page?: number;
    limit?: number;
    sn?: string;
    of?: string;
    date?: string;
    statut?: ResultatInspection;
  }) {

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 8);

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

    const total = await this.prisma.inspection.count({
      where,
    });

    const inspections =
      await this.prisma.inspection.findMany({

        where,

        include: {
          of: true,
          reference: true,
          operateur: true,
        },

        orderBy: {
          dateHeure: "desc",
        },

        skip: (page - 1) * limit,

        take: limit,
      });

    return {
      data: inspections.map((item) => ({
        id: item.id,
        sn: item.sn,
        of: item.of?.OF ?? "",
        prf: item.reference?.PRF ?? "",
        resultat: item.resultat,
        imageTop: item.imagePathTop ?? null,
        imageBottom: item.imagePathBottom ?? null,
        dateHeure: item.dateHeure,

        operateur: item.operateur
          ? `${item.operateur.firstname ?? ""} ${
              item.operateur.lastname ?? ""
            }`
          : "",
      })),

      total,

      page,

      totalPages: Math.ceil(
        total / limit
      ),
    };
  }

  async deleteCard(id: string) {

    return this.prisma.inspection.delete({
      where: {
        id,
      },
    });
  }

  async getCard(id: string) {

    return this.prisma.inspection.findUnique({

      where: {
        id,
      },

      include: {
        of: true,

        reference: true,

        operateur: true,

        defauts: {
          include: {
            zone: true,
          },
        },
      },
    });
  }

  /*
   * ======================================================
   * MODIFIER LE JUGEMENT D'UN DEFAUT
   * ======================================================
   *
   * CONFIRMER -> FAIL
   * REJETER   -> PASS
   *
   * EN_ATTENTE est la valeur par défaut.
   */

  async updateDefautJugement(
    defautId: string,
    jugement: JugementOperateur
  ) {

    const defaut =
      await this.prisma.defautDetecte.findUnique({
        where: {
          id: defautId,
        },
      });

    if (!defaut) {
      throw new NotFoundException(
        "Défaut introuvable"
      );
    }

    return this.prisma.defautDetecte.update({

      where: {
        id: defautId,
      },

      data: {
        jugement,
      },

      include: {
        zone: true,
      },
    });
  }
}
