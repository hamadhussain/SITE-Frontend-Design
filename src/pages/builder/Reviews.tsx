import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { reviewApi, builderApi } from '@/services/api'
import { Star } from 'lucide-react'

interface Review {
  id: number
  reviewerName: string
  projectId: number
  overallRating: number
  qualityRating?: number
  communicationRating?: number
  timelinessRating?: number
  comment?: string
  createdAt: string
}

function StarRating({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500 w-32">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`h-4 w-4 ${s <= value ? 'text-yellow-400' : 'text-gray-200'}`}
            fill={s <= value ? 'currentColor' : 'none'}
          />
        ))}
      </div>
      <span className="text-gray-600">{value.toFixed(1)}</span>
    </div>
  )
}

export default function BuilderReviews() {
  const { user } = useAuth()

  const { data: profileData } = useQuery({
    queryKey: ['builder-my-profile'],
    queryFn: () => builderApi.getMyProfile().then((r) => r.data),
  })

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['builder-my-reviews'],
    queryFn: () => reviewApi.getMyReviews({ size: 50 }).then((r) => r.data),
  })

  const reviews: Review[] = reviewsData?.content || []
  const avgRating: number = profileData?.averageRating || 0
  const totalReviews: number = profileData?.totalReviews || 0

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Reviews</h1>
        <p className="text-gray-600">Reviews from clients about your work</p>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-yellow-400">{Number(avgRating).toFixed(1)}</div>
            <div className="flex justify-center mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-5 w-5 ${s <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-200'}`}
                  fill={s <= Math.round(avgRating) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex-1 border-l pl-6">
            <p className="text-sm text-gray-500">
              Clients have rated your quality of work, communication, and timeliness.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Great reviews help you win more projects.
            </p>
          </div>
        </div>
      </div>

      {/* Reviews list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
          <Star className="h-12 w-12 mx-auto mb-3 text-gray-200" />
          <p className="font-medium mb-1">No reviews yet</p>
          <p className="text-sm">Complete projects and ask clients to leave reviews.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium">{review.reviewerName || 'Anonymous'}</div>
                  <div className="text-sm text-gray-500">{formatDate(review.createdAt)}</div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-5 w-5 ${s <= review.overallRating ? 'text-yellow-400' : 'text-gray-200'}`}
                      fill={s <= review.overallRating ? 'currentColor' : 'none'}
                    />
                  ))}
                  <span className="ml-1 font-semibold">{review.overallRating}.0</span>
                </div>
              </div>

              {review.comment && (
                <p className="text-gray-700 mb-4">{review.comment}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t pt-3">
                {review.qualityRating && (
                  <StarRating value={review.qualityRating} label="Quality" />
                )}
                {review.communicationRating && (
                  <StarRating value={review.communicationRating} label="Communication" />
                )}
                {review.timelinessRating && (
                  <StarRating value={review.timelinessRating} label="Timeliness" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
