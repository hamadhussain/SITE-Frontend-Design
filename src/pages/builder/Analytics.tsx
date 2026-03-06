import { useQuery } from '@tanstack/react-query'
import { builderApi } from '@/services/api'
import { BarChart3, TrendingUp, Briefcase, Star, Award, Target } from 'lucide-react'

interface BidMetrics {
  total: number
  submitted: number
  accepted: number
  rejected: number
  withdrawn: number
  winRate: number
}

interface ProjectMetrics {
  total: number
  inProgress: number
  completed: number
  totalEarnings: number
}

interface ProfileMetrics {
  averageRating: number
  totalReviews: number
  isVerified: boolean
  subscriptionTier: string
}

interface AnalyticsData {
  bids: BidMetrics
  projects: ProjectMetrics
  profile: ProfileMetrics
}

export default function BuilderAnalytics() {
  const { data: analytics, isLoading, isError } = useQuery<AnalyticsData>({
    queryKey: ['builder-analytics'],
    queryFn: () => builderApi.getAnalytics().then((r) => r.data),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isError || !analytics) {
    return (
      <div className="text-center py-16 text-gray-500">
        <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p>Failed to load analytics data.</p>
        <p className="text-sm mt-1">Please try again later.</p>
      </div>
    )
  }

  const { bids, projects, profile } = analytics

  const kpiCards = [
    {
      label: 'Total Projects',
      value: projects.total,
      icon: Briefcase,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Completed',
      value: projects.completed,
      icon: Award,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'In Progress',
      value: projects.inProgress,
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Total Earnings',
      value: `PKR ${(projects.totalEarnings || 0).toLocaleString()}`,
      icon: Target,
      color: 'bg-purple-50 text-purple-600',
    },
  ]

  const bidBreakdown = [
    { label: 'Submitted', value: bids.submitted, color: 'bg-blue-500' },
    { label: 'Accepted', value: bids.accepted, color: 'bg-green-500' },
    { label: 'Rejected', value: bids.rejected, color: 'bg-red-500' },
    { label: 'Withdrawn', value: bids.withdrawn, color: 'bg-gray-400' },
  ]

  const maxBidValue = Math.max(...bidBreakdown.map((b) => b.value), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Your performance metrics and insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{card.label}</span>
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bid Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-1">Bid Breakdown</h2>
          <p className="text-sm text-gray-500 mb-4">
            {bids.total} total bids — {bids.winRate}% win rate
          </p>
          <div className="space-y-3">
            {bidBreakdown.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`${item.color} h-2.5 rounded-full transition-all`}
                    style={{ width: `${(item.value / maxBidValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating & Profile */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-4">Rating & Profile</h2>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 mb-2">
              <Star className="h-10 w-10 text-amber-500" />
            </div>
            <p className="text-3xl font-bold">{profile.averageRating?.toFixed(1) || '0.0'}</p>
            <p className="text-sm text-gray-500">{profile.totalReviews} reviews</p>
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Verification</span>
              {profile.isVerified ? (
                <span className="text-green-600 font-medium">Verified</span>
              ) : (
                <span className="text-gray-400">Not Verified</span>
              )}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subscription</span>
              <span className="font-medium capitalize">{profile.subscriptionTier?.toLowerCase() || 'Free'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Win Rate</span>
              <span className="font-medium">{bids.winRate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Completion Rate</span>
              <span className="font-medium">
                {projects.total > 0
                  ? Math.round((projects.completed / projects.total) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>

          {/* Performance Badges */}
          <div className="mt-5 pt-4 border-t">
            <p className="text-sm text-gray-500 mb-2">Badges</p>
            <div className="flex flex-wrap gap-2">
              {profile.isVerified && (
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  Verified Builder
                </span>
              )}
              {projects.completed >= 10 && (
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  10+ Projects
                </span>
              )}
              {projects.completed >= 5 && projects.completed < 10 && (
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  5+ Projects
                </span>
              )}
              {(profile.averageRating || 0) >= 4.5 && (
                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                  Top Rated
                </span>
              )}
              {bids.winRate >= 50 && bids.total >= 5 && (
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                  High Win Rate
                </span>
              )}
              {projects.total === 0 && !profile.isVerified && (
                <span className="text-xs text-gray-400">Complete projects to earn badges</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
