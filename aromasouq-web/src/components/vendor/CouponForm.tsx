'use client';

import { useState, useEffect } from 'react';
import { Coupon, CreateCouponDto, DiscountType } from '@/types/coupon';
import { Ticket, Percent, DollarSign, Calendar, Users, X } from 'lucide-react';

interface CouponFormProps {
  initialData?: Coupon | null;
  onSubmit: (data: CreateCouponDto) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CouponForm({ initialData, onSubmit, onCancel, isSubmitting = false }: CouponFormProps) {
  const [formData, setFormData] = useState<any>({
    code: '',
    discountType: DiscountType.PERCENTAGE,
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code,
        discountType: initialData.discountType,
        discountValue: initialData.discountValue?.toString() || '',
        minOrderAmount: initialData.minOrderAmount?.toString() || '',
        maxDiscount: initialData.maxDiscount?.toString() || '',
        usageLimit: initialData.usageLimit?.toString() || '',
        startDate: initialData.startDate.split('T')[0],
        endDate: initialData.endDate.split('T')[0],
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required';
    } else if (!/^[A-Z0-9_-]+$/.test(formData.code)) {
      newErrors.code = 'Code must contain only uppercase letters, numbers, hyphens, and underscores';
    }

    const discountValue = parseFloat(formData.discountValue);
    if (!formData.discountValue || discountValue <= 0) {
      newErrors.discountValue = 'Discount value must be greater than 0';
    }

    if (formData.discountType === DiscountType.PERCENTAGE && discountValue > 100) {
      newErrors.discountValue = 'Percentage cannot exceed 100%';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Convert string values to proper types
      const submitData: CreateCouponDto = {
        code: formData.code,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };
      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Ticket className="w-6 h-6 text-purple-600" />
          {initialData ? 'Edit Coupon' : 'Create New Coupon'}
        </h2>
        <button type="button" onClick={onCancel} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Coupon Code */}
      <div>
        <label htmlFor="code" className="block text-sm font-medium mb-2">
          Coupon Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="code"
          name="code"
          value={formData.code}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase ${
            errors.code ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="SUMMER2025"
          maxLength={50}
        />
        {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
        <p className="mt-1 text-xs text-gray-500">Use uppercase letters, numbers, hyphens, and underscores</p>
      </div>

      {/* Discount Type & Value */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="discountType" className="block text-sm font-medium mb-2">
            Discount Type <span className="text-red-500">*</span>
          </label>
          <select
            id="discountType"
            name="discountType"
            value={formData.discountType}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value={DiscountType.PERCENTAGE}>Percentage (%)</option>
            <option value={DiscountType.FIXED}>Fixed Amount (AED)</option>
          </select>
        </div>

        <div>
          <label htmlFor="discountValue" className="block text-sm font-medium mb-2">
            Discount Value <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            {formData.discountType === DiscountType.PERCENTAGE ? (
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            ) : (
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            )}
            <input
              type="number"
              id="discountValue"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleChange}
              step="0.01"
              min="0"
              max={formData.discountType === DiscountType.PERCENTAGE ? "100" : undefined}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.discountValue ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={formData.discountType === DiscountType.PERCENTAGE ? "10" : "50"}
            />
          </div>
          {errors.discountValue && <p className="mt-1 text-sm text-red-600">{errors.discountValue}</p>}
        </div>
      </div>

      {/* Min Order & Max Discount */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="minOrderAmount" className="block text-sm font-medium mb-2">
            Minimum Order Amount (AED)
          </label>
          <input
            type="number"
            id="minOrderAmount"
            name="minOrderAmount"
            value={formData.minOrderAmount || ''}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="0.00"
          />
          <p className="mt-1 text-xs text-gray-500">Optional: Order must be at least this amount</p>
        </div>

        <div>
          <label htmlFor="maxDiscount" className="block text-sm font-medium mb-2">
            Maximum Discount (AED)
          </label>
          <input
            type="number"
            id="maxDiscount"
            name="maxDiscount"
            value={formData.maxDiscount || ''}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="0.00"
          />
          <p className="mt-1 text-xs text-gray-500">Optional: Cap the maximum discount amount</p>
        </div>
      </div>

      {/* Usage Limit */}
      <div>
        <label htmlFor="usageLimit" className="block text-sm font-medium mb-2">
          Usage Limit
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="number"
            id="usageLimit"
            name="usageLimit"
            value={formData.usageLimit || ''}
            onChange={handleChange}
            min="1"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Unlimited"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">Optional: Maximum number of times this coupon can be used</p>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-2">
            Start Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium mb-2">
            End Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Coupon' : 'Create Coupon'}
        </button>
      </div>
    </form>
  );
}
