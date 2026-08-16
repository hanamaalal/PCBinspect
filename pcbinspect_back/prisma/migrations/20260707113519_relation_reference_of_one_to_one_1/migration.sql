/*
  Warnings:

  - A unique constraint covering the columns `[PRF]` on the table `Ordre_Fabrication` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Ordre_Fabrication_PRF_key" ON "Ordre_Fabrication"("PRF");
