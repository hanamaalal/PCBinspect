-- AlterEnum
ALTER TYPE "JugementOperateur" ADD VALUE 'EN_ATTENTE';
COMMIT;
-- AlterTable
ALTER TABLE "defauts_detectes"
ALTER COLUMN "jugement" SET DEFAULT 'EN_ATTENTE';
