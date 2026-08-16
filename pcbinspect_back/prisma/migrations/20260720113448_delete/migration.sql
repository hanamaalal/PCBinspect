-- DropForeignKey
ALTER TABLE "defauts_detectes" DROP CONSTRAINT "defauts_detectes_inspectionId_fkey";

-- AddForeignKey
ALTER TABLE "defauts_detectes" ADD CONSTRAINT "defauts_detectes_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
