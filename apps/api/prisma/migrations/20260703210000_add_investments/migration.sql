-- CreateEnum
CREATE TYPE "InvestmentType" AS ENUM ('CDB', 'LCI', 'LCA', 'TESOURO_DIRETO', 'ACOES', 'FII', 'CRIPTO', 'OUTRO');

-- CreateEnum
CREATE TYPE "InvestmentLiquidity" AS ENUM ('D0', 'D1', 'D2', 'D30', 'D60', 'D90', 'NO_VENCIMENTO');

-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InvestmentType" NOT NULL,
    "liquidity" "InvestmentLiquidity" NOT NULL,
    "principal" DECIMAL(14,2) NOT NULL,
    "rate" DECIMAL(8,4) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "maturityDate" TIMESTAMP(3),
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Investment_accountId_idx" ON "Investment"("accountId");

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
