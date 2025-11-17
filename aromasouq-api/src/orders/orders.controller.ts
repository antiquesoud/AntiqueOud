import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { OrdersService } from './orders.service';
// import { InvoiceService } from './invoice.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { TrackOrderDto } from './dto/track-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, OrderStatus } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    // private readonly invoiceService: InvoiceService,
  ) {}

  /**
   * PUBLIC ENDPOINT - Track order by order number and email
   * No authentication required
   */
  @Post('track')
  trackOrder(@Body() trackOrderDto: TrackOrderDto) {
    return this.ordersService.trackOrder(
      trackOrderDto.orderNumber,
      trackOrderDto.email,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Req() req: Request,
    @Query('orderStatus') orderStatus?: OrderStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user!['sub'];
    return this.ordersService.findAll(userId, {
      orderStatus,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user!['sub'];
    return this.ordersService.findOne(userId, id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: Request, @Body() createOrderDto: CreateOrderDto) {
    const userId = req.user!['sub'];
    return this.ordersService.create(userId, createOrderDto);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user!['sub'];
    return this.ordersService.cancel(userId, id);
  }

  // Temporarily commented out until pdfkit is installed
  // @Get(':id/invoice')
  // async downloadInvoice(
  //   @Req() req: Request,
  //   @Param('id') orderId: string,
  //   @Res() res: Response,
  // ) {
  //   const userId = req.user!['sub'];

  //   // Get order with full details
  //   const order = await this.ordersService.findOne(userId, orderId);

  //   // Generate PDF
  //   const pdfBuffer = await this.invoiceService.generateInvoicePDF(order);

  //   // Set headers for PDF download
  //   res.set({
  //     'Content-Type': 'application/pdf',
  //     'Content-Disposition': `attachment; filename=invoice-${order.orderNumber}.pdf`,
  //     'Content-Length': pdfBuffer.length,
  //   });

  //   res.end(pdfBuffer);
  // }
}
