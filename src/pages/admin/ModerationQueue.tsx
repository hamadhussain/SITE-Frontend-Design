import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '@/services/api'
import ReasonDialog from '@/components/ui/ReasonDialog'
import { Star, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'

type ModerationTab = 'PENDING' | 'FLAGGED' | 'APPROVED' | 'REJECTED'

const tabConfig: { key: ModerationTab; label: string; color: string }[] = [
  { key: 'PENDING', label: 'Pending', color: 'text-yellow-600 border-yellow-600' },
  { key: 'FLAGGED', label: 'Flagged', color: 'text-red-600 border-red-600' },
  { key: 'APPROVED', label: 'Approved', color: 'text-green-600 border-green-600' },
  { key: 'REJECTED', label: 'Rejected', color: 'text-gray-600 border-gray-600' },
]

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  FLAGGED: 'bg-red-100 text-red-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-gray-100 text-gray-800',
  HIDDEN: 'bg-gray-100 text-gray-800',
}

export default function ModerationQueue() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<ModerationTab>('PENDING')
  const [page, setPage] = useState(0)
  const [rejectingId, setRejectingId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['moderation-queue', activeTab, page],
    queryFn: () => adminApi.getModerationQueue({ status: activeTab, page, size: 10 }).then(r => r.data),
  })

  const moderateMutation = useMutation({
    mutationFn: ({ id, action, notes }: { id: number; action: string; notes?: string }) =>
      adminApi.moderateReview(id, action, notes),
    onSuccess: () => {
      toast.success('Review moderated successfully')
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] })
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] })
    },
    onError: () => toast.error('Failed to moderate review'),
  })

  const reviews = data?.content || []
  const totalPages = data?.totalPages || 0

  const handleApprove = (id: number) => {
    moderateMutation.mutate({ id, action: 'APPROVE' })
  }

  const handleReject = (id: number) => {
    setRejectingId(id)
  }

  const handleRejectConfirm = (notes: string) => {
    if (rejectingId !== null) {
      moderateMutation.mutate({ id: rejectingId, action: 'REJECT', notes })
      setRejectingId(null)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div>
      <ReasonDialog
        isOpen={rejectingId !== null}
        title="Rejection Reason"
        placeholder="Enter rejection reason..."
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectingId(null)}
      />
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Moderation Queue</h1>
        <p className="text-gray-600">Review and moderate user-submitted reviews.</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b">
          <nav className="flex -mb-px">
            {tabConfig.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setPage(0) }}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab.key
                    ? tab.color
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No reviews in this category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {renderStars(review.overallRating)}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[review.status] || 'bg-gray-100 text-gray-800'}`}>
                          {review.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {review.reviewType?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">{review.reviewerName || 'Anonymous'}</span>
                        {' reviewed '}
                        <span className="font-medium">{review.revieweeName || 'Unknown'}</span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-2">
                          "{review.comment}"
                        </p>
                      )}
                      {review.moderationNotes && (
                        <p className="text-xs text-red-600 mt-1">
                          Moderation notes: {review.moderationNotes}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {review.createdAt ? formatDate(review.createdAt) : ''}
                      </p>
                    </div>

                    {(activeTab === 'PENDING' || activeTab === 'FLAGGED') && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleApprove(review.id)}
                          disabled={moderateMutation.isPending}
                          className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(review.id)}
                          disabled={moderateMutation.isPending}
                          className="flex items-center gap-1 border border-red-600 text-red-600 px-3 py-1.5 rounded-md text-sm hover:bg-red-50 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
