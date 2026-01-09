import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Query,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionService } from '../session/session.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly sessionService: SessionService, // REQUIRED for guest sessions
  ) {}

  /**
   * Create Payment Intent - Authenticated Users
   * Endpoint: POST /payments/create-intent (MATCHES CURRENT STRIPE ENDPOINT)
   *
   * @param body.orderId - The order ID
   * @param body.paymentMethod - Optional: 'card' | 'google_pay' | 'apple_pay' (defaults to all methods)
   */
  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  async createIntent(
    @Req() req: Request,
    @Body() body: { orderId: string; paymentMethod?: 'card' | 'google_pay' | 'apple_pay' },
    @Query('locale') locale: string = 'en',
  ) {
    const userId = req.user!['sub']; // Get userId from JWT
    return this.paymentsService.createPaymentIntent(body.orderId, userId, locale, body.paymentMethod);
  }

  /**
   * Create Payment Intent - Guest Orders
   * Endpoint: POST /payments/create-intent-guest (MATCHES CURRENT STRIPE ENDPOINT)
   *
   * IMPORTANT: Uses SessionService to get sessionToken from cookies
   * NOT from request body!
   *
   * @param body.orderId - The order ID
   * @param body.paymentMethod - Optional: 'card' | 'google_pay' | 'apple_pay' (defaults to all methods)
   */
  @Post('create-intent-guest')
  async createIntentGuest(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { orderId: string; paymentMethod?: 'card' | 'google_pay' | 'apple_pay' },
    @Query('locale') locale: string = 'en',
  ) {
    // Get session token from cookies via SessionService
    const sessionToken = this.sessionService.getOrCreateGuestSession(
      req.cookies,
      res,
    );
    if (!sessionToken) {
      throw new UnauthorizedException('Session token required');
    }
    return this.paymentsService.createGuestPaymentIntent(
      body.orderId,
      sessionToken,
      locale,
      body.paymentMethod,
    );
  }

  /**
   * Paymob Webhook Handler
   * Endpoint: POST /payments/webhook
   *
   * Paymob sends transaction data with HMAC signature in query param
   */
  @Post('webhook')
  async handleWebhook(@Body() data: any, @Query('hmac') hmac: string) {
    if (!hmac) {
      throw new UnauthorizedException('Missing HMAC signature');
    }
    return this.paymentsService.processWebhook(data, hmac);
  }
}
