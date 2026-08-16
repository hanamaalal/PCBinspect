import {
  ConflictException,
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { ProductionService } from "../production/production.service";

import { CreateCarteModeleDTO } from "./dto/CreateCarteModeleDTO";
import { CarteModeleResponse } from "./response/CarteModeleResponse";

@Injectable()
export class CarteModeleService {
  constructor(
    private prisma: PrismaService,
    private productionService: ProductionService,
  ) {}

  // =========================================================
  // CREATE CARTE MODELE
  // =========================================================
  

  async createCarteModele(
    dto: CreateCarteModeleDTO,
    imagePath?: string,
  ): Promise<any> {
    // Vérifier si la carte existe déjà
    const existe = await this.prisma.carteModele.findUnique({
      where: {
        sn: dto.sn,
      },
    });

    if (existe) {
      throw new ConflictException(
        "carte modele existe deja",
      );
    }

    // Vérifier que le PRF existe
    const ref = await this.prisma.reference.findUnique({
      where: {
        PRF: dto.PRF,
      },
    });

    if (!ref) {
      throw new NotFoundException(
        "PRF n'existe pas",
      );
    }

    // =====================================================
    // IMPORTANT :
    // On utilise EXACTEMENT getProgramme(PRF)
    // utilisé par la page Teaching
    // =====================================================

    const programme =
      await this.productionService.getProgramme(dto.PRF);

    // getProgramme retourne :
    // {
    //   id,
    //   PRF,
    //   zones
    // }

    // Vérifier que toutes les zones appartiennent
    // au programme récupéré par getProgramme()
    for (const defaut of dto.defautAttendu) {
      const zoneExiste = programme.zones.find(
        (zone) => zone.id === defaut.zoneId,
      );

      if (!zoneExiste) {
        throw new BadRequestException(
          `La zone ${defaut.zoneId} n'appartient pas au programme ${dto.PRF}`,
        );
      }
    }

    // =====================================================
    // CREATION DE LA CARTE MODELE
    // =====================================================

    return await this.prisma.carteModele.create({
      data: {
        sn: dto.sn,
        PRF: dto.PRF,
        imagePath: imagePath ?? null,

        defautAttendu: {
          create: dto.defautAttendu.map((d) => ({
            defautAttendu: d.defautAttendu,

            zone: {
              connect: {
                id: d.zoneId,
              },
            },
          })),
        },
      },

      include: {
        defautAttendu: {
          include: {
            zone: {
              select: {
                id: true,
                nom: true,
              },
            },
          },
        },
      },
    });
  }

  // =========================================================
  // GET ALL
  // =========================================================

  async getAll(): Promise<CarteModeleResponse[]> {
    return await this.prisma.carteModele.findMany({
      select: {
        id: true,
        sn: true,
        PRF: true,

        defautAttendu: {
          select: {
            id: true,
            defautAttendu: true,

            zone: {
              select: {
                id: true,
                nom: true,
              },
            },
          },
        },
      },

      orderBy: {
        id: "desc",
      },
    });
  }

  // =========================================================
  // GET ONE
  // =========================================================

  async getOne(sn: string): Promise<any> {
    const carte =
      await this.prisma.carteModele.findUnique({
        where: {
          sn,
        },

        include: {
          defautAttendu: {
            include: {
              zone: {
                select: {
                  id: true,
                  nom: true,
                },
              },
            },
          },
        },
      });

    if (!carte) {
      throw new NotFoundException(
        "carte introuvable",
      );
    }

    return carte;
  }

  // =========================================================
  // DELETE
  // =========================================================

  async Delete(id: string) {
    const carte =
      await this.prisma.carteModele.findUnique({
        where: {
          id,
        },
      });

    if (!carte) {
      throw new NotFoundException(
        "carte introuvable",
      );
    }

    // Supprimer les défauts attendus
    await this.prisma.defautAttendu.deleteMany({
      where: {
        carteModelId: id,
      },
    });

    // Supprimer la carte modèle
    await this.prisma.carteModele.delete({
      where: {
        id,
      },
    });

    return {
      message: "Carte modèle supprimée avec succès",
    };
  }

  // =========================================================
  // UPDATE
  // =========================================================

  async update(
    id: string,
    dto: CreateCarteModeleDTO,
    imagePath?: string,
  ): Promise<any> {
    // Vérifier que la carte existe
    const carte =
      await this.prisma.carteModele.findUnique({
        where: {
          id,
        },
      });

    if (!carte) {
      throw new NotFoundException(
        "carte not found",
      );
    }

    // =====================================================
    // IMPORTANT :
    // Utiliser le PRF envoyé dans le DTO
    // et getProgramme(PRF)
    // =====================================================

    const programme =
      await this.productionService.getProgramme(dto.PRF);

    // Vérifier les zones avec les zones
    // retournées par getProgramme()
    for (const defaut of dto.defautAttendu) {
      const zoneExiste = programme.zones.find(
        (zone) => zone.id === defaut.zoneId,
      );

      if (!zoneExiste) {
        throw new BadRequestException(
          `La zone ${defaut.zoneId} n'appartient pas au programme ${dto.PRF}`,
        );
      }
    }

    // Supprimer les anciens défauts attendus
    await this.prisma.defautAttendu.deleteMany({
      where: {
        carteModelId: id,
      },
    });

    // =====================================================
    // UPDATE CARTE MODELE
    // =====================================================

    return await this.prisma.carteModele.update({
      where: {
        id,
      },

      data: {
        sn: dto.sn,

        // Mettre à jour le PRF également
        PRF: dto.PRF,

        ...(imagePath !== undefined && {
          imagePath,
        }),

        defautAttendu: {
          create: dto.defautAttendu.map((d) => ({
            defautAttendu: d.defautAttendu,

            zone: {
              connect: {
                id: d.zoneId,
              },
            },
          })),
        },
      },

      include: {
        defautAttendu: {
          include: {
            zone: {
              select: {
                id: true,
                nom: true,
              },
            },
          },
        },
      },
    });
  }
}