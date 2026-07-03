import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

type RequestWithUser = Request<{ accountId: string }> & {
  user?: AuthenticatedUser;
};

@Injectable()
export class AccountMembershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const accountId = request.params.accountId;
    const userId = request.user?.id;

    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account || account.ownerId !== userId) {
      throw new ForbiddenException('Conta não pertence ao usuário');
    }

    return true;
  }
}
