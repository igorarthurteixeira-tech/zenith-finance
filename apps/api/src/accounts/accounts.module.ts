import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { AccountMembershipGuard } from './guards/account-membership.guard';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService, AccountMembershipGuard],
  exports: [AccountMembershipGuard],
})
export class AccountsModule {}
