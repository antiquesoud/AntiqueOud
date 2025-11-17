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

    // Get guest cart
    const cart = await this.guestCartService.getCartWithTotals(sessionToken);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate stock availability for all cart items
    for (const item of cart.items) {
      const product = item.product;
      const availableStock = item.variant?.stock || product.stock;

      if (availableStock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}". Available: ${availableStock}, Requested: ${item.quantity}`,
        );
      }

      if (!product.isActive) {
        throw new BadRequestException(
          `Product "${product.name}" is no longer available`,
        );
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order with items in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Prepare order items
      const orderItems = cart.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        productNameAr: item.product.nameAr || null,
        variantName: item.variant?.name || null,
        variantNameAr: item.variant?.nameAr || null,
        quantity: item.quantity,
        price: item.price,
      }));

      // Create guest order
      const newOrder = await tx.guestOrder.create({
        data: {
          orderNumber,
          sessionToken,
          guestEmail,
          guestPhone,
          shippingAddress: shippingAddress as any, // Type cast for JSON field
          paymentMethod,
          subtotal: cart.subtotal,
          tax: cart.tax,
          shippingFee: cart.shippingFee,
          discount: 0, // Guest orders don't support coupons for now
          total: cart.total,
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
      for (const item of cart.items) {
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

    return order;
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
