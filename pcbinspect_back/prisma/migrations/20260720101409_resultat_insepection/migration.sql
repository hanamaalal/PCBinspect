/*
  Warnings:

  - The values [EN_COURS] on the enum `ResultatInspection` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ResultatInspection_new" AS ENUM ('GOOD', 'NOT_GOOD');
ALTER TABLE "inspections" ALTER COLUMN "resultat" TYPE "ResultatInspection_new" USING ("resultat"::text::"ResultatInspection_new");
ALTER TYPE "ResultatInspection" RENAME TO "ResultatInspection_old";
ALTER TYPE "ResultatInspection_new" RENAME TO "ResultatInspection";
DROP TYPE "public"."ResultatInspection_old";
COMMIT;
