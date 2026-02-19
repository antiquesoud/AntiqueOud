import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GuestCartService } from '../guest-cart/guest-cart.service';
import { CreateGuestOrderDto } from './dto/create-guest-order.dto';

@Injectable()
export class GuestOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly guestCartService: GuestCartService,
  ) {}

  /**
   * Create a guest order from cart
   */
  async create(sessionToken: string, createOrderDto: CreateGuestOrderDto) {
    const { guestEmail, guestPhone, shippingAddress, paymentMethod } = createOrderDto;

    // Get guest cart with fresh product data
    const cart = await this.guestCartService.getCartWithTotals(sessionToken);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate and filter cart items - auto-remove unavailable items
    const removedItems: string[] = [];
    const validItems: typeof cart.items = [];

    for (const item of cart.items) {
      const product = item.product;
      const availableStock = item.variant?.stock || product.stockQuantity;
      let isValid = true;
      let reason = '';

      // Check if product is active
      if (!product.isActive) {
        isValid = false;
        reason = `"${product.name}" is no longer available`;
      }
      // Check stock
      else if (availableStock < item.quantity) {
        isValid = false;
        reason = `"${product.name}" - insufficient stock`;
      }

      if (isValid) {
        validItems.push(item);
      } else {
        removedItems.push(reason);
        // Auto-remove from cart
        await this.prisma.guestCartItem.delete({ where: { id: item.id } });
      }
    }

    // If all items were removed, throw error with details
    if (validItems.length === 0) {
      throw new BadRequestException({
        message: 'All items in your cart are unavailable',
        removedItems,
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Recalculate totals using validItems only (with fresh prices)
    let subtotal = 0;
    const orderItems = validItems.map((item) => {
      // Use current price from product (fresh from DB)
      const price = item.variant?.salePrice || item.variant?.price || item.product.salePrice || item.product.regularPrice || item.price;
      subtotal += price * item.quantity;

      return {
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        productNameAr: item.product.nameAr || null,
        variantName: item.variant?.name || null,
        variantNameAr: item.variant?.nameAr || null,
        quantity: item.quantity,
        price,
      };
    });

    // Recalculate tax and total
    const tax = subtotal * 0.05; // 5% tax
    const shippingFee = cart.summary.shipping; // Keep original shipping
    const total = subtotal + tax + shippingFee;

    // Create order with items in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create guest order
      const newOrder = await tx.guestOrder.create({
        data: {
          orderNumber,
          sessionToken,
          guestEmail,
          guestPhone,
          shippingAddress: shippingAddress as any, // Type cast for JSON field
          paymentMethod,
          subtotal,
          tax,
          shippingFee,
          discount: 0, // Guest orders don't support coupons for now
          total,
          orderStatus: 'PENDING',
          paymentStatus: 'PENDING',
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  nameAr: true,
                  images: true,
                },
              },
            },
          },
        },
      });

      // Decrement stock and increment sales for each product
      for (const item of validItems) {
        if (item.variantId) {
          // Update variant stock
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { decrement: item.quantity },
            },
          });
        }

        // Update product stock and sales
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            salesCount: { increment: item.quantity },
          },
        });
      }

      return newOrder;
    });

    // Clear guest cart after successful order
    await this.guestCartService.clearCart(sessionToken);

    // Return order with any removed items warning
    return {
      ...order,
      removedItems: removedItems.length > 0 ? removedItems : undefined,
    };
  }

  /**
   * Get guest order by ID (with email verification)
   */
  async findOne(orderId: string, guestEmail: string) {
    const order = await this.prisma.guestOrder.findFirst({
      where: {
        id: orderId,
        guestEmail: {
          equals: guestEmail,
          mode: 'insensitive',
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                nameAr: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Get all orders for a guest email
   */
  async findByEmail(guestEmail: string) {
    const orders = await this.prisma.guestOrder.findMany({
      where: {
        guestEmail: {
          equals: guestEmail,
          mode: 'insensitive',
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                nameAr: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders;
  }

  /**
   * Cancel a guest order
   * Only allowed for PENDING or CONFIRMED orders
   */
  async cancel(orderId: string, guestEmail: string) {
    const order = await this.prisma.guestOrder.findFirst({
      where: {
        id: orderId,
        guestEmail: {
          equals: guestEmail,
          mode: 'insensitive',
        },
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Can only cancel pending or confirmed orders
    if (order.orderStatus !== 'PENDING' && order.orderStatus !== 'CONFIRMED') {
      throw new BadRequestException(
        `Cannot cancel order with status ${order.orderStatus}`,
      );
    }

    // Use transaction to restore stock
    return this.prisma.$transaction(async (tx) => {
      // Update order status
      const cancelledOrder = await tx.guestOrder.update({
        where: { id: orderId },
        data: {
          orderStatus: 'CANCELLED',
          cancelledAt: new Date(),
          paymentStatus: 'REFUNDED',
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Restore stock and decrement sales
      for (const item of cancelledOrder.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { increment: item.quantity },
            },
          });
        }

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            salesCount: { decrement: item.quantity },
          },
        });
      }

      return cancelledOrder;
    });
  }
}
