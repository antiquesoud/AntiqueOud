'use client';

import { useEffect } from 'react';
import { useAddress, useUpdateAddress, CreateAddressDto } from '@/hooks/useAddresses';
import { useAuth } from '@/hooks/useAuth';
import { AddressForm } from '@/components/addresses/AddressForm';
import { useRouter, useParams } from '@/i18n/navigation';
import { MapPin, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function EditAddressPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, hasHydrated } = useAuth();
  const addressId = params.id as string;
  const t = useTranslations('account.editAddressPage');

  // Redirect to login if not authenticated (after hydration)
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  const { data: address, isLoading, error } = useAddress(addressId);
  const updateAddress = useUpdateAddress();

  const handleSubmit = (data: CreateAddressDto) => {
    updateAddress.mutate(
      { id: addressId, data },
      {
        onSuccess: () => {
          router.push('/account/addresses');
        },
      }
    );
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{t('failedToLoad')}</p>
          <Link
            href="/account/addresses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('backToAddresses')}
          </Link>
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
          initialData={address}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={updateAddress.isPending}
          submitLabel={t('updateAddress')}
        />
      </div>

      {/* Help Text */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">{t('needHelp')}</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>• {t('help1')}</li>
          <li>• {t('help2')}</li>
          <li>• {t('help3')}</li>
        </ul>
      </div>
    </div>
  );
}
