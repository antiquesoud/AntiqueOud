'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Link, useRouter } from '@/i18n/navigation';
import { User as UserIcon, Mail, Phone, Globe, Coins } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';

interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  preferredLanguage: 'en' | 'ar';
  coinsBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const t = useTranslations('account.profilePage');
  const tProducts = useTranslations('products');
  const tAccount = useTranslations('account');
  const { data: profile, isLoading, error} = useQuery<ProfileData>({
    queryKey: ['profile'],
    queryFn: async () => {
      return await apiClient.get('/users/profile');
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{t('failedToLoad')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header Section with Avatar */}
          <div className="bg-gradient-to-r from-[#550000] via-[#6b0000] to-[#550000] p-8 text-white">
            <div className="flex items-center gap-6">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white bg-white/20 flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-[#ECDBC7] capitalize mt-1">
                  {profile.role.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <label className="text-sm text-gray-600 block">{t('email')}</label>
                  <p className="font-medium text-gray-900">{profile.email}</p>
                  {!profile.emailVerified && (
                    <span className="inline-block mt-1 text-xs bg-[#B3967D]/100 text-[#B3967D]/700 px-2 py-1 rounded">
                      {t('notVerified')}
                    </span>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <label className="text-sm text-gray-600 block">{t('phone')}</label>
                  <p className="font-medium text-gray-900">
                    {profile.phone || t('notSet')}
                  </p>
                </div>
              </div>

              {/* Language */}
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <label className="text-sm text-gray-600 block">{t('language')}</label>
                  <p className="font-medium text-gray-900">
                    {profile.preferredLanguage === 'en' ? t('english') : t('arabic')}
                  </p>
                </div>
              </div>

              {/* Coins Balance */}
              <div className="flex items-start gap-3">
                <Coins className="w-5 h-5 text-[#B3967D]/500 mt-1" />
                <div className="flex-1">
                  <label className="text-sm text-gray-600 block">{t('coinsBalanceLabel')}</label>
                  <p className="font-medium text-gray-900">{profile.coinsBalance} {tProducts('coins')}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('coinsValue', { value: profile.coinsBalance.toFixed(2) })}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-200 flex gap-4">
              <Link
                href="/account/edit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#B3967D] to-[#B3967D] text-[#2D2D2D] font-bold rounded-lg hover:shadow-lg transition text-center"
              >
                {tAccount('editProfile')}
              </Link>
              <Link
                href="/account/change-password"
                className="flex-1 px-6 py-3 border border-[#B3967D] rounded-lg hover:bg-[#ECDBC7] transition text-center font-medium"
              >
                {tAccount('changePassword')}
              </Link>
            </div>

            <Link
              href="/account/coins"
              className="block w-full px-6 py-3 border border-[#B3967D]/500 bg-[#B3967D]/50 text-[#B3967D]/700 rounded-lg hover:bg-[#B3967D]/100 transition text-center font-medium"
            >
              {t('viewCoinsHistory')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
