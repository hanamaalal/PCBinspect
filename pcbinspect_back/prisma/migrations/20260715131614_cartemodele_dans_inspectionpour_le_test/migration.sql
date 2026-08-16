-- AlterTable
ALTER TABLE "inspections" ADD COLUMN     "carteModeleId" TEXT;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_carteModeleId_fkey" FOREIGN KEY ("carteModeleId") REFERENCES "carte_modele"("id") ON DELETE SET NULL ON UPDATE CASCADE;
