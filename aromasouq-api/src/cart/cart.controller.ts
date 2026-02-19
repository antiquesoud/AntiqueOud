import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { SyncCartDto } from './dto/sync-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: Request) {
    const userId = req.user!['sub'];
    return this.cartService.getCart(userId);
  }

  @Post('items')
  addItem(@Req() req: Request, @Body() addCartItemDto: AddCartItemDto) {
    const userId = req.user!['sub'];
    return this.cartService.addItem(userId, addCartItemDto);
  }

  @Patch('items/:id')
  updateItem(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const userId = req.user!['sub'];
    return this.cartService.updateItem(userId, id, updateCartItemDto);
  }

  @Patch('sync')
  syncCart(@Req() req: Request, @Body() syncCartDto: SyncCartDto) {
    const userId = req.user!['sub'];
    return this.cartService.syncCart(userId, syncCartDto);
  }

  @Delete('items/:id')
  removeItem(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user!['sub'];
    return this.cartService.removeItem(userId, id);
  }

  @Delete()
  clearCart(@Req() req: Request) {
    const userId = req.user!['sub'];
    return this.cartService.clearCart(userId);
  }
}
