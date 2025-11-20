"use client";

import { PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, CreditCard } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';
import { formatCurrency } from '@/lib/utils';

interface StripeCardFormProps {
  orderId: string;
  total: number;
  isGuestOrder?: boolean;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function StripeCardForm({
  orderId,
  total,
  isGuestOrder = false,
  onSuccess,
  onCancel,
}: StripeCardFormProps) {
  const { processPayment, isProcessing } = usePayment({
    orderId,
    isGuestOrder,
    onSuccess,
  });

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-oud-gold" />
          Complete Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Lock className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-700">
            Secured by Stripe • Your payment information is encrypted
          </p>
        </div>

        <div className="space-y-4">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total to Pay:</span>
            <span className="text-2xl font-bold text-oud-gold">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            className="flex-1"
            onClick={processPayment}
            disabled={isProcessing}
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              `Pay ${formatCurrency(total)}`
            )}
          </Button>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            Powered by Stripe
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
