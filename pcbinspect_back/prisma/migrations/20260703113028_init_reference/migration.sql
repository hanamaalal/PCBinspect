-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "PRF" TEXT NOT NULL,
    "verifSN" BOOLEAN NOT NULL,
    "longeurSN" INTEGER NOT NULL,
    "partieFixe" TEXT NOT NULL,
    "postpartiefixe" TEXT NOT NULL,
    "activationInterblocage" BOOLEAN NOT NULL,
    "indicePartieFixe" INTEGER NOT NULL,
    "statutSN" TEXT NOT NULL,
    "jugementOperateur" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imagepath" TEXT,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_config_PRF_key" ON "system_config"("PRF");
