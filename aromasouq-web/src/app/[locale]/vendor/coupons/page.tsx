'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon, useToggleCouponStatus } from '@/hooks/useCoupons';
import { CouponForm } from '@/components/vendor/CouponForm';
import { Coupon, CreateCouponDto, DiscountType } from '@/types/coupon';
import { Plus, Edit, Trash2, Power, Ticket, Calendar, Users, TrendingUp } from 'lucide-react';

export default function VendorCouponsPage() {
  const t = useTranslations('vendor.coupons');
  const { data: coupons, isLoading } = useCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();
  const toggleStatus = useToggleCouponStatus();

  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const handleCreate = (data: CreateCouponDto) => {
    createCoupon.mutate(data, {
      onSuccess: () => {
        setShowForm(false);
      },
    });
  };

  const handleUpdate = (data: CreateCouponDto) => {
    if (editingCoupon) {
      updateCoupon.mutate(
        { id: editingCoupon.id, data },
        {
          onSuccess: () => {
            setEditingCoupon(null);
            setShowForm(false);
          },
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t('deleteConfirm'))) {
      deleteCoupon.mutate(id);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCoupon(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();
  const isUpcoming = (startDate: string) => new Date(startDate) > new Date();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ticket className="w-8 h-8 text-purple-600" />
            {t('title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('subtitle')}</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Plus className="w-5 h-5" />
            {t('createCoupon')}
          </button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-lg">
          <CouponForm
            initialData={editingCoupon}
            onSubmit={editingCoupon ? handleUpdate : handleCreate}
            onCancel={handleCancel}
            isSubmitting={createCoupon.isPending || updateCoupon.isPending}
          />
        </div>
      )}

      {/* Coupons Grid */}
      {coupons && coupons.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {coupons.map((coupon) => {
            const expired = isExpired(coupon.endDate);
            const upcoming = isUpcoming(coupon.startDate);
            const usagePercentage = coupon.usageLimit ? (coupon.usageCount / coupon.usageLimit) * 100 : 0;

            return (
              <div
                key={coupon.id}
                className={`bg-white border-2 rounded-lg p-6 ${
                  !coupon.isActive ? 'border-gray-300 bg-gray-50' : expired ? 'border-red-300' : 'border-purple-300'
                }`}
              >
                {/* Coupon Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-purple-600 mb-2">{coupon.code}</h3>
                    <div className="flex flex-wrap gap-2">
                      {!coupon.isActive && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded">{t('inactive')}</span>
                      )}
                      {expired && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">{t('expired')}</span>
                      )}
                      {upcoming && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">{t('upcoming')}</span>
                      )}
                      {coupon.isActive && !expired && !upcoming && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">{t('active')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleStatus.mutate({ id: coupon.id, isActive: !coupon.isActive })}
                      className={`p-2 rounded-lg transition ${
                        coupon.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title={coupon.isActive ? t('deactivate') : t('activate')}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Discount Info */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">{t('discount')}</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {coupon.discountType === DiscountType.PERCENTAGE
                      ? t('percentOff', { value: coupon.discountValue })
                      : t('aedOff', { value: coupon.discountValue })}
                  </p>
                  {coupon.minOrderAmount && (
                    <p className="text-sm text-gray-600 mt-1">{t('minOrder', { amount: coupon.minOrderAmount })}</p>
                  )}
                  {coupon.maxDiscount && (
                    <p className="text-sm text-gray-600">{t('maxDiscount', { amount: coupon.maxDiscount })}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">{t('validPeriod')}</p>
                      <p className="text-sm font-medium">
                        {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">{t('usage')}</p>
                      <p className="text-sm font-medium">
                        {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Usage Progress */}
                {coupon.usageLimit && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{t('usageProgress')}</span>
                      <span>{Math.round(usagePercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          usagePercentage >= 100 ? 'bg-red-600' : usagePercentage >= 75 ? 'bg-[#B3967D]/500' : 'bg-purple-600'
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noCoupons')}</h3>
          <p className="text-gray-600 mb-6">{t('noCouponsDesc')}</p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Plus className="w-5 h-5" />
              {t('createFirstCoupon')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
