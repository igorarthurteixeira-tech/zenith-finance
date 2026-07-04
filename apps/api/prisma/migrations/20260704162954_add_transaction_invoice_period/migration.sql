-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "invoicePeriod" TEXT;

-- CreateIndex
CREATE INDEX "Transaction_walletId_invoicePeriod_idx" ON "Transaction"("walletId", "invoicePeriod");
