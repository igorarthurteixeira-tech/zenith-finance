-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "parentWalletId" TEXT;

-- CreateIndex
CREATE INDEX "Wallet_parentWalletId_idx" ON "Wallet"("parentWalletId");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_parentWalletId_fkey" FOREIGN KEY ("parentWalletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
