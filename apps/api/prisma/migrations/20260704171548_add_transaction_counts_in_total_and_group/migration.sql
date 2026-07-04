-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "countsInTotal" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "installmentGroupId" TEXT;

-- CreateIndex
CREATE INDEX "Transaction_installmentGroupId_idx" ON "Transaction"("installmentGroupId");
