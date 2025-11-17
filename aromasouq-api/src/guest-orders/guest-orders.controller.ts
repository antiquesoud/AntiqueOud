import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { GuestOrdersService } from './guest-orders.service';
import { SessionService } from '../session/session.service';
import { CreateGuestOrderDto } from './dto/create-guest-order.dto';

@Controller('guest-orders')
export class GuestOrdersController {
  constructor(
    private readonly guestOrdersService: GuestOrdersService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Create a guest order (checkout)
   */
  @Post()
  async create(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() createOrderDto: CreateGuestOrderDto,
  ) {
    const sessionToken = this.sessionService.getOrCreateGuestSession(
      req.cookies,
      res,
    );

    return this.guestOrdersService.create(sessionToken, createOrderDto);
  }

  /**
   * Get guest order by ID (requires email verification)
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('email') email: string,
  ) {
    if (!email) {
      throw new Error('Email is required to view guest order');
    }

    return this.guestOrdersService.findOne(id, email);
  }

  /**
   * Get all orders for a guest email
   */
  @Get()
  async findByEmail(@Query('email') email: string) {
    if (!email) {
      throw new Error('Email is required');
    }

    return this.guestOrdersService.findByEmail(email);
  }

  /**
   * Cancel a guest order
   */
  @Post(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Query('email') email: string,
  ) {
    if (!email) {
      throw new Error('Email is required to cancel order');
    }

    return this.guestOrdersService.cancel(id, email);
  }
}
