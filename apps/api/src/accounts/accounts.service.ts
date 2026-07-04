import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { seedDefaultCategories } from '../categories/default-categories';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForUser(userId: string) {
    return this.prisma.account.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(userId: string, dto: CreateAccountDto) {
    const account = await this.prisma.account.create({
      data: { name: dto.name, type: dto.type, ownerId: userId },
    });
    await seedDefaultCategories(this.prisma, account.id, dto.type);
    await this.prisma.wallet.create({
      data: { name: 'Carteira', accountId: account.id },
    });
    return account;
  }

  update(accountId: string, dto: UpdateAccountDto) {
    return this.prisma.account.update({
      where: { id: accountId },
      data: { name: dto.name },
    });
  }

  remove(accountId: string) {
    return this.prisma.account.delete({ where: { id: accountId } });
  }
}
