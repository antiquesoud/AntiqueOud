import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Review, ReviewStats } from '@/types/review';

interface ReviewsParams {
  productId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

interface ReviewsResponse {
  data: Review[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useReviews(params: ReviewsParams) {
  return useQuery<ReviewsResponse>({
    queryKey: ['reviews', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params.productId) queryParams.append('productId', params.productId);
      if (params.userId) queryParams.append('userId', params.userId);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const res = await apiClient.get(`/reviews?${queryParams.toString()}`);
      return res as ReviewsResponse;
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation<Review, Error, {
    productId: string;
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
  }>({
    mutationFn: async (data) => {
      const res = await apiClient.post('/reviews', data);
      return res as Review;
    },
    onSuccess: (data, variables) => {
      // Invalidate reviews list
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      // Invalidate review stats for this product
      queryClient.invalidateQueries({ queryKey: ['reviewStats', variables.productId] });
      // Invalidate product data to update review count and average rating
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      data,
    }: {
      reviewId: string;
      data: {
        rating?: number;
        title?: string;
        comment?: string;
      };
    }) => {
      const res = await apiClient.patch(`/reviews/${reviewId}`, data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviewStats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      await apiClient.delete(`/reviews/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviewStats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

export function useVoteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      voteType,
    }: {
      reviewId: string;
      voteType: 'HELPFUL' | 'NOT_HELPFUL';
    }) => {
      const res = await apiClient.post(`/reviews/${reviewId}/vote`, { voteType });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useVendorReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      reply,
    }: {
      reviewId: string;
      reply: string;
    }) => {
      const res = await apiClient.post(`/reviews/${reviewId}/reply`, { reply });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useUploadReviewImages() {
  return useMutation({
    mutationFn: async ({
      reviewId,
      files,
    }: {
      reviewId: string;
      files: File[];
    }) => {
      const res = await apiClient.uploadFiles(`/uploads/reviews/${reviewId}/images`, files);
      return res;
    },
  });
}

export function useReviewStats(productId: string) {
  return useQuery<ReviewStats>({
    queryKey: ['reviewStats', productId],
    queryFn: async () => {
      const res = await apiClient.get(`/reviews/stats/${productId}`);
      return res as ReviewStats;
    },
  });
}
