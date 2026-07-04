import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AccountMembershipGuard } from '../accounts/guards/account-membership.guard';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateInstallmentPurchaseDto } from './dto/create-installment-purchase.dto';

@UseGuards(JwtAuthGuard, AccountMembershipGuard)
@Controller('accounts/:accountId/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(@Param('accountId') accountId: string) {
    return this.transactionsService.findAllForAccount(accountId);
  }

  @Post()
  create(
    @Param('accountId') accountId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(accountId, dto);
  }

  @Post('installments')
  createInstallmentPurchase(
    @Param('accountId') accountId: string,
    @Body() dto: CreateInstallmentPurchaseDto,
  ) {
    return this.transactionsService.createInstallmentPurchase(accountId, dto);
  }

  @Patch(':transactionId')
  update(
    @Param('transactionId') transactionId: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(transactionId, dto);
  }

  @Delete(':transactionId')
  remove(@Param('transactionId') transactionId: string) {
    return this.transactionsService.remove(transactionId);
  }
}
