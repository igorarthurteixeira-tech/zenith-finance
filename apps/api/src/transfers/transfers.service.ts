import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { TransactionType } from '@zenith/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Injectable()
export class TransfersService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForAccount(accountId: string) {
    return this.prisma.transfer.findMany({
      where: {
        OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateTransferDto) {
    if (dto.fromAccountId === dto.toAccountId) {
      throw new BadRequestException(
        'As contas de origem e destino devem ser diferentes',
      );
    }

    const [fromAccount, toAccount] = await Promise.all([
      this.prisma.account.findUnique({ where: { id: dto.fromAccountId } }),
      this.prisma.account.findUnique({ where: { id: dto.toAccountId } }),
    ]);

    if (
      !fromAccount ||
      !toAccount ||
      fromAccount.ownerId !== userId ||
      toAccount.ownerId !== userId
    ) {
      throw new ForbiddenException('Contas não pertencem ao usuário');
    }

    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const originTransaction = await tx.transaction.create({
        data: {
          description:
            dto.description ?? `Transferência para ${toAccount.name}`,
          amount: dto.amount,
          type: TransactionType.EXPENSE,
          date: now,
          accountId: fromAccount.id,
        },
      });

      const destinationTransaction = await tx.transaction.create({
        data: {
          description:
            dto.description ?? `Transferência de ${fromAccount.name}`,
          amount: dto.amount,
          type: TransactionType.INCOME,
          date: now,
          accountId: toAccount.id,
        },
      });

      return tx.transfer.create({
        data: {
          fromAccountId: fromAccount.id,
          toAccountId: toAccount.id,
          amount: dto.amount,
          description: dto.description,
          originTransactionId: originTransaction.id,
          destinationTransactionId: destinationTransaction.id,
        },
      });
    });
  }
}
