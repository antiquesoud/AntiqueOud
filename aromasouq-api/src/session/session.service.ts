import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { randomBytes } from 'crypto';

// Helper to get cookie settings based on request context
function getCookieSettings(req?: Request): { secure: boolean; sameSite: 'lax' | 'none' | 'strict' } {
  // If no request, check environment variables
  const origin = req?.headers?.origin || req?.headers?.referer || '';
  const host = req?.headers?.host || '';

  // Check if request is from localhost
  const isLocalhostOrigin = origin.includes('localhost') || origin.includes('127.0.0.1');
  const isLocalhostHost = host.includes('localhost') || host.includes('127.0.0.1');

  // Check if it's production
  const isProduction = process.env.NODE_ENV === 'production' ||
                       !!process.env.RAILWAY_ENVIRONMENT ||
                       origin.includes('antiqueoud.com');

  // Cross-origin requires SameSite=None and Secure
  const isCrossOrigin = !isLocalhostOrigin || !isLocalhostHost;

  // In production or cross-origin, always use secure + sameSite none
  const needsCrossOriginCookies = isProduction || isCrossOrigin;

  return {
    secure: needsCrossOriginCookies,
    sameSite: needsCrossOriginCookies ? 'none' : 'lax',
  };
}

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
  setGuestSessionCookie(res: Response, sessionToken: string, req?: Request): void {
    const cookieSettings = getCookieSettings(req);

    res.cookie('guest_session', sessionToken, {
      httpOnly: true,
      secure: cookieSettings.secure,
      sameSite: cookieSettings.sameSite,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
    });
  }

  /**
   * Get guest session from header (X-Guest-Session) or cookie
   * Header takes priority for cross-origin support
   */
  getGuestSessionFromRequest(req: Request): string | null {
    // First try X-Guest-Session header (works cross-origin)
    const headerSession = req.headers['x-guest-session'] as string | undefined;
    if (headerSession && this.isValidGuestSession(headerSession)) {
      return headerSession;
    }

    // Fallback to cookie (for same-origin or backward compatibility)
    const cookieSession = req.cookies?.guest_session;
    if (cookieSession && this.isValidGuestSession(cookieSession)) {
      return cookieSession;
    }

    return null;
  }

  /**
   * Get guest session from cookie only (legacy method)
   */
  getGuestSession(cookies: any): string | null {
    return cookies?.guest_session || null;
  }

  /**
   * Clear guest session cookie
   */
  clearGuestSession(res: Response, req?: Request): void {
    const cookieSettings = getCookieSettings(req);

    res.clearCookie('guest_session', {
      httpOnly: true,
      secure: cookieSettings.secure,
      sameSite: cookieSettings.sameSite,
      path: '/',
    });
  }

  /**
   * Get or create guest session
   * Checks header first, then cookie, then creates new session
   * Returns object with session token and whether it was newly created
   */
  getOrCreateGuestSessionFromRequest(req: Request, res: Response): { sessionToken: string; isNew: boolean } {
    // Try to get existing session from header or cookie
    let sessionToken = this.getGuestSessionFromRequest(req);
    let isNew = false;

    // If no valid session, create a new one
    if (!sessionToken) {
      sessionToken = this.generateGuestSession();
      this.setGuestSessionCookie(res, sessionToken, req);
      isNew = true;
    }

    return { sessionToken, isNew };
  }

  /**
   * Legacy method - Get or create guest session (cookie-based)
   * Kept for backward compatibility
   */
  getOrCreateGuestSession(cookies: any, res: Response, req?: Request): string {
    let sessionToken = this.getGuestSession(cookies);

    // Validate existing token - if invalid or missing, regenerate
    if (!sessionToken || !this.isValidGuestSession(sessionToken)) {
      sessionToken = this.generateGuestSession();
      this.setGuestSessionCookie(res, sessionToken, req);
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
