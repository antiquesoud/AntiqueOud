'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Coins,
  ShoppingBag,
  Star,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  Calendar
} from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

interface Wallet {
  id: string
  balance: number
  lifetimeEarned: number
  lifetimeSpent: number
  coinsExpiringSoon: number
  availableBalance: number
}

interface Transaction {
  id: string
  amount: number
  type: 'EARNED' | 'SPENT' | 'EXPIRED' | 'REFUNDED'
  source: string
  description: string
  createdAt: string
  expiresAt?: string
  balanceAfter: number
}

interface WalletStats {
  totalEarned: number
  totalSpent: number
  currentBalance: number
  transactionCount: number
  earningsBySource: Array<{
    source: string
    amount: number
  }>
}

export default function WalletPage() {
  const t = useTranslations('account.walletPage')
  const queryClient = useQueryClient()
  const [coinsToRedeem, setCoinsToRedeem] = useState<number>(100)
  const [transactionPage, setTransactionPage] = useState(1)

  // Fetch wallet data
  const { data: wallet, isLoading: walletLoading } = useQuery<Wallet>({
    queryKey: ['wallet'],
    queryFn: () => apiClient.get('/wallet'),
  })

  // Fetch transactions
  const { data: transactionsData } = useQuery<{ data: Transaction[], meta: { total: number, page: number, limit: number, totalPages: number } }>({
    queryKey: ['wallet-transactions', transactionPage],
    queryFn: () => apiClient.get(`/wallet/transactions?page=${transactionPage}&limit=10`),
  })

  // Fetch stats
  const { data: stats } = useQuery<WalletStats>({
    queryKey: ['wallet-stats'],
    queryFn: () => apiClient.get('/wallet/stats'),
  })

  // Redeem coins mutation
  const redeemMutation = useMutation<{ coupon: { code: string } }, Error, number>({
    mutationFn: (amount: number) => apiClient.post('/wallet/redeem', { amount }),
    onSuccess: (data) => {
      toast.success(t('redeemSuccess', { count: coinsToRedeem }))
      toast.success(t('couponCode', { code: data.coupon.code }), { duration: 10000 })
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['wallet-stats'] })
      setCoinsToRedeem(100)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('redeemFailed'))
    },
  })

  const handleRedeem = () => {
    if (!coinsToRedeem || coinsToRedeem < 10) {
      toast.error(t('minimumCoinsRequired'))
      return
    }
    if (coinsToRedeem > (wallet?.balance || 0)) {
      toast.error(t('insufficientBalance'))
      return
    }
    redeemMutation.mutate(coinsToRedeem)
  }

  const transactions = transactionsData?.data || []
  const meta = transactionsData?.meta

  if (walletLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg">{t('loading')}</p>
      </div>
    )
  }

  const discountValue = (coinsToRedeem * 0.1).toFixed(2)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('description')}
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Main Balance Card */}
        <Card className="md:col-span-2 bg-gradient-to-br from-oud-gold to-amber-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/80 mb-1">{t('availableBalance')}</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-5xl font-bold">{wallet?.balance || 0}</h2>
                  <Coins className="h-8 w-8" />
                </div>
                <p className="text-sm text-white/90 mt-2">
                  {t('discountValue', { amount: formatCurrency((wallet?.balance || 0) * 1) })}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-white/40" />
            </div>

            {wallet && wallet.coinsExpiringSoon > 0 && (
              <Alert variant="default" className="mt-4 bg-white/20 border-white/30 text-white">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-white">{t('expiringTitle')}</AlertTitle>
                <AlertDescription className="text-white/90">
                  {t('expiringDescription', { count: wallet.coinsExpiringSoon })}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('lifetimeStats')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span>{t('totalEarned')}</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {stats?.totalEarned || wallet?.lifetimeEarned || 0}
              </p>
            </div>
            <Separator />
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <ArrowDownLeft className="h-4 w-4 text-red-600" />
                <span>{t('totalSpent')}</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {stats?.totalSpent || wallet?.lifetimeSpent || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* How to Earn Coins */}
          <Card>
            <CardHeader>
              <CardTitle>{t('howToEarnCoins')}</CardTitle>
              <CardDescription>
                {t('earnCoinsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-oud-gold/10 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-oud-gold" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{t('shopAndEarn')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('shopAndEarnDescription')}
                    </p>
                    <p className="text-xs text-oud-gold font-medium mt-1">
                      {t('coinsAwarded')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-oud-gold/10 rounded-lg">
                    <Star className="h-6 w-6 text-oud-gold" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{t('writeReviews')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('writeReviewsDescription')}
                    </p>
                    <p className="text-xs text-oud-gold font-medium mt-1">
                      {t('reviewDeliveredProducts')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-oud-gold/10 rounded-lg">
                    <Gift className="h-6 w-6 text-oud-gold" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{t('specialPromotions')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('specialPromotionsDescription')}
                    </p>
                    <p className="text-xs text-oud-gold font-medium mt-1">
                      {t('stayTuned')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>{t('transactionHistory')}</CardTitle>
              <CardDescription>
                {t('transactionDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('noTransactions')}</p>
                  <p className="text-sm mt-1">{t('startEarning')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx: Transaction) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${
                          tx.type === 'EARNED' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {tx.type === 'EARNED' ? (
                            <ArrowUpRight className={`h-4 w-4 ${
                              tx.type === 'EARNED' ? 'text-green-600' : 'text-red-600'
                            }`} />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{tx.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(tx.createdAt), 'MMM dd, yyyy HH:mm')}
                            </p>
                            {tx.expiresAt && new Date(tx.expiresAt) > new Date() && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="h-3 w-3 mr-1" />
                                {t('expires', { date: format(new Date(tx.expiresAt), 'MMM dd, yyyy') })}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`font-bold text-lg ${
                          tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('balance')}: {tx.balanceAfter}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {meta && meta.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTransactionPage(p => Math.max(1, p - 1))}
                        disabled={transactionPage === 1}
                      >
                        {t('previous')}
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {t('page', { current: transactionPage, total: meta.totalPages })}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTransactionPage(p => Math.min(meta.totalPages, p + 1))}
                        disabled={transactionPage === meta.totalPages}
                      >
                        {t('next')}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Redemption */}
        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>{t('redeemCoins')}</CardTitle>
              <CardDescription>
                {t('redeemDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-oud-gold/10 rounded-lg border-2 border-oud-gold/20">
                <p className="text-sm text-muted-foreground mb-1">{t('conversionRate')}</p>
                <p className="text-2xl font-bold text-oud-gold">{t('coinToAED')}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('coinsToRedeem')}
                </label>
                <Input
                  type="number"
                  min="10"
                  max={wallet?.balance || 0}
                  value={coinsToRedeem}
                  onChange={(e) => setCoinsToRedeem(parseInt(e.target.value) || 0)}
                  placeholder={t('enterCoins')}
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  {t('availableBalanceLabel', { count: wallet?.balance || 0 })}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">{t('coins')}:</span>
                  <span className="font-semibold">{coinsToRedeem}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('couponValue')}:</span>
                  <span className="font-bold text-oud-gold text-lg">
                    {formatCurrency(parseFloat(discountValue))}
                  </span>
                </div>
              </div>

              <Button
                className="w-full h-12 bg-gradient-to-r from-oud-gold to-amber-600 hover:shadow-lg"
                onClick={handleRedeem}
                disabled={redeemMutation.isPending || !coinsToRedeem || coinsToRedeem < 10 || coinsToRedeem > (wallet?.balance || 0)}
              >
                {redeemMutation.isPending ? t('redeeming') : t('redeem', { amount: `${discountValue} AED` })}
              </Button>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {t('couponValidityNote')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('importantNotes')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-oud-gold mt-1.5 flex-shrink-0" />
                <p>{t('note1')}</p>
              </div>
              <div className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-oud-gold mt-1.5 flex-shrink-0" />
                <p>{t('note2')}</p>
              </div>
              <div className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-oud-gold mt-1.5 flex-shrink-0" />
                <p>{t('note3')}</p>
              </div>
              <div className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-oud-gold mt-1.5 flex-shrink-0" />
                <p>{t('note4')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
