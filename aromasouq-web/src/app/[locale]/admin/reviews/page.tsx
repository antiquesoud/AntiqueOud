'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Search, Trash2, CheckCircle, Star, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ReviewModerationPage() {
  const t = useTranslations()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<string>('FLAGGED')
  const [reviewToDelete, setReviewToDelete] = useState<any | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<any>({
    queryKey: ['admin-reviews', { search, flagged: activeTab === 'FLAGGED' }],
    queryFn: () => apiClient.get('/admin/reviews', {
      search: search || undefined,
      flagged: activeTab === 'FLAGGED' ? true : undefined
    }),
  })

  // Extract reviews array from response - API returns { data: [...], meta: {...} }
  const reviews = Array.isArray(data) ? data : (data?.data || [])

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => apiClient.delete(`/admin/reviews/${reviewId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success(t('admin.reviews.reviewDeleted'))
      setReviewToDelete(null)
    },
  })

  const clearFlagMutation = useMutation({
    mutationFn: (reviewId: string) => apiClient.patch(`/admin/reviews/${reviewId}/clear-flag`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success(t('admin.reviews.flagCleared'))
    },
  })

  const togglePublishMutation = useMutation({
    mutationFn: (reviewId: string) => apiClient.patch(`/reviews/${reviewId}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success(t('admin.reviews.reviewStatusUpdated'))
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-deep-navy">{t('admin.reviews.title')}</h1>
        <p className="text-gray-600 mt-1">{t('admin.reviews.subtitle')}</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('admin.reviews.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="FLAGGED">{t('admin.reviews.flagged')}</TabsTrigger>
          <TabsTrigger value="ALL">{t('admin.reviews.allReviews')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.reviews.reviews')} ({reviews?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">{t('admin.reviews.loading')}</div>
              ) : !reviews || reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">{t('admin.reviews.noReviewsFound')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium">{review.user?.firstName} {review.user?.lastName}</p>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-[#B3967D]/400 fill-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            {review.flagged && (
                              <Badge variant="destructive">{t('admin.reviews.flagged')}</Badge>
                            )}
                            <Badge variant={review.isPublished ? 'default' : 'secondary'}>
                              {review.isPublished ? t('admin.reviews.published') : t('admin.reviews.unpublished')}
                            </Badge>
                          </div>
                          <Link
                            href={`/products/${review.product?.slug}`}
                            className="text-sm text-oud-gold hover:underline mb-2 block"
                          >
                            {review.product?.name}
                          </Link>
                          <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 mb-2">
                              {review.images.map((img: any, idx: number) => (
                                <div key={idx} className="relative w-20 h-20 rounded overflow-hidden">
                                  <Image src={img.url} alt={`Review image ${idx + 1} for ${review.product?.name}`} fill className="object-cover" />
                                </div>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                        </div>
                        <div className="flex gap-2">
                          {review.flagged && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => clearFlagMutation.mutate(review.id)}
                              disabled={clearFlagMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {t('admin.reviews.clearFlag')}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => togglePublishMutation.mutate(review.id)}
                            disabled={togglePublishMutation.isPending}
                          >
                            {review.isPublished ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                {t('admin.reviews.unpublish')}
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                {t('admin.reviews.publish')}
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setReviewToDelete(review)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={!!reviewToDelete} onOpenChange={() => setReviewToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.reviews.deleteReview')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.reviews.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.reviews.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => reviewToDelete && deleteReviewMutation.mutate(reviewToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('admin.reviews.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
