import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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

  remove(categoryId: string) {
    return this.prisma.category.delete({ where: { id: categoryId } });
  }
}
