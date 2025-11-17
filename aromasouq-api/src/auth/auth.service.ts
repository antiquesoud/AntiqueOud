import { Injectable, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { GuestCartService } from '../guest-cart/guest-cart.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { isVendorRegistrationEnabled } from '../config/features.config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private guestCartService: GuestCartService,
  ) {}

  async register(registerDto: RegisterDto, cookies?: any) {
    const { email, password, firstName, lastName, phone, role } = registerDto;

    // Block vendor registration in single-vendor mode
    if (role === 'VENDOR' && !isVendorRegistrationEnabled()) {
      throw new ForbiddenException(
        'Vendor registration is not available. This is a single-vendor store.'
      );
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role || 'CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        preferredLanguage: true,
        createdAt: true,
      },
    });

    // Create wallet for user
    await this.prisma.wallet.create({
      data: {
        userId: user.id,
      },
    });

    // Merge guest cart if session exists
    let cartMerged = false;
    if (cookies?.guest_session) {
      try {
        const mergeResult = await this.guestCartService.mergeIntoUserCart(
          cookies.guest_session,
          user.id,
        );
        cartMerged = (mergeResult?.itemsMerged || 0) > 0;
      } catch (error) {
        // Log error but don't fail registration
        console.error('Failed to merge guest cart:', error);
      }
    }

    // Generate JWT token
    const access_token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token,
      user,
      cartMerged,
    };
  }

  async login(loginDto: LoginDto, cookies?: any) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    // Merge guest cart if session exists
    let cartMerged = false;
    if (cookies?.guest_session) {
      try {
        const mergeResult = await this.guestCartService.mergeIntoUserCart(
          cookies.guest_session,
          user.id,
        );
        cartMerged = (mergeResult?.itemsMerged || 0) > 0;
      } catch (error) {
        // Log error but don't fail login
        console.error('Failed to merge guest cart:', error);
      }
    }

    // Generate JWT token
    const access_token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword,
      cartMerged,
    };
  }

  async findUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        preferredLanguage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
