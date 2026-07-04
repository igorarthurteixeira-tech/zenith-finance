import { Injectable } from '@nestjs/common';
import { WalletType } from '@zenith/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@Injectable()
export class WalletsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForAccount(accountId: string) {
    return this.prisma.wallet.findMany({
      where: { accountId },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(accountId: string, dto: CreateWalletDto) {
    return this.prisma.wallet.create({
      data: {
        name: dto.name,
        accountId,
        type: dto.type ?? WalletType.CONTA,
        initialBalance: dto.initialBalance ?? '0',
        creditLimit: dto.creditLimit,
        closingDay: dto.closingDay,
        dueDay: dto.dueDay,
        parentWalletId:
          dto.type === WalletType.CARTAO_CREDITO ? dto.parentWalletId : null,
      },
    });
  }

  update(walletId: string, dto: UpdateWalletDto) {
    return this.prisma.wallet.update({
      where: { id: walletId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.initialBalance !== undefined && {
          initialBalance: dto.initialBalance,
        }),
        ...(dto.creditLimit !== undefined && { creditLimit: dto.creditLimit }),
        ...(dto.closingDay !== undefined && { closingDay: dto.closingDay }),
        ...(dto.dueDay !== undefined && { dueDay: dto.dueDay }),
      },
    });
  }

  remove(walletId: string) {
    return this.prisma.wallet.delete({ where: { id: walletId } });
  }
}
