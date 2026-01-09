'use client';

import { useEffect } from 'react';
import { useCreateAddress, CreateAddressDto } from '@/hooks/useAddresses';
import { useAuth } from '@/hooks/useAuth';
import { AddressForm } from '@/components/addresses/AddressForm';
import { useRouter } from '@/i18n/navigation';
import { MapPin, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function NewAddressPage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuth();
  const createAddress = useCreateAddress();
  const t = useTranslations('account.newAddressPage');

  // Redirect to login if not authenticated (after hydration)
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  const handleSubmit = (data: CreateAddressDto) => {
    createAddress.mutate(data, {
      onSuccess: () => {
        router.push('/account/addresses');
      },
    });
  };

  const handleCancel = () => {
    router.push('/account/addresses');
  };

  // Show loading while hydrating
  if (!hasHydrated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-oud-gold"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back Button */}
      <Link
        href="/account/addresses"
        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        {t('backToAddresses')}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="w-8 h-8 text-purple-600" />
          {t('title')}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('description')}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <AddressForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={createAddress.isPending}
          submitLabel={t('addAddress')}
        />
      </div>

      {/* Help Text */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">{t('tipsTitle')}</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>• {t('tip1')}</li>
          <li>• {t('tip2')}</li>
          <li>• {t('tip3')}</li>
          <li>• {t('tip4')}</li>
        </ul>
      </div>
    </div>
  );
}
