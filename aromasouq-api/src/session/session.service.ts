import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { randomBytes } from 'crypto';

@Injectable()
export class SessionService {
  /**
   * Generate a unique guest session token
   * Format: guest_{timestamp}_{randomHex}
   * Must match DB constraint: ^guest_[0-9]+_[a-f0-9]+$
   */
  generateGuestSession(): string {
    const timestamp = Date.now();
    // Generate 13 random hex characters (matching original length)
    const randomHex = randomBytes(7).toString('hex').substring(0, 13);
    return `guest_${timestamp}_${randomHex}`;
  }

  /**
   * Set guest session cookie
   * Expires in 30 days
   */
  setGuestSessionCookie(res: Response, sessionToken: string): void {
    const isProduction = process.env.NODE_ENV === 'production';
    const frontendUrl = process.env.FRONTEND_URL || '';
    const isLocalhostFrontend = frontendUrl.includes('localhost');

    // For cross-origin requests (prod), we need sameSite: 'none' and secure: true
    // For localhost, use 'lax' which works without secure in dev
    const isCrossOrigin = isProduction && !isLocalhostFrontend;

    res.cookie('guest_session', sessionToken, {
      httpOnly: true,
      secure: isCrossOrigin, // Must be true when sameSite is 'none'
      sameSite: isCrossOrigin ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
    });
  }

  /**
   * Get guest session from cookie
   */
  getGuestSession(cookies: any): string | null {
    return cookies?.guest_session || null;
  }

  /**
   * Clear guest session cookie
   */
  clearGuestSession(res: Response): void {
    const isProduction = process.env.NODE_ENV === 'production';
    const frontendUrl = process.env.FRONTEND_URL || '';
    const isLocalhostFrontend = frontendUrl.includes('localhost');
    const isCrossOrigin = isProduction && !isLocalhostFrontend;

    res.clearCookie('guest_session', {
      httpOnly: true,
      secure: isCrossOrigin,
      sameSite: isCrossOrigin ? 'none' : 'lax',
      path: '/',
    });
  }

  /**
   * Get or create guest session
   * If guest_session cookie exists, return it
   * Otherwise generate new session and set cookie
   */
  getOrCreateGuestSession(cookies: any, res: Response): string {
    let sessionToken = this.getGuestSession(cookies);

    if (!sessionToken) {
      sessionToken = this.generateGuestSession();
      this.setGuestSessionCookie(res, sessionToken);
    }

    return sessionToken;
  }

  /**
   * Validate guest session format
   * Must match DB constraint: ^guest_[0-9]+_[a-f0-9]+$
   */
  isValidGuestSession(sessionToken: string): boolean {
    return /^guest_\d+_[a-f0-9]+$/.test(sessionToken);
  }
}
