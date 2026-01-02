import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * JWT Strategy - OPTIMIZED FOR PERFORMANCE
 *
 * Previous implementation queried the database on EVERY authenticated request,
 * adding 50-100ms latency per request.
 *
 * This optimized version:
 * 1. Trusts the JWT payload (already cryptographically verified by Passport)
 * 2. Includes user status in the JWT payload (set during login/register)
 * 3. Only validates payload structure, not database state
 *
 * For sensitive operations (orders, payments, profile changes), use the
 * ActiveUserGuard which verifies current database status.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.access_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  async validate(payload: any) {
    // JWT signature is already verified by Passport at this point
    // We only need to validate the payload structure

    if (!payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Check status from JWT payload (set during login/register)
    // For real-time status verification, use ActiveUserGuard on sensitive endpoints
    if (payload.status && payload.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      status: payload.status || 'ACTIVE',
    };
  }
}
