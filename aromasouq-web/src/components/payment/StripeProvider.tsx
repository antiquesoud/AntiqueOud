"use client";

import { ReactNode, useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe, stripeAppearance } from '@/lib/stripe';

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const [stripePromise] = useState(() => getStripe());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!clientSecret) {
      console.error('[StripeProvider] No clientSecret provided');
      setIsLoading(false);
      return;
    }

    console.log('[StripeProvider] Initializing with clientSecret:', clientSecret?.substring(0, 20) + '...');

    stripePromise.then((stripe) => {
      if (stripe) {
        console.log('[StripeProvider] Stripe loaded successfully');
        setIsLoading(false);
      } else {
        console.error('[StripeProvider] Failed to load Stripe');
        setIsLoading(false);
      }
    }).catch((err) => {
      console.error('[StripeProvider] Error loading Stripe:', err);
      setIsLoading(false);
    });
  }, [clientSecret, stripePromise]);

  if (!clientSecret) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-700">
          Payment initialization failed: No client secret
        </p>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: stripeAppearance,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="inline-block w-8 h-8 border-4 border-oud-gold border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-600">Loading payment form...</p>
        </div>
      ) : (
        children
      )}
    </Elements>
  );
}
