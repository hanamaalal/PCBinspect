import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";

import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { randomUUID } from "crypto";

import { CarteModeleService } from "./carte_modele.service";
import { CreateCarteModeleDTO } from "./dto/CreateCarteModeleDTO";

import { AuthGuard } from "../utilisateur/auth/auth.guard";
import { RolesGuard } from "../roles/roles.guard";

import { Role } from "@prisma/client";
import { Roles } from "../roles/role.decorator";

@Controller("carte-modele")
export class CarteModeleController {
  constructor(
    private readonly carteModeleService: CarteModeleService,
  ) {}

  // =========================================================
  // CREATE CARTE MODELE
  // =========================================================

  @Post("/addcarte")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INGENIEUR)
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./uploads/carte-modeles",

        filename: (req, file, callback) => {
          const extension = extname(file.originalname).toLowerCase();

          const filename = `${randomUUID()}${extension}`;

          callback(null, filename);
        },
      }),

      fileFilter: (req, file, callback) => {
        const extension = extname(
          file.originalname,
        ).toLowerCase();

        const extensionsAutorisees = [
          ".jpg",
          ".jpeg",
          ".png",
          ".webp",
        ];

        if (
          !extensionsAutorisees.includes(
            extension,
          )
        ) {
          return callback(
            new BadRequestException(
              "Format image accepté : JPG, JPEG, PNG ou WEBP.",
            ),
            false,
          );
        }

        callback(null, true);
      },

      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async create(
    @Body() createCarteModeleDTO: CreateCarteModeleDTO,

    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
          }),
        ],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ) {
    const imagePath = image
      ? `/uploads/carte-modeles/${image.filename}`
      : undefined;

    return await this.carteModeleService.createCarteModele(
      createCarteModeleDTO,
      imagePath,
    );
  }

  // =========================================================
  // GET ALL CARTES MODELES
  // =========================================================

  @Get("/getall")
  async getAll() {
    return await this.carteModeleService.getAll();
  }

  // =========================================================
  // GET UNE CARTE MODELE
  // =========================================================

  @Get(":sn")
  async getOne(
    @Param("sn") sn: string,
  ) {
    return await this.carteModeleService.getOne(sn);
  }

  // =========================================================
  // UPDATE CARTE MODELE
  // =========================================================

  @Put(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INGENIEUR)
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./uploads/carte-modeles",

        filename: (req, file, callback) => {
          const extension = extname(
            file.originalname,
          ).toLowerCase();

          const filename = `${randomUUID()}${extension}`;

          callback(null, filename);
        },
      }),

      fileFilter: (req, file, callback) => {
        const extension = extname(
          file.originalname,
        ).toLowerCase();

        const extensionsAutorisees = [
          ".jpg",
          ".jpeg",
          ".png",
          ".webp",
        ];

        if (
          !extensionsAutorisees.includes(
            extension,
          )
        ) {
          return callback(
            new BadRequestException(
              "Format image accepté : JPG, JPEG, PNG ou WEBP.",
            ),
            false,
          );
        }

        callback(null, true);
      },

      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async update(
    @Param("id") id: string,

    @Body() createCarteModeleDTO: CreateCarteModeleDTO,

    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
          }),
        ],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ) {
    const imagePath = image
      ? `/uploads/carte-modeles/${image.filename}`
      : undefined;

    return await this.carteModeleService.update(
      id,
      createCarteModeleDTO,
      imagePath,
    );
  }

  // =========================================================
  // DELETE CARTE MODELE
  // =========================================================

  @Delete(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INGENIEUR)
  async delete(
    @Param("id") id: string,
  ) {
    return await this.carteModeleService.Delete(id);
  }
}