import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private readonly prisma: PrismaService) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-10-28.acacia' as any,
      typescript: true,
    });
  }

  /**
   * CREATE PAYMENT INTENT - For Authenticated Orders
   */
  async createPaymentIntent(orderId: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
        user: { select: { email: true, firstName: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Security check
    if (userId && order.userId !== userId) {
      throw new BadRequestException('Order does not belong to user');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order already paid');
    }

    // If payment intent exists and is still valid, return it
    if (order.paymentId) {
      try {
        const existingIntent = await this.stripe.paymentIntents.retrieve(order.paymentId);
        if (existingIntent.status === 'requires_payment_method' || existingIntent.status === 'requires_confirmation') {
          return {
            clientSecret: existingIntent.client_secret,
            paymentIntentId: existingIntent.id,
          };
        }
      } catch (err) {
        // Payment intent doesn't exist or is invalid, create new one
      }
    }

    // Create new payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // AED to fils
      currency: 'aed',
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        customerEmail: order.user.email,
        isGuestOrder: 'false',
      },
      description: `Order #${order.orderNumber} - ${order.items.length} item(s)`,
      receipt_email: order.user.email,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent ID
    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentId: paymentIntent.id },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * CREATE PAYMENT INTENT - For Guest Orders
   */
  async createGuestPaymentIntent(orderId: string, sessionToken: string) {
    const order = await this.prisma.guestOrder.findFirst({
      where: {
        id: orderId,
        sessionToken,
      },
      include: {
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Guest order not found');
    }

    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Order already paid');
    }

    // If payment intent exists and is still valid, return it
    if (order.paymentId) {
      try {
        const existingIntent = await this.stripe.paymentIntents.retrieve(order.paymentId);
        if (existingIntent.status === 'requires_payment_method' || existingIntent.status === 'requires_confirmation') {
          return {
            clientSecret: existingIntent.client_secret,
            paymentIntentId: existingIntent.id,
          };
        }
      } catch (err) {
        // Create new one
      }
    }

    // Create new payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: 'aed',
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        guestEmail: order.guestEmail,
        isGuestOrder: 'true',
      },
      description: `Guest Order #${order.orderNumber} - ${order.items.length} item(s)`,
      receipt_email: order.guestEmail,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent ID
    await this.prisma.guestOrder.update({
      where: { id: orderId },
      data: { paymentId: paymentIntent.id },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * CONFIRM PAYMENT - After Stripe processes payment
   */
  async confirmPayment(paymentIntentId: string) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException(`Payment not successful. Status: ${paymentIntent.status}`);
    }

    const { orderId, isGuestOrder } = paymentIntent.metadata;

    if (isGuestOrder === 'true') {
      const order = await this.prisma.guestOrder.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          paymentId: paymentIntentId,
        },
      });

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        isGuestOrder: true,
      };
    } else {
      const order = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          paymentId: paymentIntentId,
          confirmedAt: new Date(),
        },
      });

      // Award coins for successful payment
      if (order.coinsEarned && order.coinsEarned > 0 && order.userId) {
        await this.prisma.user.update({
          where: { id: order.userId },
          data: {
            coinsBalance: { increment: order.coinsEarned },
          },
        });
      }

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        isGuestOrder: false,
      };
    }
  }

  /**
   * HANDLE STRIPE WEBHOOKS
   */
  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const succeededIntent = event.data.object as Stripe.PaymentIntent;
        await this.confirmPayment(succeededIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        const { orderId: failedOrderId, isGuestOrder: isFailedGuest } = failedIntent.metadata;

        if (isFailedGuest === 'true') {
          await this.prisma.guestOrder.update({
            where: { id: failedOrderId },
            data: { paymentStatus: 'FAILED' },
          });
        } else {
          await this.prisma.order.update({
            where: { id: failedOrderId },
            data: { paymentStatus: PaymentStatus.FAILED },
          });
        }
        break;
    }

    return { received: true };
  }
}
