import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { GuestCartService } from './guest-cart.service';
import { SessionService } from '../session/session.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';

@Controller('guest-cart')
export class GuestCartController {
  constructor(
    private readonly guestCartService: GuestCartService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Get guest cart
   * Creates session if doesn't exist
   */
  @Get()
  async getCart(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sessionToken = this.sessionService.getOrCreateGuestSession(
      req.cookies,
      res,
    );

    return this.guestCartService.getCartWithTotals(sessionToken);
  }

  /**
   * Add item to guest cart
   */
  @Post('items')
  async addItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() addToCartDto: AddToCartDto,
  ) {
    const sessionToken = this.sessionService.getOrCreateGuestSession(
      req.cookies,
      res,
    );

    await this.guestCartService.addItem(
      sessionToken,
      addToCartDto.productId,
      addToCartDto.quantity,
      addToCartDto.variantId,
    );

    return this.guestCartService.getCartWithTotals(sessionToken);
  }

  /**
   * Update cart item quantity
   */
  @Patch('items/:itemId')
  async updateItemQuantity(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('itemId') itemId: string,
    @Body() updateQuantityDto: UpdateQuantityDto,
  ) {
    const sessionToken = this.sessionService.getOrCreateGuestSession(
      req.cookies,
      res,
    );

    await this.guestCartService.updateItemQuantity(
      sessionToken,
      itemId,
      updateQuantityDto.quantity,
    );

    return this.guestCartService.getCartWithTotals(sessionToken);
  }

  /**
   * Remove item from cart
   */
  @Delete('items/:itemId')
  async removeItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('itemId') itemId: string,
  ) {
    const sessionToken = this.sessionService.getOrCreateGuestSession(
      req.cookies,
      res,
    );

    await this.guestCartService.removeItem(sessionToken, itemId);

    return this.guestCartService.getCartWithTotals(sessionToken);
  }

  /**
   * Clear entire cart
   */
  @Delete()
  async clearCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionToken = this.sessionService.getOrCreateGuestSession(
      req.cookies,
      res,
    );

    return this.guestCartService.clearCart(sessionToken);
  }
}
