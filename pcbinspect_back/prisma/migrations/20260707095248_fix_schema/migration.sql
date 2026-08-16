-- CreateEnum
CREATE TYPE "JugementOperateur" AS ENUM ('CONFIRME', 'REJETE');

-- CreateEnum
CREATE TYPE "StatutEquipement" AS ENUM ('OK', 'NOK');

-- CreateEnum
CREATE TYPE "ResultatInspection" AS ENUM ('GOOD', 'NOT_GOOD', 'EN_COURS');

-- AlterTable
ALTER TABLE "system_config" ALTER COLUMN "longeurSN" DROP NOT NULL,
ALTER COLUMN "jugementOperateur" SET DEFAULT false;

-- AlterTable
ALTER TABLE "utilisateurs" ALTER COLUMN "updateAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Ordre_Fabrication" (
    "id" TEXT NOT NULL,
    "OF" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "PRF" TEXT NOT NULL,

    CONSTRAINT "Ordre_Fabrication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programmes" (
    "id" TEXT NOT NULL,
    "PRF" TEXT NOT NULL,

    CONSTRAINT "programmes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zone_inspection" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,

    CONSTRAINT "Zone_inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspections" (
    "id" TEXT NOT NULL,
    "sn" TEXT NOT NULL,
    "dateHeure" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imagePathTop" TEXT,
    "imagePathBottom" TEXT,
    "resultat" "ResultatInspection" NOT NULL,
    "ofId" TEXT NOT NULL,
    "tempsInspo" DOUBLE PRECISION,
    "operateurId" TEXT NOT NULL,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defauts_detectes" (
    "id" TEXT NOT NULL,
    "jugement" "JugementOperateur" NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "defauts_detectes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carte_modele" (
    "id" TEXT NOT NULL,
    "sn" TEXT NOT NULL,
    "PRF" TEXT NOT NULL,

    CONSTRAINT "carte_modele_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defaut_attendu" (
    "id" TEXT NOT NULL,
    "carteModelId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "defaut_attendu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipement" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "statut" "StatutEquipement" NOT NULL,
    "dateHeurePremierIncident" TIMESTAMP(3),

    CONSTRAINT "equipement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ordre_Fabrication_OF_key" ON "Ordre_Fabrication"("OF");

-- CreateIndex
CREATE UNIQUE INDEX "carte_modele_sn_key" ON "carte_modele"("sn");

-- CreateIndex
CREATE UNIQUE INDEX "equipement_nom_key" ON "equipement"("nom");

-- AddForeignKey
ALTER TABLE "Ordre_Fabrication" ADD CONSTRAINT "Ordre_Fabrication_PRF_fkey" FOREIGN KEY ("PRF") REFERENCES "system_config"("PRF") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programmes" ADD CONSTRAINT "programmes_PRF_fkey" FOREIGN KEY ("PRF") REFERENCES "system_config"("PRF") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zone_inspection" ADD CONSTRAINT "Zone_inspection_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_ofId_fkey" FOREIGN KEY ("ofId") REFERENCES "Ordre_Fabrication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_operateurId_fkey" FOREIGN KEY ("operateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defauts_detectes" ADD CONSTRAINT "defauts_detectes_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defauts_detectes" ADD CONSTRAINT "defauts_detectes_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone_inspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carte_modele" ADD CONSTRAINT "carte_modele_PRF_fkey" FOREIGN KEY ("PRF") REFERENCES "system_config"("PRF") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defaut_attendu" ADD CONSTRAINT "defaut_attendu_carteModelId_fkey" FOREIGN KEY ("carteModelId") REFERENCES "carte_modele"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defaut_attendu" ADD CONSTRAINT "defaut_attendu_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone_inspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
