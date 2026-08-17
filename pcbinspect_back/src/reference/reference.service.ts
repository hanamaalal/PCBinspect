import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateReferenceDTO } from './dto/CreateReferenceDTO';
import { ReferenceResponse } from './response/referenceResponse';

@Injectable()
export class ReferenceService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // CREATE REFERENCE
  // =========================
  async CreateRefernce(
    data: CreateReferenceDTO,
  ): Promise<ReferenceResponse> {
    // Vérifier si le PRF existe déjà
    const existe = await this.prisma.reference.findUnique({
      where: {
        PRF: data.PRF,
      },
    });

    if (existe) {
      throw new ConflictException('Référence existe déjà');
    }

    return this.prisma.reference.create({
      data: {
        PRF: data.PRF,

        verifSN: data.verifSN,
        longeurSN: data.longeurSN,
        partieFixe: data.partieFixe,
        postpartiefixe: data.postpartiefixe,

        nombreSN: data.nombreSN,

        activationInterblocage: data.activationInterblocage,
        indicePartieFixe: data.indicePartieFixe,
        statutSN: data.statutSN,
        jugementOperateurBO: data.jugementOperateurBO,
        imagepath: data.imagepath,

        ordreFabrication: {
          create: {
            OF: data.OF,
          },
        },
      },

      select: {
        id: true,
        PRF: true,

        verifSN: true,
        longeurSN: true,
        partieFixe: true,
        postpartiefixe: true,
        nombreSN: true,
        activationInterblocage: true,
        indicePartieFixe: true,
        statutSN: true,
        jugementOperateurBO: true,
        imagepath: true,

        ordreFabrication: {
          select: {
            OF: true,
          },
        },
      },
    });
  }

  // =========================
  // UPDATE REFERENCE
  // =========================
  async update(
    id: string,
    dto: CreateReferenceDTO,
  ): Promise<ReferenceResponse> {
    const ref = await this.prisma.reference.findUnique({
      where: {
        id,
      },
    });

    if (!ref) {
      throw new BadRequestException('Référence introuvable');
    }

    return this.prisma.reference.update({
      where: {
        id,
      },

      data: {
        PRF: dto.PRF,

        verifSN: dto.verifSN,
        longeurSN: dto.longeurSN,
        partieFixe: dto.partieFixe,
        postpartiefixe: dto.postpartiefixe,
        nombreSN: dto.nombreSN,
        activationInterblocage: dto.activationInterblocage,
        indicePartieFixe: dto.indicePartieFixe,
        statutSN: dto.statutSN,
        jugementOperateurBO: dto.jugementOperateurBO,
        imagepath: dto.imagepath,

        ordreFabrication: {
          update: {
            OF: dto.OF,
          },
        },
      },

      select: {
        id: true,
        PRF: true,
        verifSN: true,
        longeurSN: true,
        partieFixe: true,
        postpartiefixe: true,
        nombreSN: true,
        activationInterblocage: true,
        indicePartieFixe: true,
        statutSN: true,
        jugementOperateurBO: true,
        imagepath: true,

        ordreFabrication: {
          select: {
            OF: true,
          },
        },
      },
    });
  }

  // =========================
  // GET ALL REFERENCES
  // =========================
  async getallrefs() {
    return this.prisma.reference.findMany({
      select: {
        id: true,
        PRF: true,
        verifSN: true,
        longeurSN: true,
        partieFixe: true,
        postpartiefixe: true,
        nombreSN: true,
        activationInterblocage: true,
        indicePartieFixe: true,
        statutSN: true,
        jugementOperateurBO: true,
        imagepath: true,

        programme: {
          orderBy: {
            id: 'desc',
          },

          take: 1,

          select: {
            id: true,

            Zone: {
              select: {
                id: true,
                nom: true,
              },
            },
          },
        },

        ordreFabrication: {
          select: {
            OF: true,
          },
        },
      },
    });
  }

  // =========================
  // GET ONE REFERENCE
  // =========================
  async findOne(PRF: string) {
    const ref = await this.prisma.reference.findUnique({
      where: {
        PRF,
      },
    });

    if (!ref) {
      throw new NotFoundException('Référence introuvable');
    }

    return ref;
  }

  // =========================
  // DELETE REFERENCE
  // =========================
  async delete(id: string) {
    const ref = await this.prisma.reference.findUnique({
      where: {
        id,
      },
    });

    if (!ref) {
      throw new BadRequestException('Référence introuvable');
    }

    return this.prisma.reference.delete({
      where: {
        id,
      },

      select: {
        id: true,
        PRF: true,
      },
    });
  }
}