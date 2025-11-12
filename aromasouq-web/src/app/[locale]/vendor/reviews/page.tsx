'use client';

import { useState } from 'react';
import { useReviews } from '@/hooks/useReviews';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { ReviewReplyForm } from '@/components/vendor/ReviewReplyForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function VendorReviewsPage() {
  const t = useTranslations('vendor.reviews')
  const [filter, setFilter] = useState<'all' | 'replied' | 'pending'>('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useReviews({ page, limit });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const reviews = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };

  // Filter reviews
  const filteredReviews = reviews.filter((review: any) => {
    if (filter === 'replied') return review.vendorReply;
    if (filter === 'pending') return !review.vendorReply;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>

        <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allReviews')}</SelectItem>
            <SelectItem value="pending">{t('pendingReply')}</SelectItem>
            <SelectItem value="replied">{t('replied')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">{t('totalReviews')}</p>
            <p className="text-2xl font-bold">{reviews.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">{t('pendingReplyCount')}</p>
            <p className="text-2xl font-bold text-[#B3967D]/600">
              {reviews.filter((r: any) => !r.vendorReply).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">{t('repliedCount')}</p>
            <p className="text-2xl font-bold text-green-600">
              {reviews.filter((r: any) => r.vendorReply).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">{t('noReviews')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredReviews.map((review: any) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <ReviewCard review={review} showVendorReply={false} />

                {/* Vendor Reply Form */}
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-2">
                    {review.vendorReply ? t('yourResponse') : t('respondToReview')}
                  </h4>
                  <ReviewReplyForm
                    reviewId={review.id}
                    existingReply={review.vendorReply}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('previous')}
          </button>
          <span className="text-sm text-gray-600">
            {t('page', { current: page, total: meta.totalPages })}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('next')}
          </button>
        </div>
      )}
    </div>
  );
}
