import { useState } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

interface UsePaymentOptions {
  orderId: string;
  isGuestOrder?: boolean;
  onSuccess: () => void;
  onError?: (error: string) => void;
}

export function usePayment({ orderId, isGuestOrder = false, onSuccess, onError }: UsePaymentOptions) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const createPaymentIntent = async () => {
    try {
      const endpoint = isGuestOrder ? '/payments/create-intent-guest' : '/payments/create-intent';
      const response = await apiClient.post<{ clientSecret: string; paymentIntentId: string }>(
        endpoint,
        { orderId }
      );

      setClientSecret(response.clientSecret);
      return response.clientSecret;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to initialize payment';
      toast.error(errorMsg);
      onError?.(errorMsg);
      throw err;
    }
  };

  const processPayment = async () => {
    if (!stripe || !elements) {
      toast.error('Payment system not ready');
      return false;
    }

    setIsProcessing(true);

    try {
      // Step 1: Submit the payment elements for validation
      console.log('[Payment] Submitting payment elements...');
      const { error: submitError } = await elements.submit();

      if (submitError) {
        console.error('[Payment] Element submission failed:', submitError);
        toast.error(submitError.message || 'Please check your payment details');
        onError?.(submitError.message || 'Validation failed');
        return false;
      }

      console.log('[Payment] Elements submitted successfully');

      // Step 2: Get or create payment intent
      const secret = clientSecret || await createPaymentIntent();
      console.log('[Payment] Confirming payment...');

      // Step 3: Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: secret,
        confirmParams: {
          return_url: `${window.location.origin}/order-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('[Payment] Payment confirmation failed:', error);
        toast.error(error.message || 'Payment failed');
        onError?.(error.message || 'Payment failed');
        return false;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('[Payment] Payment succeeded:', paymentIntent.id);

        await apiClient.post('/payments/confirm', {
          paymentIntentId: paymentIntent.id,
        });

        toast.success('Payment successful!');
        onSuccess();
        return true;
      }

      console.warn('[Payment] Payment not completed, status:', paymentIntent?.status);
      return false;
    } catch (err: any) {
      console.error('[Payment] Payment processing error:', err);
      const errorMsg = err.response?.data?.message || 'Payment processing failed';
      toast.error(errorMsg);
      onError?.(errorMsg);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    createPaymentIntent,
    isProcessing,
    clientSecret,
  };
}
