import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { isVendorRegistrationEnabled } from '../config/features.config';

@Controller('vendor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.VENDOR)
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  /**
   * Create vendor profile
   * POST /vendor/profile
   * Blocked in single-vendor mode
   */
  @Post('profile')
  create(@Req() req: Request, @Body() createVendorDto: CreateVendorDto) {
    // Block vendor profile creation in single-vendor mode
    if (!isVendorRegistrationEnabled()) {
      throw new ForbiddenException(
        'Vendor registration is not available. This is a single-vendor store.'
      );
    }
    const userId = req.user!['sub'];
    return this.vendorService.create(userId, createVendorDto);
  }

  /**
   * Get vendor profile
   * GET /vendor/profile
   */
  @Get('profile')
  getProfile(@Req() req: Request) {
    const userId = req.user!['sub'];
    return this.vendorService.getByUserId(userId);
  }

  /**
   * Update vendor profile
   * PATCH /vendor/profile
   */
  @Patch('profile')
  update(@Req() req: Request, @Body() updateVendorDto: UpdateVendorDto) {
    const userId = req.user!['sub'];
    return this.vendorService.update(userId, updateVendorDto);
  }

  /**
   * Get vendor dashboard statistics
   * GET /vendor/dashboard
   */
  @Get('dashboard')
  getDashboardStats(@Req() req: Request) {
    const userId = req.user!['sub'];
    return this.vendorService.getDashboardStats(userId);
  }

  /**
   * Get vendor's products
   * GET /vendor/products
   */
  @Get('products')
  getProducts(
    @Req() req: Request,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user!['sub'];
    return this.vendorService.getProducts(userId, {
      search,
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /**
   * Get vendor's orders
   * GET /vendor/orders
   */
  @Get('orders')
  getOrders(
    @Req() req: Request,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user!['sub'];
    return this.vendorService.getOrders(userId, {
      search,
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /**
   * Get single order details
   * GET /vendor/orders/:id
   */
  @Get('orders/:id')
  getOrder(@Req() req: Request, @Param('id') orderId: string) {
    const userId = req.user!['sub'];
    return this.vendorService.getOrder(userId, orderId);
  }

  /**
   * Update order status
   * PUT /vendor/orders/:id/status
   */
  @Put('orders/:id/status')
  updateOrderStatus(
    @Req() req: Request,
    @Param('id') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const userId = req.user!['sub'];
    return this.vendorService.updateOrderStatus(userId, orderId, updateOrderStatusDto);
  }
}
