import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AccountMembershipGuard } from '../accounts/guards/account-membership.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@UseGuards(JwtAuthGuard, AccountMembershipGuard)
@Controller('accounts/:accountId/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Param('accountId') accountId: string) {
    return this.categoriesService.findAllForAccount(accountId);
  }

  @Post()
  create(
    @Param('accountId') accountId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(accountId, dto);
  }

  @Post('seed-defaults')
  seedDefaults(@Param('accountId') accountId: string) {
    return this.categoriesService.seedDefaults(accountId);
  }

  @Delete(':categoryId')
  remove(@Param('categoryId') categoryId: string) {
    return this.categoriesService.remove(categoryId);
  }
}
