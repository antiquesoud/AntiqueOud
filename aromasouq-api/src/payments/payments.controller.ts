import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Headers,
  RawBodyRequest,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionService } from '../session/session.service';
import Stripe from 'stripe';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Create Payment Intent - Authenticated Users
   */
  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  async createIntent(@Req() req: Request, @Body() body: { orderId: string }) {
    const userId = req.user!['sub'];
    return this.paymentsService.createPaymentIntent(body.orderId, userId);
  }

  /**
   * Create Payment Intent - Guest Orders
   */
  @Post('create-intent-guest')
  async createIntentGuest(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { orderId: string },
  ) {
    const sessionToken = this.sessionService.getOrCreateGuestSession(req.cookies, res);
    if (!sessionToken) {
      throw new UnauthorizedException('Session token required');
    }
    return this.paymentsService.createGuestPaymentIntent(body.orderId, sessionToken);
  }

  /**
   * Confirm Payment Success
   */
  @Post('confirm')
  async confirmPayment(@Body() body: { paymentIntentId: string }) {
    return this.paymentsService.confirmPayment(body.paymentIntentId);
  }

  /**
   * Stripe Webhook Handler
   */
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new UnauthorizedException('Missing stripe-signature header');
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err: any) {
      throw new UnauthorizedException(`Webhook Error: ${err.message}`);
    }

    return this.paymentsService.handleWebhook(event);
  }
}
