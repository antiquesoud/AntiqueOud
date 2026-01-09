import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { CoinSource } from '../wallet/dto/award-coins.dto';
import * as crypto from 'crypto';

interface BillingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  addressLine1: string;
  country?: string;
  state?: string;
  zipCode?: string;
}

interface IntentionResponse {
  clientSecret: string;
  intentionId: string;
}

@Injectable()
export class PaymentsService {
  private readonly baseUrl =
    process.env.PAYMOB_BASE_URL || 'https://uae.paymob.com';
  private readonly secretKey = process.env.PAYMOB_SECRET_KEY;
  private readonly hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  private readonly callbackUrl = process.env.PAYMOB_CALLBACK_URL;
  private readonly successUrl = process.env.PAYMOB_SUCCESS_URL;

  // Payment Method Integration IDs
  private readonly cardIntegrationId = process.env.PAYMOB_CARD_INTEGRATION_ID;
  private readonly googlePayIntegrationId = process.env.PAYMOB_GOOGLE_PAY_INTEGRATION_ID;
  private readonly applePayIntegrationId = process.env.PAYMOB_APPLE_PAY_INTEGRATION_ID;

  /**
   * Get all enabled payment method integration IDs
   * Only includes methods that have integration IDs configured
   */
  private getPaymentMethods(): number[] {
    const methods: number[] = [];

    if (this.cardIntegrationId) {
      methods.push(parseInt(this.cardIntegrationId));
    }
    if (this.googlePayIntegrationId) {
      methods.push(parseInt(this.googlePayIntegrationId));
    }
    if (this.applePayIntegrationId) {
      methods.push(parseInt(this.applePayIntegrationId));
    }

    return methods;
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  /**
   * Create payment intention using Paymob Unified Intention API
   */
  private async createIntention(
    amount: number,
    orderId: string,
    orderNumber: string,
    items: { name: string; price: number; description?: string; quantity: number }[],
    billingData: BillingData,
    locale: string = 'en',
    isGuestOrder: boolean = false,
    shippingCost: number = 0,
    discount: number = 0,
  ): Promise<IntentionResponse> {
    // Build items array - Paymob requires: amount = sum(item.amount * quantity)
    const paymobItems = items.map((item) => ({
      name: item.name,
      amount: Math.round(item.price * 100),
      description: item.description || item.name,
      quantity: item.quantity,
    }));

    // Add shipping as a line item if present
    if (shippingCost > 0) {
      paymobItems.push({
        name: 'Shipping',
        amount: Math.round(shippingCost * 100),
        description: 'Delivery fee',
        quantity: 1,
      });
    }

    // Add discount as a negative line item if present
    if (discount > 0) {
      paymobItems.push({
        name: 'Discount',
        amount: -Math.round(discount * 100),
        description: 'Order discount',
        quantity: 1,
      });
    }

    // Calculate total from items to ensure it matches
    const calculatedTotal = paymobItems.reduce(
      (sum, item) => sum + item.amount * item.quantity,
      0,
    );

    const requestBody = {
      amount: calculatedTotal, // Use calculated total to ensure match
      currency: 'AED',
      payment_methods: this.getPaymentMethods(), // Card, Google Pay, Apple Pay
      items: paymobItems,
      billing_data: {
        first_name: billingData.firstName,
        last_name: billingData.lastName,
        email: billingData.email,
        phone_number: billingData.phone,
        country: billingData.country || 'AE',
        city: billingData.city,
        street: billingData.addressLine1, // Map addressLine1 to street
        building: 'NA',
        floor: 'NA',
        apartment: 'NA',
        postal_code: billingData.zipCode || '00000',
        state: billingData.state || billingData.city,
      },
      customer: {
        first_name: billingData.firstName,
        last_name: billingData.lastName,
        email: billingData.email,
      },
      special_reference: orderNumber,
      notification_url: this.callbackUrl,
      redirection_url: `${this.successUrl}/${locale}/order-success?orderId=${orderId}`,
      extras: {
        order_id: orderId,
        order_number: orderNumber,
        is_guest_order: isGuestOrder.toString(),
      },
    };

    try {
      const paymentMethods = this.getPaymentMethods();
      console.log('[Paymob] Creating intention for order:', orderNumber);
      console.log('[Paymob] Payment methods enabled:', paymentMethods);

      const response = await fetch(`${this.baseUrl}/v1/intention/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[Paymob] Intention creation failed:', error);
        throw new Error(`Paymob API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      console.log('[Paymob] Intention created successfully:', data.id);

      return {
        clientSecret: data.client_secret,
        intentionId: data.id,
      };
    } catch (error: any) {
      console.error('[Paymob] Intention creation error:', error.message);
      throw new BadRequestException(
        `Failed to create payment intention: ${error.message}`,
      );
    }
  }

  /**
   * CREATE PAYMENT INTENT - For Authenticated Orders
   * Endpoint: POST /payments/create-intent
   */
  async createPaymentIntent(
    orderId: string,
    userId?: string,
    locale: string = 'en',
  ) {
    // Get order with correct field names
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { name: true, nameAr: true } },
          },
        },
        user: { select: { email: true, firstName: true, lastName: true } },
        address: true, // Relation name is "address", not "shippingAddress"
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Security check
    if (userId && order.userId !== userId) {
      throw new BadRequestException('Order does not belong to user');
    }

    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Order already paid');
    }

    // Create Paymob intention using order.total (correct field)
    const intention = await this.createIntention(
      order.total, // CORRECT FIELD
      order.id,
      order.orderNumber,
      order.items.map((item) => ({
        name: item.product.name,
        price: item.price,
        description: item.product.name,
        quantity: item.quantity,
      })),
      {
        // Address uses fullName, but we get firstName/lastName from User
        firstName: order.user.firstName || 'Customer',
        lastName: order.user.lastName || 'User', // Paymob requires non-empty lastName
        email: order.user.email,
        phone: order.address.phone,
        city: order.address.city,
        addressLine1: order.address.addressLine1, // CORRECT FIELD
        country: order.address.country,
        state: order.address.state,
        zipCode: order.address.zipCode,
      },
      locale,
      false, // isGuestOrder
      order.shippingFee || 0, // Pass shipping fee
      order.discount || 0, // Pass discount
    );

    // Store intention ID
    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentId: intention.intentionId },
    });

    return {
      clientSecret: intention.clientSecret,
      intentionId: intention.intentionId,
    };
  }

  /**
   * CREATE PAYMENT INTENT - For Guest Orders
   * Endpoint: POST /payments/create-intent-guest
   *
   * IMPORTANT: Guest orders use SEPARATE GuestOrder model, NOT Order
   */
  async createGuestPaymentIntent(
    orderId: string,
    sessionToken: string,
    locale: string = 'en',
  ) {
    // Use GuestOrder model (separate from Order)
    const order = await this.prisma.guestOrder.findFirst({
      where: {
        id: orderId,
        sessionToken, // Field is sessionToken (not guestSessionToken)
      },
      include: {
        items: {
          include: {
            product: { select: { name: true, nameAr: true } },
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

    // shippingAddress is JSON on GuestOrder, not a relation
    const shippingAddress = order.shippingAddress as any;

    // Create Paymob intention
    const intention = await this.createIntention(
      order.total, // CORRECT FIELD
      order.id,
      order.orderNumber,
      order.items.map((item) => ({
        name: item.product.name,
        price: item.price,
        description: item.product.name,
        quantity: item.quantity,
      })),
      {
        firstName:
          shippingAddress.firstName ||
          shippingAddress.fullName?.split(' ')[0] ||
          'Guest',
        lastName:
          shippingAddress.lastName ||
          shippingAddress.fullName?.split(' ').slice(1).join(' ') ||
          'Customer', // Paymob requires non-empty lastName
        email: order.guestEmail, // guestEmail exists on GuestOrder
        phone: order.guestPhone, // guestPhone exists on GuestOrder
        city: shippingAddress.city,
        addressLine1:
          shippingAddress.addressLine1 || shippingAddress.street || '',
        country: shippingAddress.country || 'AE',
        state: shippingAddress.state || shippingAddress.city,
        zipCode: shippingAddress.zipCode || '00000',
      },
      locale,
      true, // isGuestOrder
      order.shippingFee || 0, // Pass shipping fee
      order.discount || 0, // Pass discount
    );

    // Store intention ID on GuestOrder
    await this.prisma.guestOrder.update({
      where: { id: orderId },
      data: { paymentId: intention.intentionId },
    });

    return {
      clientSecret: intention.clientSecret,
      intentionId: intention.intentionId,
    };
  }

  /**
   * Verify HMAC signature for webhook security
   *
   * VERIFIED HMAC Field Order (20 fields, concatenated alphabetically):
   * 1. amount_cents          11. is_refunded
   * 2. created_at            12. is_standalone_payment
   * 3. currency              13. is_voided
   * 4. error_occured         14. order.id
   * 5. has_parent_transaction 15. owner
   * 6. id                    16. pending
   * 7. integration_id        17. source_data.pan
   * 8. is_3d_secure          18. source_data.sub_type
   * 9. is_auth               19. source_data.type
   * 10. is_capture           20. success
   *
   * Algorithm: SHA512 HMAC
   */
  private verifyHmac(data: any, receivedHmac: string): boolean {
    // Fields must be concatenated in this exact alphabetical order
    const hmacString = [
      data.amount_cents,
      data.created_at,
      data.currency,
      data.error_occured, // Note: typo is intentional (Paymob's spelling)
      data.has_parent_transaction,
      data.id,
      data.integration_id,
      data.is_3d_secure,
      data.is_auth,
      data.is_capture,
      data.is_refunded,
      data.is_standalone_payment,
      data.is_voided,
      data.order?.id, // Order ID (nested)
      data.owner,
      data.pending,
      data.source_data?.pan, // Card PAN (masked)
      data.source_data?.sub_type, // Card sub-type
      data.source_data?.type, // Payment type
      data.success,
    ].join('');

    const calculatedHmac = crypto
      .createHmac('sha512', this.hmacSecret)
      .update(hmacString)
      .digest('hex');

    return calculatedHmac === receivedHmac;
  }

  /**
   * Process webhook callback from Paymob
   * Endpoint: POST /payments/webhook
   */
  async processWebhook(data: any, hmac: string): Promise<{ received: true }> {
    const transactionData = data.obj;

    // Verify HMAC signature
    if (!this.verifyHmac(transactionData, hmac)) {
      console.error(
        '[Paymob] HMAC verification failed for transaction:',
        transactionData.id,
      );
      throw new UnauthorizedException('Invalid HMAC signature');
    }

    console.log('[Paymob] Webhook received, transaction:', transactionData.id);

    // Get order info from extras or special_reference
    const orderId = transactionData.order?.extras?.order_id;
    const isGuestOrder =
      transactionData.order?.extras?.is_guest_order === 'true';
    const isSuccess = transactionData.success === true;

    if (!orderId) {
      // Fallback to finding by special_reference (orderNumber)
      const orderNumber =
        transactionData.order?.merchant_order_id ||
        transactionData.special_reference;

      console.log('[Paymob] Looking up order by orderNumber:', orderNumber);

      if (isGuestOrder) {
        const guestOrder = await this.prisma.guestOrder.findFirst({
          where: { orderNumber },
        });
        if (guestOrder) {
          await this.handleGuestOrderPayment(
            guestOrder.id,
            isSuccess,
            transactionData.id?.toString(),
          );
        }
      } else {
        const order = await this.prisma.order.findFirst({
          where: { orderNumber },
        });
        if (order) {
          await this.handleOrderPayment(
            order.id,
            order.userId,
            order.coinsEarned,
            order.orderNumber,
            isSuccess,
            transactionData.id?.toString(),
          );
        }
      }
    } else {
      if (isGuestOrder) {
        await this.handleGuestOrderPayment(
          orderId,
          isSuccess,
          transactionData.id?.toString(),
        );
      } else {
        const order = await this.prisma.order.findUnique({
          where: { id: orderId },
        });
        if (order) {
          await this.handleOrderPayment(
            orderId,
            order.userId,
            order.coinsEarned,
            order.orderNumber,
            isSuccess,
            transactionData.id?.toString(),
          );
        }
      }
    }

    return { received: true };
  }

  /**
   * Handle authenticated order payment result
   */
  private async handleOrderPayment(
    orderId: string,
    userId: string,
    coinsEarned: number,
    orderNumber: string,
    isSuccess: boolean,
    transactionId?: string,
  ) {
    if (isSuccess) {
      // Update order to PAID
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          paymentId: transactionId,
          confirmedAt: new Date(),
        },
      });

      // Award coins using WalletService (RECOMMENDED approach)
      if (coinsEarned > 0 && userId) {
        try {
          await this.walletService.awardCoins(userId, {
            amount: coinsEarned,
            source: CoinSource.ORDER_PURCHASE, // REQUIRED enum
            description: `Earned from order ${orderNumber}`,
            orderId: orderId,
          });
          console.log(
            `[Paymob] Awarded ${coinsEarned} coins for order ${orderNumber}`,
          );
        } catch (error) {
          // Fallback: Direct update if WalletService fails
          console.error(
            '[Paymob] WalletService.awardCoins failed, using fallback:',
            error,
          );
          await this.prisma.user.update({
            where: { id: userId },
            data: { coinsBalance: { increment: coinsEarned } }, // CORRECT: coinsBalance
          });
        }
      }

      console.log(`[Paymob] Order ${orderNumber} marked as PAID`);
    } else {
      // Update order to FAILED
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
          paymentId: transactionId,
        },
      });

      console.log(`[Paymob] Order ${orderNumber} payment FAILED`);
    }
  }

  /**
   * Handle guest order payment result
   * NOTE: Guest orders do NOT earn coins
   */
  private async handleGuestOrderPayment(
    orderId: string,
    isSuccess: boolean,
    transactionId?: string,
  ) {
    if (isSuccess) {
      await this.prisma.guestOrder.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID', // String, not enum for GuestOrder
          paymentId: transactionId,
          confirmedAt: new Date(),
        },
      });
      // NOTE: Guest orders do NOT earn coins - no coinsEarned field exists
      console.log(`[Paymob] Guest order ${orderId} marked as PAID`);
    } else {
      await this.prisma.guestOrder.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
          paymentId: transactionId,
        },
      });
      console.log(`[Paymob] Guest order ${orderId} payment FAILED`);
    }
  }
}
