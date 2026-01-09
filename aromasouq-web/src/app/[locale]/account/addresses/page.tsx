'use client';

import { useEffect } from 'react';
import { useAddresses, useDeleteAddress, useSetDefaultAddress } from '@/hooks/useAddresses';
import { useAuth } from '@/hooks/useAuth';
import { AddressCard } from '@/components/addresses/AddressCard';
import { Link, useRouter } from '@/i18n/navigation';
import { Plus, MapPin, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuth();
  const { data: addresses, isLoading, error } = useAddresses();
  const deleteAddress = useDeleteAddress();
  const setDefault = useSetDefaultAddress();
  const t = useTranslations('account.addressesPage');

  // Redirect to login if not authenticated (after hydration)
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  const handleDelete = (id: string) => {
    deleteAddress.mutate(id);
  };

  const handleSetDefault = (id: string) => {
    setDefault.mutate(id);
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{t('failedToLoad')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-8 h-8 text-purple-600" />
            {t('title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('description')}
          </p>
        </div>
        <Link
          href="/account/addresses/new"
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          {t('addNewAddress')}
        </Link>
      </div>

      {/* Addresses Grid */}
      {addresses && addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
              isDeleting={deleteAddress.isPending}
              isSettingDefault={setDefault.isPending}
            />
          ))}
        </div>
      ) : (
        // Empty State
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('noAddressesYet')}
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {t('noAddressesDescription')}
          </p>
          <Link
            href="/account/addresses/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            {t('addFirstAddress')}
          </Link>
        </div>
      )}

      {/* Info Note */}
      {addresses && addresses.length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>{t('note')}:</strong> {t('defaultAddressNote')}
          </p>
        </div>
      )}
    </div>
  );
}
