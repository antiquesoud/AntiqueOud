import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { redirectToHostedCheckout } from '@/lib/paymob';
import toast from 'react-hot-toast';

interface PaymentIntentResponse {
  clientSecret: string;
  intentionId: string;
}

interface UsePaymentOptions {
  orderId: string;
  isGuestOrder?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UsePaymentReturn {
  clientSecret: string | null;
  intentionId: string | null;
  isLoading: boolean;
  error: string | null;
  createPaymentIntent: () => Promise<PaymentIntentResponse | null>;
  redirectToPayment: () => void;
  reset: () => void;
}

/**
 * Hook for managing Paymob payment flow
 *
 * Usage:
 * 1. Call createPaymentIntent() to get clientSecret
 * 2. Pass clientSecret to PaymobCheckout component
 * 3. Or use redirectToPayment() for hosted checkout fallback
 */
export function usePayment({
  orderId,
  isGuestOrder = false,
  onSuccess,
  onError,
}: UsePaymentOptions): UsePaymentReturn {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentionId, setIntentionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a payment intent with Paymob
   * Returns clientSecret for use with Pixel SDK
   */
  const createPaymentIntent = useCallback(async (): Promise<PaymentIntentResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[usePayment] Creating payment intent for order:', orderId);

      const endpoint = isGuestOrder
        ? '/payments/create-intent-guest'
        : '/payments/create-intent';

      const response = await apiClient.post<PaymentIntentResponse>(endpoint, {
        orderId,
      });

      console.log('[usePayment] Payment intent created:', response.intentionId);

      setClientSecret(response.clientSecret);
      setIntentionId(response.intentionId);

      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to initialize payment';
      console.error('[usePayment] Error creating payment intent:', errorMsg);

      setError(errorMsg);
      toast.error(errorMsg);
      onError?.(errorMsg);

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [orderId, isGuestOrder, onError]);

  /**
   * Redirect to Paymob hosted checkout
   * Use this as fallback if embedded SDK doesn't work
   */
  const redirectToPayment = useCallback(() => {
    if (!clientSecret) {
      toast.error('Payment not initialized. Please try again.');
      return;
    }

    console.log('[usePayment] Redirecting to hosted checkout');
    redirectToHostedCheckout(clientSecret);
  }, [clientSecret]);

  /**
   * Reset payment state
   */
  const reset = useCallback(() => {
    setClientSecret(null);
    setIntentionId(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    clientSecret,
    intentionId,
    isLoading,
    error,
    createPaymentIntent,
    redirectToPayment,
    reset,
  };
}

/**
 * Simple hook for just creating payment intents
 * Without the full state management
 */
export function useCreatePaymentIntent() {
  const [isLoading, setIsLoading] = useState(false);

  const createIntent = useCallback(
    async (orderId: string, isGuestOrder: boolean = false) => {
      setIsLoading(true);

      try {
        const endpoint = isGuestOrder
          ? '/payments/create-intent-guest'
          : '/payments/create-intent';

        const response = await apiClient.post<PaymentIntentResponse>(endpoint, {
          orderId,
        });

        return response;
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to create payment intent';
        toast.error(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    createIntent,
    isLoading,
  };
}
