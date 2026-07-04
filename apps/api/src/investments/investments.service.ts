import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';

@Injectable()
export class InvestmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForAccount(accountId: string) {
    return this.prisma.investment.findMany({
      where: { accountId },
      orderBy: { startDate: 'desc' },
    });
  }

  create(accountId: string, dto: CreateInvestmentDto) {
    return this.prisma.investment.create({
      data: {
        name: dto.name,
        type: dto.type,
        liquidity: dto.liquidity,
        principal: dto.principal,
        rate: dto.rate,
        cdbModalidade: dto.cdbModalidade,
        cdiRate: dto.cdiRate,
        cardWalletId: dto.cardWalletId,
        startDate: new Date(dto.startDate),
        maturityDate: dto.maturityDate ? new Date(dto.maturityDate) : null,
        accountId,
      },
    });
  }

  update(investmentId: string, dto: UpdateInvestmentDto) {
    return this.prisma.investment.update({
      where: { id: investmentId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.liquidity !== undefined && { liquidity: dto.liquidity }),
        ...(dto.principal !== undefined && { principal: dto.principal }),
        ...(dto.rate !== undefined && { rate: dto.rate }),
        ...(dto.cdbModalidade !== undefined && { cdbModalidade: dto.cdbModalidade }),
        ...(dto.cdiRate !== undefined && { cdiRate: dto.cdiRate }),
        ...(dto.cardWalletId !== undefined && { cardWalletId: dto.cardWalletId }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.maturityDate !== undefined && { maturityDate: dto.maturityDate ? new Date(dto.maturityDate) : null }),
      },
    });
  }

  remove(investmentId: string) {
    return this.prisma.investment.delete({ where: { id: investmentId } });
  }
}
