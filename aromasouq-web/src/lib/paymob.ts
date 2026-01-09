/**
 * Paymob UAE Payment Integration
 *
 * Strategy: Use Hosted Checkout (redirect) as primary method
 * The embedded Pixel SDK has timing issues with ES modules
 */

const PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYMOB_PUBLIC_KEY || '';
const CHECKOUT_URL = process.env.NEXT_PUBLIC_PAYMOB_CHECKOUT_URL || 'https://uae.paymob.com/unifiedcheckout';

/**
 * Redirect to Paymob Hosted Checkout
 * This is the most reliable method - Paymob handles the entire payment UI
 */
export const redirectToHostedCheckout = (clientSecret: string, locale: string = 'en'): void => {
  if (!PUBLIC_KEY) {
    console.error('[Paymob] PUBLIC_KEY not configured');
    throw new Error('Payment configuration error');
  }

  if (!clientSecret) {
    console.error('[Paymob] clientSecret is required');
    throw new Error('Payment session error');
  }

  // Build hosted checkout URL with locale
  const url = new URL(CHECKOUT_URL);
  url.searchParams.set('publicKey', PUBLIC_KEY);
  url.searchParams.set('clientSecret', clientSecret);

  console.log('[Paymob] Redirecting to hosted checkout...');
  window.location.href = url.toString();
};

/**
 * Build the hosted checkout URL without redirecting
 * Useful for opening in iframe or new window
 */
export const getHostedCheckoutUrl = (clientSecret: string): string => {
  if (!PUBLIC_KEY) {
    throw new Error('Payment configuration error');
  }

  const url = new URL(CHECKOUT_URL);
  url.searchParams.set('publicKey', PUBLIC_KEY);
  url.searchParams.set('clientSecret', clientSecret);

  return url.toString();
};

/**
 * Get Paymob public key (for debugging)
 */
export const getPublicKey = (): string => {
  return PUBLIC_KEY;
};

/**
 * Check if Paymob is configured
 */
export const isPaymobConfigured = (): boolean => {
  return Boolean(PUBLIC_KEY);
};
