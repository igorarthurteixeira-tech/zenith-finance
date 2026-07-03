import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
    // Reuses a single client across warm serverless invocations instead of
    // opening a new pool of connections to Neon on every cold start.
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = this;
    }
    return globalForPrisma.prisma as this;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
