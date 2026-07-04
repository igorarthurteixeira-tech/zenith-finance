import { Injectable } from '@nestjs/common';
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
      data: { name: dto.name, accountId },
    });
  }

  update(walletId: string, dto: UpdateWalletDto) {
    return this.prisma.wallet.update({
      where: { id: walletId },
      data: { ...(dto.name !== undefined && { name: dto.name }) },
    });
  }

  remove(walletId: string) {
    return this.prisma.wallet.delete({ where: { id: walletId } });
  }
}
