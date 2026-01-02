import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * ActiveUserGuard - Verifies user status from database
 *
 * Use this guard for sensitive operations where real-time
 * status verification is required:
 * - Placing orders
 * - Making payments
 * - Changing password
 * - Updating profile
 *
 * This guard adds a database query, so only use it where
 * security requires current status verification.
 */
@Injectable()
export class ActiveUserGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Verify current user status from database
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { status: true },
    });

    if (!dbUser) {
      throw new UnauthorizedException('User not found');
    }

    if (dbUser.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    return true;
  }
}
