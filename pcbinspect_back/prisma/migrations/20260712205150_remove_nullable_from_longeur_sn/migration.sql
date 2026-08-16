/*
  Warnings:

  - The values [CONFIRME,REJETE] on the enum `JugementOperateur` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `defautAttendu` to the `defaut_attendu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defautdetecte` to the `defauts_detectes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `PRF` to the `inspections` table without a default value. This is not possible if the table is not empty.
  - Made the column `longeurSN` on table `system_config` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "JugementOperateur_new" AS ENUM ('PASS', 'FAIL');
ALTER TABLE "defauts_detectes" ALTER COLUMN "jugement" TYPE "JugementOperateur_new" USING ("jugement"::text::"JugementOperateur_new");
ALTER TYPE "JugementOperateur" RENAME TO "JugementOperateur_old";
ALTER TYPE "JugementOperateur_new" RENAME TO "JugementOperateur";
DROP TYPE "public"."JugementOperateur_old";
COMMIT;

-- AlterTable
ALTER TABLE "defaut_attendu" ADD COLUMN     "defautAttendu" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "defauts_detectes" ADD COLUMN     "defautdetecte" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "inspections" ADD COLUMN     "PRF" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "system_config" ALTER COLUMN "longeurSN" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_PRF_fkey" FOREIGN KEY ("PRF") REFERENCES "system_config"("PRF") ON DELETE RESTRICT ON UPDATE CASCADE;
