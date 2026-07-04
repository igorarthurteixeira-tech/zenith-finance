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
import { InvestmentsService } from './investments.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';

@UseGuards(JwtAuthGuard, AccountMembershipGuard)
@Controller('accounts/:accountId/investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Get()
  findAll(@Param('accountId') accountId: string) {
    return this.investmentsService.findAllForAccount(accountId);
  }

  @Post()
  create(@Param('accountId') accountId: string, @Body() dto: CreateInvestmentDto) {
    return this.investmentsService.create(accountId, dto);
  }

  @Patch(':investmentId')
  update(@Param('investmentId') investmentId: string, @Body() dto: UpdateInvestmentDto) {
    return this.investmentsService.update(investmentId, dto);
  }

  @Delete(':investmentId')
  remove(@Param('investmentId') investmentId: string) {
    return this.investmentsService.remove(investmentId);
  }
}
