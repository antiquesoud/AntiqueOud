'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, CreditCard, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { redirectToHostedCheckout, isPaymobConfigured } from '@/lib/paymob';
import { formatCurrency } from '@/lib/utils';

interface PaymobCheckoutProps {
  clientSecret: string;
  orderId: string;
  total: number;
  isGuestOrder?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymobCheckout({
  clientSecret,
  orderId,
  total,
  isGuestOrder = false,
  onSuccess,
  onCancel,
}: PaymobCheckoutProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check configuration on mount
  useEffect(() => {
    if (!isPaymobConfigured()) {
      setError('Payment system is not configured. Please contact support.');
    }
  }, []);

  // Handle payment button click - redirect to Paymob hosted checkout
  const handlePayment = useCallback(() => {
    try {
      setIsRedirecting(true);
      setError(null);
      redirectToHostedCheckout(clientSecret);
    } catch (err: any) {
      console.error('[PaymobCheckout] Redirect failed:', err);
      setError(err.message || 'Failed to start payment');
      setIsRedirecting(false);
    }
  }, [clientSecret]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Complete Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Order Total:</span>
            <span className="text-2xl font-bold text-oud-gold">
              {formatCurrency(total)}
            </span>
          </div>
          {isGuestOrder && (
            <p className="text-xs text-muted-foreground mt-2">
              Order ID: {orderId}
            </p>
          )}
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Secure Payment</p>
              <p className="text-sm text-blue-700 mt-1">
                You will be redirected to Paymob&apos;s secure payment page to complete your purchase.
                Your card details are never stored on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Accepted Payment Methods */}
        <div className="flex items-center justify-center gap-4 py-2">
          <img src="/images/visa.svg" alt="Visa" className="h-8" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          <img src="/images/mastercard.svg" alt="Mastercard" className="h-8" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          <span className="text-sm text-muted-foreground">Visa & Mastercard accepted</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isRedirecting}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-oud-burgundy hover:bg-oud-burgundy/90"
            onClick={handlePayment}
            disabled={isRedirecting || Boolean(error)}
          >
            {isRedirecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Pay {formatCurrency(total)}
              </>
            )}
          </Button>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Secured by Paymob - PCI DSS Compliant</span>
        </div>
      </CardContent>
    </Card>
  );
}
