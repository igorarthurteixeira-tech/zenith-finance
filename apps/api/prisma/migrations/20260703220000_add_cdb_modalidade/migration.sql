-- CreateEnum
CREATE TYPE "CdbModalidade" AS ENUM ('NORMAL', 'LIMITE_GARANTIDO');

-- AlterTable
ALTER TABLE "Investment"
  ADD COLUMN "cdbModalidade" "CdbModalidade",
  ADD COLUMN "cdiRate"       DECIMAL(6,4),
  ADD COLUMN "cardWalletId"  TEXT;

-- CreateIndex
CREATE INDEX "Investment_cardWalletId_idx" ON "Investment"("cardWalletId");

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_cardWalletId_fkey"
  FOREIGN KEY ("cardWalletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
