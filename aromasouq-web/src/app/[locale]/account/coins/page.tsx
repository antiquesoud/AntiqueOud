'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Coins, TrendingUp, TrendingDown, History, ShoppingBag, Star, Gift, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function CoinsHistoryPage() {
  const t = useTranslations('account.coinsHistoryPage');

  const { data, isLoading } = useQuery({
    queryKey: ['coins-history'],
    queryFn: async () => {
      return await apiClient.get('/users/coins-history?limit=50');
    },
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'EARNED':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'SPENT':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'REFUNDED':
        return <History className="w-5 h-5 text-blue-500" />;
      case 'EXPIRED':
        return <History className="w-5 h-5 text-gray-500" />;
      default:
        return <Coins className="w-5 h-5 text-[#B3967D]/500" />;
    }
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      ORDER_PURCHASE: t('sources.orderPurchase'),
      PRODUCT_REVIEW: t('sources.productReview'),
      REFERRAL: t('sources.referral'),
      PROMOTION: t('sources.promotion'),
      REFUND: t('sources.refund'),
      ADMIN: t('sources.admin'),
    };
    return labels[source] || source;
  };

  if (isLoading) {
    return <div className="container mx-auto py-12 px-4">{t('loading')}</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-[#B3967D]/400 to-[#B3967D]/500 rounded-lg shadow-lg p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#B3967D]/100 text-sm mb-2">{t('yourCoinsBalance')}</p>
              <p className="text-5xl font-bold">{data?.balance || 0}</p>
              <p className="text-[#B3967D]/100 mt-2">
                {t('aedValue', { value: (data?.balance || 0).toFixed(2) })}
              </p>
            </div>
            <Coins className="w-24 h-24 text-[#B3967D]/200 opacity-50" />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#B3967D]/300">
            <div>
              <p className="text-[#B3967D]/100 text-sm">{t('lifetimeEarned')}</p>
              <p className="text-2xl font-bold">{data?.lifetimeEarned || 0}</p>
            </div>
            <div>
              <p className="text-[#B3967D]/100 text-sm">{t('lifetimeSpent')}</p>
              <p className="text-2xl font-bold">{data?.lifetimeSpent || 0}</p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-xl font-semibold">{t('transactionHistory')}</h2>
          </div>

          {!data?.transactions || data.transactions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Coins className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>{t('noTransactions')}</p>
            </div>
          ) : (
            <div className="divide-y">
              {data.transactions.map((txn: any) => (
                <div key={txn.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div>{getTransactionIcon(txn.type)}</div>

                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {txn.description || getSourceLabel(txn.source)}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-gray-500">
                            {new Date(txn.createdAt).toLocaleString()}
                          </p>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            txn.type === 'EARNED' ? 'bg-green-100 text-green-700' :
                            txn.type === 'SPENT' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {t(`transactionTypes.${txn.type.toLowerCase()}`)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getSourceLabel(txn.source)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <p className={`text-xl font-bold ${
                        txn.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {txn.amount > 0 ? '+' : ''}{txn.amount}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('balance')}: {txn.balanceAfter}
                      </p>
                    </div>
                  </div>

                  {txn.expiresAt && new Date(txn.expiresAt) > new Date() && (
                    <p className="text-xs text-[#B3967D]/600 mt-2">
                      {t('expires', { date: new Date(txn.expiresAt).toLocaleDateString() })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ways to Earn Coins */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">{t('waysToEarn')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Order Purchase */}
            <div className="bg-white border-2 border-purple-200 rounded-lg p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('everyPurchase')}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {t('everyPurchaseDescription')}
              </p>
              <div className="text-2xl font-bold text-purple-600">10%</div>
              <p className="text-xs text-gray-500 mt-1">{t('ofOrderValue')}</p>
            </div>

            {/* Product Review */}
            <div className="bg-white border-2 border-[#B3967D]/200 rounded-lg p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#B3967D]/100 rounded-full flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-[#B3967D]/600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('writeReviews')}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {t('writeReviewsDescription')}
              </p>
              <div className="text-2xl font-bold text-[#B3967D]/600">+Coins</div>
              <p className="text-xs text-gray-500 mt-1">{t('perReview')}</p>
            </div>

            {/* Promotions */}
            <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <Gift className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('specialOffers')}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {t('specialOffersDescription')}
              </p>
              <div className="text-2xl font-bold text-pink-600">{t('bonus')}</div>
              <p className="text-xs text-gray-500 mt-1">{t('limitedTime')}</p>
            </div>

            {/* Admin Rewards */}
            <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('specialRewards')}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {t('specialRewardsDescription')}
              </p>
              <div className="text-2xl font-bold text-blue-600">{t('surprise')}</div>
              <p className="text-xs text-gray-500 mt-1">{t('loyaltyProgram')}</p>
            </div>
          </div>
        </div>

        {/* How to Use Coins */}
        <div className="mt-8 bg-gradient-to-r from-[#B3967D]/50 to-[#B3967D]/50 border-2 border-[#B3967D]/200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t('howToUseCoins')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#B3967D]/500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{t('step1Title')}</p>
                <p className="text-sm text-gray-600">{t('step1Description')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#B3967D]/500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{t('step2Title')}</p>
                <p className="text-sm text-gray-600">{t('step2Description')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#B3967D]/500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{t('step3Title')}</p>
                <p className="text-sm text-gray-600">{t('step3Description')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#B3967D]/500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">4</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{t('step4Title')}</p>
                <p className="text-sm text-gray-600">{t('step4Description')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
