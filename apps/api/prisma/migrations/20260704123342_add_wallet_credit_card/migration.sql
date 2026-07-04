-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('CONTA', 'CARTAO_CREDITO');

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "closingDay" INTEGER,
ADD COLUMN     "creditLimit" DECIMAL(14,2),
ADD COLUMN     "dueDay" INTEGER,
ADD COLUMN     "type" "WalletType" NOT NULL DEFAULT 'CONTA';
