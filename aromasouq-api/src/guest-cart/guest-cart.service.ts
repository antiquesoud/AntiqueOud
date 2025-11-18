import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionService } from '../session/session.service';

@Injectable()
export class GuestCartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Get or create guest cart
   */
  async getOrCreateCart(sessionToken: string) {
    let cart = await this.prisma.guestCart.findUnique({
      where: { sessionToken },
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
      cart = await this.prisma.guestCart.create({
        data: {
          sessionToken,
        },
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

    return cart;
  }

  /**
   * Add item to guest cart
   */
  async addItem(
    sessionToken: string,
    productId: string,
    quantity: number,
    variantId?: string,
  ) {
    // Validate product exists and is active
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: variantId ? { where: { id: variantId } } : false,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.isActive) {
      throw new BadRequestException('Product is not available');
    }

    // Validate stock
    const availableStock = variantId
      ? product.variants?.[0]?.stock || 0
      : product.stock;

    if (availableStock < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Only ${availableStock} available`,
      );
    }

    // Get or create cart
    const cart = await this.getOrCreateCart(sessionToken);

    // Check if item already exists
    const existingItem = await this.prisma.guestCartItem.findFirst({
      where: {
        guestCartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > availableStock) {
        throw new BadRequestException(
          `Cannot add more than ${availableStock} items`,
        );
      }

      return this.prisma.guestCartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: true,
          variant: true,
        },
      });
    }

    // Create new cart item
    return this.prisma.guestCartItem.create({
      data: {
        guestCartId: cart.id,
        productId,
        variantId,
        quantity,
      },
      include: {
        product: true,
        variant: true,
      },
    });
  }

  /**
   * Update cart item quantity
   */
  async updateItemQuantity(
    sessionToken: string,
    itemId: string,
    quantity: number,
  ) {
    const cart = await this.getOrCreateCart(sessionToken);

    const item = await this.prisma.guestCartItem.findFirst({
      where: {
        id: itemId,
        guestCartId: cart.id,
      },
      include: {
        product: true,
        variant: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    // Validate stock
    const availableStock = item.variant?.stock || item.product.stock;

    if (quantity > availableStock) {
      throw new BadRequestException(
        `Cannot add more than ${availableStock} items`,
      );
    }

    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    return this.prisma.guestCartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: true,
        variant: true,
      },
    });
  }

  /**
   * Remove item from cart
   */
  async removeItem(sessionToken: string, itemId: string) {
    const cart = await this.getOrCreateCart(sessionToken);

    const item = await this.prisma.guestCartItem.findFirst({
      where: {
        id: itemId,
        guestCartId: cart.id,
      },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.guestCartItem.delete({
      where: { id: itemId },
    });

    return { message: 'Item removed from cart' };
  }

  /**
   * Clear entire cart
   */
  async clearCart(sessionToken: string) {
    const cart = await this.getOrCreateCart(sessionToken);

    await this.prisma.guestCartItem.deleteMany({
      where: { guestCartId: cart.id },
    });

    return { message: 'Cart cleared' };
  }

  /**
   * Get cart with calculated totals
   */
  async getCartWithTotals(sessionToken: string) {
    const cart = await this.getOrCreateCart(sessionToken);

    let subtotal = 0;
    const items = cart.items.map((item) => {
      const price = item.variant?.price || item.product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      // Transform to match frontend Cart type expectations
      return {
        id: item.id,
        cartId: item.guestCartId, // Frontend expects cartId, not guestCartId
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        product: {
          ...item.product,
          name: item.product.name, // Ensure name is always populated
          image: item.product.images?.[0] || '', // Frontend expects single image string
          stockQuantity: item.product.stock, // Frontend expects stockQuantity
          regularPrice: item.product.price, // Add regularPrice field
          salePrice: item.product.salePrice, // Add salePrice field
        },
        variant: item.variant ? {
          ...item.variant,
          name: item.variant.nameAr || item.variant.name,
          stock: item.variant.stock,
        } : undefined,
        price,
        itemTotal,
      };
    });

    const tax = subtotal * 0.05; // 5% tax
    const shippingFee = subtotal > 200 ? 0 : 25; // Free shipping over 200 AED
    const total = subtotal + tax + shippingFee;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const coinsEarnable = Math.floor(total / 10); // 1 coin per 10 AED

    return {
      id: cart.id,
      sessionId: cart.sessionToken, // Frontend expects sessionId, not sessionToken
      items,
      summary: {
        subtotal,
        shipping: shippingFee,
        tax,
        total,
        itemCount,
        coinsEarnable,
      },
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  /**
   * Merge guest cart into user cart on login
   */
  async mergeIntoUserCart(sessionToken: string, userId: string) {
    const guestCart = await this.getOrCreateCart(sessionToken);

    if (guestCart.items.length === 0) {
      return { message: 'No items to merge' };
    }

    // Get or create user cart
    let userCart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!userCart) {
      userCart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    // Merge items
    for (const guestItem of guestCart.items) {
      const existingUserItem = await this.prisma.cartItem.findFirst({
        where: {
          cartId: userCart.id,
          productId: guestItem.productId,
          variantId: guestItem.variantId,
        },
      });

      if (existingUserItem) {
        // Update quantity (don't exceed stock)
        const product = await this.prisma.product.findUnique({
          where: { id: guestItem.productId },
          include: {
            variants: guestItem.variantId
              ? { where: { id: guestItem.variantId } }
              : false,
          },
        });

        const availableStock = guestItem.variantId
          ? product?.variants?.[0]?.stock || 0
          : product?.stock || 0;

        const newQuantity = Math.min(
          existingUserItem.quantity + guestItem.quantity,
          availableStock,
        );

        await this.prisma.cartItem.update({
          where: { id: existingUserItem.id },
          data: { quantity: newQuantity },
        });
      } else {
        // Create new item
        await this.prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: guestItem.productId,
            variantId: guestItem.variantId,
            quantity: guestItem.quantity,
          },
        });
      }
    }

    // Clear guest cart
    await this.clearCart(sessionToken);

    return { message: 'Cart merged successfully', itemsMerged: guestCart.items.length };
  }
}
