import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  addMonthsToPeriod,
  shiftDateByMonths,
  InstallmentAmountMode,
} from '@zenith/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateInstallmentPurchaseDto } from './dto/create-installment-purchase.dto';
import { UpdateInstallmentGroupDto } from './dto/update-installment-group.dto';

function splitIntoCents(totalCents: number, count: number): number[] {
  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count;
  return Array.from(
    { length: count },
    (_, i) => base + (i < remainder ? 1 : 0),
  );
}

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForAccount(accountId: string) {
    return this.prisma.transaction.findMany({
      where: { accountId },
      orderBy: { date: 'desc' },
    });
  }

  create(accountId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        description: dto.description,
        amount: dto.amount,
        type: dto.type,
        date: new Date(dto.date),
        invoicePeriod: dto.invoicePeriod,
        accountId,
        categoryId: dto.categoryId,
        walletId: dto.walletId,
      },
    });
  }

  update(transactionId: string, dto: UpdateTransactionDto) {
    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.walletId !== undefined && { walletId: dto.walletId }),
        ...(dto.invoicePeriod !== undefined && { invoicePeriod: dto.invoicePeriod }),
        ...(dto.countsInTotal !== undefined && { countsInTotal: dto.countsInTotal }),
      },
    });
  }

  remove(transactionId: string) {
    return this.prisma.transaction.delete({ where: { id: transactionId } });
  }

  createInstallmentPurchase(
    accountId: string,
    dto: CreateInstallmentPurchaseDto,
  ) {
    const {
      totalInstallments,
      startInstallment,
      startInvoicePeriod,
      countPastInstallments,
    } = dto;

    if (startInstallment > totalInstallments) {
      throw new BadRequestException(
        'A parcela inicial não pode ser maior que o total de parcelas',
      );
    }

    const totalCents =
      dto.amountMode === InstallmentAmountMode.TOTAL
        ? Math.round(Number(dto.amount) * 100)
        : Math.round(Number(dto.amount) * 100) * totalInstallments;
    const centsByInstallment = splitIntoCents(totalCents, totalInstallments);

    const baseDate = new Date(dto.date);
    const installmentGroupId = randomUUID();

    const rowsData: Prisma.TransactionUncheckedCreateInput[] = [];
    for (let index = 0; index < totalInstallments; index++) {
      const installmentNumber = index + 1;
      const offset = installmentNumber - startInstallment;
      const isPast = installmentNumber < startInstallment;
      rowsData.push({
        description: `${dto.description} (${installmentNumber}/${totalInstallments})`,
        amount: (centsByInstallment[index] / 100).toFixed(2),
        type: dto.type,
        date: shiftDateByMonths(baseDate, offset),
        invoicePeriod: addMonthsToPeriod(startInvoicePeriod, offset),
        countsInTotal: isPast ? countPastInstallments : true,
        installmentGroupId,
        accountId,
        categoryId: dto.categoryId,
        walletId: dto.walletId,
      });
    }

    return this.prisma.$transaction(
      rowsData.map((data) => this.prisma.transaction.create({ data })),
    );
  }

  private buildScopeFilter(scope: string | undefined, referenceDate: string | undefined) {
    if (!referenceDate || !scope || scope === 'all') return {};
    const d = new Date(referenceDate);
    if (scope === 'before') return { date: { lt: d } };
    if (scope === 'up_to') return { date: { lte: d } };
    return {};
  }

  updateInstallmentGroup(
    accountId: string,
    installmentGroupId: string,
    dto: UpdateInstallmentGroupDto,
  ) {
    const scopeFilter = this.buildScopeFilter(dto.scope, dto.referenceDate);
    return this.prisma.transaction.updateMany({
      where: { accountId, installmentGroupId, ...scopeFilter },
      data: {
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.countsInTotal !== undefined && { countsInTotal: dto.countsInTotal }),
      },
    });
  }

  removeInstallmentGroup(
    accountId: string,
    installmentGroupId: string,
    scope?: string,
    referenceDate?: string,
  ) {
    const scopeFilter = this.buildScopeFilter(scope, referenceDate);
    return this.prisma.transaction.deleteMany({
      where: { accountId, installmentGroupId, ...scopeFilter },
    });
  }
}
