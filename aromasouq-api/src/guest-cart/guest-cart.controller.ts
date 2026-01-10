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
   * Returns session token for frontend to store
   */
  @Get()
  async getCart(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { sessionToken, isNew } = this.sessionService.getOrCreateGuestSessionFromRequest(req, res);
    const cart = await this.guestCartService.getCartWithTotals(sessionToken);

    // Always return session token so frontend can store it
    return {
      ...cart,
      guest_session: sessionToken,
    };
  }

  /**
   * Add item to guest cart
   * Returns session token for frontend to store
   */
  @Post('items')
  async addItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() addToCartDto: AddToCartDto,
  ) {
    const { sessionToken } = this.sessionService.getOrCreateGuestSessionFromRequest(req, res);

    await this.guestCartService.addItem(
      sessionToken,
      addToCartDto.productId,
      addToCartDto.quantity,
      addToCartDto.variantId,
    );

    const cart = await this.guestCartService.getCartWithTotals(sessionToken);

    // Always return session token so frontend can store it
    return {
      ...cart,
      guest_session: sessionToken,
    };
  }

  /**
   * Update cart item quantity
   * Returns session token for frontend to store
   */
  @Patch('items/:itemId')
  async updateItemQuantity(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('itemId') itemId: string,
    @Body() updateQuantityDto: UpdateQuantityDto,
  ) {
    const { sessionToken } = this.sessionService.getOrCreateGuestSessionFromRequest(req, res);

    await this.guestCartService.updateItemQuantity(
      sessionToken,
      itemId,
      updateQuantityDto.quantity,
    );

    const cart = await this.guestCartService.getCartWithTotals(sessionToken);

    // Always return session token so frontend can store it
    return {
      ...cart,
      guest_session: sessionToken,
    };
  }

  /**
   * Remove item from cart
   * Returns session token for frontend to store
   */
  @Delete('items/:itemId')
  async removeItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('itemId') itemId: string,
  ) {
    const { sessionToken } = this.sessionService.getOrCreateGuestSessionFromRequest(req, res);

    await this.guestCartService.removeItem(sessionToken, itemId);

    const cart = await this.guestCartService.getCartWithTotals(sessionToken);

    // Always return session token so frontend can store it
    return {
      ...cart,
      guest_session: sessionToken,
    };
  }

  /**
   * Clear entire cart
   * Returns session token for frontend to store
   */
  @Delete()
  async clearCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { sessionToken } = this.sessionService.getOrCreateGuestSessionFromRequest(req, res);

    const result = await this.guestCartService.clearCart(sessionToken);

    // Always return session token so frontend can store it
    return {
      ...result,
      guest_session: sessionToken,
    };
  }
}
