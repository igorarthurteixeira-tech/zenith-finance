import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { seedDefaultCategories } from './default-categories';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForAccount(accountId: string) {
    return this.prisma.category.findMany({
      where: { accountId },
      orderBy: { name: 'asc' },
    });
  }

  create(accountId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: { name: dto.name, type: dto.type, accountId },
    });
  }

  async seedDefaults(accountId: string) {
    const account = await this.prisma.account.findUniqueOrThrow({
      where: { id: accountId },
    });
    await seedDefaultCategories(this.prisma, accountId, account.type);
    return this.findAllForAccount(accountId);
  }

  remove(categoryId: string) {
    return this.prisma.category.delete({ where: { id: categoryId } });
  }
}
