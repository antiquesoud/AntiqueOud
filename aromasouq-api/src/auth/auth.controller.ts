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

    // Set httpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const frontendUrl = process.env.FRONTEND_URL || '';
    const isLocalhostFrontend = frontendUrl.includes('localhost');

    // Localhost development: use 'lax' (both frontend and backend are on localhost, same-site)
    // Production: use 'none' with secure for cross-origin support
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isLocalhostFrontend ? 'lax' : 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Clear guest session cookie if it exists
    if (req.cookies?.guest_session) {
      res.clearCookie('guest_session');
    }

    // Return user data without token
    return {
      message: 'Registration successful',
      user: result.user,
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

    // Set httpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const frontendUrl = process.env.FRONTEND_URL || '';
    const isLocalhostFrontend = frontendUrl.includes('localhost');

    // Localhost development: use 'lax' (both frontend and backend are on localhost, same-site)
    // Production: use 'none' with secure for cross-origin support
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isLocalhostFrontend ? 'lax' : 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Clear guest session cookie if it exists
    if (req.cookies?.guest_session) {
      res.clearCookie('guest_session');
    }

    // Return user data without token
    return {
      message: 'Login successful',
      user: result.user,
      cartMerged: result.cartMerged || false,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    const frontendUrl = process.env.FRONTEND_URL || '';
    const isLocalhostFrontend = frontendUrl.includes('localhost');

    // Clear the cookie with same settings as when it was set
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isLocalhostFrontend ? 'lax' : 'none',
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
