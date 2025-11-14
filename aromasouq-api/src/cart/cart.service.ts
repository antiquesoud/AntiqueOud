import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    // Get or create cart for user
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: {
                  select: {
                    id: true,
                    name: true,
                    nameAr: true,
                    logo: true,
                  },
                },
                category: {
                  select: {
                    id: true,
                    name: true,
                    nameAr: true,
                  },
                },
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  brand: {
                    select: {
                      id: true,
                      name: true,
                      nameAr: true,
                      logo: true,
                    },
                  },
                  category: {
                    select: {
                      id: true,
                      name: true,
                      nameAr: true,
                    },
                  },
                },
              },
              variant: true,
            },
          },
        },
      });
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.variant?.price || item.product.price;
      return sum + price * item.quantity;
    }, 0);

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const tax = subtotal * 0.05; // 5% tax
    const shipping = subtotal > 200 ? 0 : 25; // Free shipping over 200 AED
    const total = subtotal + tax + shipping;
    const coinsEarnable = Math.floor(total / 10); // 1 coin per 10 AED

    return {
      ...cart,
      summary: {
        subtotal,
        shipping,
        tax,
        coinsEarnable,
        total,
        itemCount,
      },
    };
  }

  async addItem(userId: string, addCartItemDto: AddCartItemDto) {
    const { productId, variantId, quantity, notes } = addCartItemDto;

    // Verify product exists and is active
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (!product.isActive) {
      throw new BadRequestException('Product is not available');
    }

    // If variant specified, verify it exists and is active
    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) {
        throw new NotFoundException(`Variant with ID ${variantId} not found`);
      }
      if (!variant.isActive) {
        throw new BadRequestException('Variant is not available');
      }
    }

    // Get or create cart
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    });

    if (existingItem) {
      // Update quantity
      const updatedItem = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          notes: notes || existingItem.notes,
        },
        include: {
          product: {
            include: {
              brand: true,
              category: true,
            },
          },
          variant: true,
        },
      });

      return updatedItem;
    }

    // Create new cart item
    const cartItem = await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId,
        quantity,
        notes,
      },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
          },
        },
        variant: true,
      },
    });

    return cartItem;
  }

  async updateItem(
    userId: string,
    itemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    // Verify cart item belongs to user
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: true,
        variant: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }

    if (cartItem.cart.userId !== userId) {
      throw new BadRequestException('Cart item does not belong to user');
    }

    // Validate stock if quantity is being updated
    if (updateCartItemDto.quantity !== undefined) {
      const availableStock = cartItem.variant?.stock || cartItem.product.stock;

      if (updateCartItemDto.quantity > availableStock) {
        throw new BadRequestException(
          `Only ${availableStock} units available in stock`
        );
      }

      if (updateCartItemDto.quantity < 1) {
        throw new BadRequestException('Quantity must be at least 1');
      }
    }

    const updatedItem = await this.prisma.cartItem.update({
      where: { id: itemId },
      data: updateCartItemDto,
      include: {
        product: {
          include: {
            brand: true,
            category: true,
          },
        },
        variant: true,
      },
    });

    return updatedItem;
  }

  async removeItem(userId: string, itemId: string) {
    // Verify cart item belongs to user
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }

    if (cartItem.cart.userId !== userId) {
      throw new BadRequestException('Cart item does not belong to user');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { message: 'Cart cleared' };
  }
}
