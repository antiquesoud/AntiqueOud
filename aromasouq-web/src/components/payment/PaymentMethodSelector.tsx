"use client";

import { CreditCard, Banknote } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PaymentMethodSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({ value, onChange, disabled = false }: PaymentMethodSelectorProps) {
  return (
    <RadioGroup value={value} onValueChange={onChange} disabled={disabled}>
      <div className="space-y-3">
        <Label
          htmlFor="card"
          className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
            value === 'card'
              ? 'border-oud-gold bg-oud-gold/5 ring-2 ring-oud-gold/20'
              : 'border-gray-200 hover:border-oud-gold/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <RadioGroupItem value="card" id="card" className="mt-0.5" />
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-gray-100">
              <CreditCard className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Card Payment</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Pay securely with credit or debit card
              </p>
            </div>
          </div>
        </Label>

        <Label
          htmlFor="cod"
          className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
            value === 'cod'
              ? 'border-oud-gold bg-oud-gold/5 ring-2 ring-oud-gold/20'
              : 'border-gray-200 hover:border-oud-gold/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <RadioGroupItem value="cod" id="cod" className="mt-0.5" />
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-gray-100">
              <Banknote className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Cash on Delivery</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Pay with cash when you receive your order
              </p>
            </div>
          </div>
        </Label>
      </div>
    </RadioGroup>
  );
}
