import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Helper function to determine if we're in a cross-origin production environment
function getCookieSettings(req: Request): { secure: boolean; sameSite: 'lax' | 'none' | 'strict' } {
  const origin = req.headers.origin || req.headers.referer || '';
  const host = req.headers.host || '';

  // Check if request is from localhost (same-site development)
  const isLocalhostOrigin = origin.includes('localhost') || origin.includes('127.0.0.1');
  const isLocalhostHost = host.includes('localhost') || host.includes('127.0.0.1');

  // Check if it's production (Railway sets RAILWAY_ENVIRONMENT, or check NODE_ENV)
  const isProduction = process.env.NODE_ENV === 'production' ||
                       !!process.env.RAILWAY_ENVIRONMENT ||
                       origin.includes('antiqueoud.com');

  // Cross-origin (different domains) requires SameSite=None and Secure
  // Same-origin (localhost to localhost) can use Lax
  const isCrossOrigin = !isLocalhostOrigin || !isLocalhostHost;

  console.log('Cookie settings debug:', { origin, host, isProduction, isCrossOrigin, isLocalhostOrigin, isLocalhostHost });

  return {
    secure: isProduction || isCrossOrigin,
    sameSite: (isProduction || isCrossOrigin) ? 'none' : 'lax',
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(registerDto, req.cookies);

    // Get cookie settings based on request context
    const cookieSettings = getCookieSettings(req);

    // Set httpOnly cookie with cross-origin support
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: cookieSettings.secure,
      sameSite: cookieSettings.sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Clear guest session cookie if it exists
    if (req.cookies?.guest_session) {
      res.clearCookie('guest_session', {
        httpOnly: true,
        secure: cookieSettings.secure,
        sameSite: cookieSettings.sameSite,
        path: '/',
      });
    }

    // Return user data WITH token for Authorization header approach
    return {
      message: 'Registration successful',
      user: result.user,
      access_token: result.access_token,
      cartMerged: result.cartMerged || false,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto, req.cookies);

    // Get cookie settings based on request context
    const cookieSettings = getCookieSettings(req);

    // Set httpOnly cookie with cross-origin support (keep for backward compatibility)
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: cookieSettings.secure,
      sameSite: cookieSettings.sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Clear guest session cookie if it exists
    if (req.cookies?.guest_session) {
      res.clearCookie('guest_session', {
        httpOnly: true,
        secure: cookieSettings.secure,
        sameSite: cookieSettings.sameSite,
        path: '/',
      });
    }

    // Return user data WITH token for Authorization header approach
    return {
      message: 'Login successful',
      user: result.user,
      access_token: result.access_token,
      cartMerged: result.cartMerged || false,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Get cookie settings based on request context
    const cookieSettings = getCookieSettings(req);

    // Clear the cookie with same settings as when it was set
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: cookieSettings.secure,
      sameSite: cookieSettings.sameSite,
      path: '/',
    });

    return {
      message: 'Logout successful',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    const userId = req.user?.['sub'];
    const user = await this.authService.findUserById(userId);

    return {
      user,
    };
  }
}
