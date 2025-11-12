import { StarRating } from './StarRating';
import { ReviewStats as ReviewStatsType } from '@/types/review';

interface ReviewStatsProps {
  stats: ReviewStatsType;
}

export function ReviewStats({ stats }: ReviewStatsProps) {
  const { averageRating, totalReviews, ratingDistribution } = stats;

  const getRatingPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>

      {/* Average Rating Summary */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">{averageRating.toFixed(1)}</div>
          <StarRating rating={averageRating} size="md" />
          <div className="text-sm text-gray-600 mt-2">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingDistribution[rating as keyof typeof ratingDistribution];
          const percentage = getRatingPercentage(count);

          return (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12">
                <span className="text-sm font-medium">{rating}</span>
                <span className="text-[#B3967D]/400">★</span>
              </div>

              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B3967D]/400 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="w-12 text-right text-sm text-gray-600">
                {count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
