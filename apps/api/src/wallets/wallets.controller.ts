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
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@UseGuards(JwtAuthGuard, AccountMembershipGuard)
@Controller('accounts/:accountId/wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  findAll(@Param('accountId') accountId: string) {
    return this.walletsService.findAllForAccount(accountId);
  }

  @Post()
  create(@Param('accountId') accountId: string, @Body() dto: CreateWalletDto) {
    return this.walletsService.create(accountId, dto);
  }

  @Patch(':walletId')
  update(@Param('walletId') walletId: string, @Body() dto: UpdateWalletDto) {
    return this.walletsService.update(walletId, dto);
  }

  @Delete(':walletId')
  remove(@Param('walletId') walletId: string) {
    return this.walletsService.remove(walletId);
  }
}
