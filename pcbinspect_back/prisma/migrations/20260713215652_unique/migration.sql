/*
  Warnings:

  - A unique constraint covering the columns `[nom]` on the table `Zone_inspection` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Zone_inspection_nom_key" ON "Zone_inspection"("nom");
