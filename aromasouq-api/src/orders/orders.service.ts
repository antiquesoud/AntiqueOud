import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { CouponsService } from '../coupons/coupons.service';
import { WalletService } from '../wallet/wallet.service';
import { CoinSource } from '../wallet/dto/award-coins.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly couponsService: CouponsService,
    private readonly walletService: WalletService,
  ) {}

  async findAll(
    userId: string,
    params?: {
      orderStatus?: OrderStatus;
      page?: number;
      limit?: number;
    },
  ) {
    const { orderStatus, page = 1, limit = 20 } = params || {};

    const where: any = { userId };
    if (orderStatus) where.orderStatus = orderStatus;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
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
          address: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
              },
            },
            variant: true,
          },
        },
        address: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.userId !== userId) {
      throw new BadRequestException('Order does not belong to user');
    }

    // Add review status for each item
    const itemsWithReviewStatus = await Promise.all(
      order.items.map(async (item) => {
        const review = await this.prisma.review.findUnique({
          where: {
            userId_productId: {
              userId,
              productId: item.productId,
            },
          },
          select: {
            id: true,
            rating: true,
            createdAt: true,
          },
        });

        return {
          ...item,
          review: review || null,
          hasReviewed: !!review,
        };
      }),
    );

    return {
      ...order,
      items: itemsWithReviewStatus,
    };
  }

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const { addressId, paymentMethod, coinsToUse = 0, couponCode } = createOrderDto;

    // Verify address belongs to user
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }

    if (address.userId !== userId) {
      throw new BadRequestException('Address does not belong to user');
    }

    // Get user's cart
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate stock availability for all cart items
    for (const item of cart.items) {
      const product = item.product;

      // Check variant stock if variant exists, otherwise check product stock
      if (item.variant) {
        if (item.variant.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}" (${item.variant.size}). Available: ${item.variant.stock}, Requested: ${item.quantity}`,
          );
        }

        if (!item.variant.isActive) {
          throw new BadRequestException(
            `Product variant "${product.name}" (${item.variant.size}) is no longer available`,
          );
        }
      } else {
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
          );
        }
      }

      // Also check if product is active
      if (!product.isActive) {
        throw new BadRequestException(
          `Product "${product.name}" is no longer available`,
        );
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems: { productId: string; variantId?: string; quantity: number; price: number }[] = [];

    for (const item of cart.items) {
      const price = item.variant?.price || item.product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId || undefined,
        quantity: item.quantity,
        price,
      });
    }

    // Validate and apply coupon if provided
    let couponDiscount = 0;
    let couponId: string | null = null;

    if (couponCode) {
      const couponValidation = await this.couponsService.validate({
        code: couponCode,
        orderAmount: subtotal,
      });

      couponDiscount = couponValidation.discountAmount;
      couponId = couponValidation.coupon.id;
    }

    // Calculate tax and shipping (simplified for MVP)
    const tax = subtotal * 0.05; // 5% tax
    const shippingFee = subtotal > 200 ? 0 : 25; // Free shipping over 200 AED

    // Handle coins usage
    let coinsDiscount = 0;
    let coinsUsed = 0;

    if (coinsToUse > 0) {
      // Get user's available coins
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
    }

      if (user.coinsBalance < coinsToUse) {
        throw new BadRequestException('Insufficient coins balance');
      }

      // 1 coin = 1 AED discount, maximum 50% of subtotal after coupon
      const maxCoinsDiscount = (subtotal - couponDiscount) * 0.5;
      coinsDiscount = Math.min(coinsToUse, maxCoinsDiscount);
      coinsUsed = Math.floor(coinsDiscount); // Round down to whole coins
    }

    // Total discount = coupon discount + coins discount
    const totalDiscount = couponDiscount + coinsDiscount;
    const total = subtotal + tax + shippingFee - totalDiscount;

    // Calculate coins to earn (1 coin per 10 AED spent)
    const coinsEarned = Math.floor(total / 10);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order with items in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId,
          paymentMethod,
          subtotal,
          tax,
          shippingFee,
          discount: totalDiscount,
          total,
          coinsUsed,
          coinsEarned,
          couponId,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          address: true,
          coupon: true,
        },
      });

      // Decrement stock and increment sales for each product/variant
      for (const item of cart.items) {
        if (item.variantId) {
          // Decrement variant stock
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { decrement: item.quantity },
            },
          });

          // Sync product stock from variants (sum of all variant stocks)
          const variants = await tx.productVariant.findMany({
            where: { productId: item.productId, isActive: true },
          });
          const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: totalStock,
              salesCount: { increment: item.quantity },
            },
          });
        } else {
          // Decrement product stock (no variant)
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              salesCount: { increment: item.quantity },
            },
          });
        }
      }

      // Update user's coins if coins were used - handled by wallet service after order creation
      // This is now done outside the transaction to maintain consistency
      if (coinsUsed > 0) {
        // Still update user.coinsBalance here for backward compatibility
        await tx.user.update({
          where: { id: userId },
          data: {
            coinsBalance: {
              decrement: coinsUsed,
            },
          },
        });
      }

      // Increment coupon usage count if coupon was used
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: {
            usageCount: {
              increment: 1,
            },
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    // Record coin spending in wallet transaction history (after order created)
    if (coinsUsed > 0) {
      try {
        await this.walletService.spendCoins(userId, {
          amount: coinsUsed,
          orderId: order.id,
          description: `Used ${coinsUsed} coins for order #${order.orderNumber}`,
        });
      } catch (error) {
        // Log error but don't fail the order
        console.error('Failed to record coin spending in wallet:', error);
      }
    }

    return order;
  }

  async updateStatus(
    orderId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const { orderStatus, trackingNumber } = updateOrderStatusDto;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Prepare update data
    const updateData: any = { orderStatus };

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    // Set timestamp fields based on status
    switch (orderStatus) {
      case OrderStatus.CONFIRMED:
        updateData.confirmedAt = new Date();
        updateData.paymentStatus = PaymentStatus.PAID;
        break;
      case OrderStatus.SHIPPED:
        updateData.shippedAt = new Date();
        break;
      case OrderStatus.DELIVERED:
        updateData.deliveredAt = new Date();
        // Award coins to user when order is delivered via wallet service
        if (order.coinsEarned > 0) {
          try {
            await this.walletService.awardCoins(order.userId, {
              amount: order.coinsEarned,
              source: CoinSource.ORDER_PURCHASE,
              description: `Earned ${order.coinsEarned} coins from order #${order.orderNumber}`,
              orderId: order.id,
            });
          } catch (error) {
            // Log error but don't fail the status update
            console.error('Failed to award coins via wallet:', error);
            // Fallback to old method
            await this.prisma.user.update({
              where: { id: order.userId },
              data: {
                coinsBalance: {
                  increment: order.coinsEarned,
                },
              },
            });
          }
        }
        break;
      case OrderStatus.CANCELLED:
        updateData.cancelledAt = new Date();
        updateData.paymentStatus = PaymentStatus.REFUNDED;
        // Refund coins if used via wallet service
        if (order.coinsUsed > 0) {
          try {
            await this.walletService.refundCoins(
              order.userId,
              order.coinsUsed,
              order.id,
              `Refund of ${order.coinsUsed} coins for cancelled order #${order.orderNumber}`,
            );
          } catch (error) {
            // Log error but don't fail the status update
            console.error('Failed to refund coins via wallet:', error);
            // Fallback to old method
            await this.prisma.user.update({
              where: { id: order.userId },
              data: {
                coinsBalance: {
                  increment: order.coinsUsed,
                },
              },
            });
          }
        }
        break;
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    return updatedOrder;
  }

  async cancel(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.userId !== userId) {
      throw new BadRequestException('Order does not belong to user');
    }

    // Can only cancel pending or confirmed orders
    if (
      order.orderStatus !== OrderStatus.PENDING &&
      order.orderStatus !== OrderStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        `Cannot cancel order with status ${order.orderStatus}`,
      );
    }

    // Use transaction to restore stock and refund coins
    return this.prisma.$transaction(async (tx) => {
      // Update order status
      const cancelledOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
          paymentStatus: PaymentStatus.REFUNDED,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          address: true,
        },
      });

      // Restore stock and decrement sales
      for (const item of cancelledOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            salesCount: { decrement: item.quantity },
          },
        });
      }

      // Refund coins if used
      if (cancelledOrder.coinsUsed > 0) {
        await tx.user.update({
          where: { id: userId },
          data: {
            coinsBalance: { increment: cancelledOrder.coinsUsed },
          },
        });
      }

      // Deduct awarded coins (if user still has them)
      if (cancelledOrder.coinsEarned > 0) {
        const user = await tx.user.findUnique({
          where: { id: userId },
        });

        // Only deduct if user has enough coins
        if (user && user.coinsBalance >= cancelledOrder.coinsEarned) {
          await tx.user.update({
            where: { id: userId },
            data: {
              coinsBalance: { decrement: cancelledOrder.coinsEarned },
            },
          });
        }
      }

      return cancelledOrder;
    });
  }

  /**
   * Track an order using order number and email/phone
   * Works for both registered users and guests
   */
  async trackOrder(orderNumber: string, email: string) {
    // First try to find a registered user order
    const userOrder = await this.prisma.order.findFirst({
      where: {
        orderNumber,
        user: {
          email: {
            equals: email,
            mode: 'insensitive',
          },
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
        address: true,
      },
    });

    if (userOrder) {
      return {
        type: 'user',
        order: userOrder,
      };
    }

    // If not found, try to find a guest order
    const guestOrder = await this.prisma.guestOrder.findFirst({
      where: {
        orderNumber,
        guestEmail: {
          equals: email,
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

    if (guestOrder) {
      return {
        type: 'guest',
        order: guestOrder,
      };
    }

    throw new NotFoundException(
      'Order not found. Please check your order number and email address.',
    );
  }
}
