import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
    console.log('[Stripe] Initializing Stripe with key:', key?.substring(0, 20) + '...');

    if (!key) {
      console.error('[Stripe] NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined');
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined');
    }

    stripePromise = loadStripe(key).then((stripe) => {
      if (stripe) {
        console.log('[Stripe] Stripe.js loaded successfully');
      } else {
        console.error('[Stripe] Failed to load Stripe.js');
      }
      return stripe;
    });
  }
  return stripePromise;
};

export const stripeAppearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#B3967D', // oud-gold
    colorBackground: '#ffffff',
    colorText: '#1e293b',
    colorDanger: '#ef4444',
    fontFamily: 'Inter, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
};
