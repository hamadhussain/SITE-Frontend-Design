import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subscriptionApi } from '@/services/api'
import { toast } from 'sonner'
import { Check, Crown, Zap, Shield } from 'lucide-react'
import type { SubscriptionPlan } from '@/types'

function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount)
}

const tierIcons: Record<string, typeof Crown> = {
  FREE: Shield,
  BASIC: Zap,
  PROFESSIONAL: Crown,
  ENTERPRISE: Crown,
}

const tierColors: Record<string, string> = {
  FREE: 'border-gray-200',
  BASIC: 'border-green-300',
  PROFESSIONAL: 'border-blue-400 ring-2 ring-blue-100',
  ENTERPRISE: 'border-purple-400',
}

export default function Subscription() {
  const queryClient = useQueryClient()

  const { data: subData, isLoading: subLoading } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: () => subscriptionApi.getMySubscription().then(r => r.data as {
      currentTier: string
      expiresAt: string | null
      leadCredits: number
      isExpired: boolean
      plan?: SubscriptionPlan
    }),
  })

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionApi.getPlans().then(r => r.data as SubscriptionPlan[]),
  })

  const upgradeMutation = useMutation({
    mutationFn: (tier: string) => subscriptionApi.upgradeTier(tier),
    onSuccess: () => {
      toast.success('Subscription upgraded successfully!')
      queryClient.invalidateQueries({ queryKey: ['my-subscription'] })
      queryClient.invalidateQueries({ queryKey: ['lead-credits-balance'] })
    },
    onError: () => {
      toast.error('Failed to upgrade subscription')
    },
  })

  const plans = plansData || []
  const currentTier = subData?.currentTier || 'FREE'
  const tierOrder = ['FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE']

  const isLoading = subLoading || plansLoading

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Subscription</h1>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading subscription details...</p>
        </div>
      ) : (
        <>
          {/* Current Plan */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Current Plan</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    currentTier === 'ENTERPRISE' ? 'bg-purple-100 text-purple-800' :
                    currentTier === 'PROFESSIONAL' ? 'bg-blue-100 text-blue-800' :
                    currentTier === 'BASIC' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {currentTier}
                  </span>
                  {subData?.isExpired && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">Expired</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Lead Credits</p>
                <p className="text-2xl font-bold">{subData?.leadCredits ?? 0}</p>
                {subData?.expiresAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Renews: {new Date(subData.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Plans Grid */}
          <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map(plan => {
              const Icon = tierIcons[plan.tier] || Shield
              const isCurrent = plan.tier === currentTier
              const isUpgrade = tierOrder.indexOf(plan.tier) > tierOrder.indexOf(currentTier)
              const isDowngrade = tierOrder.indexOf(plan.tier) < tierOrder.indexOf(currentTier)
              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-lg shadow-sm p-6 border-2 ${tierColors[plan.tier] || 'border-gray-200'} ${isCurrent ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`h-5 w-5 ${
                      plan.tier === 'ENTERPRISE' ? 'text-purple-500' :
                      plan.tier === 'PROFESSIONAL' ? 'text-blue-500' :
                      plan.tier === 'BASIC' ? 'text-green-500' :
                      'text-gray-400'
                    }`} />
                    <h3 className="font-bold">{plan.name}</h3>
                    {isCurrent && (
                      <span className="ml-auto px-2 py-0.5 bg-primary text-primary-foreground rounded text-xs">Current</span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-2xl font-bold">{plan.price === 0 ? 'Free' : formatPKR(plan.price)}</span>
                    {plan.price > 0 && <span className="text-sm text-gray-500">/month</span>}
                  </div>

                  <p className="text-sm text-gray-500 mb-4">{plan.description}</p>

                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{plan.leadCreditsPerMonth} lead credits/month</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{plan.maxActiveBids === 999 ? 'Unlimited' : plan.maxActiveBids} active bids</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{plan.maxPortfolioImages === 999 ? 'Unlimited' : plan.maxPortfolioImages} portfolio images</span>
                    </li>
                    {plan.featuredListing && (
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>Featured listing</span>
                      </li>
                    )}
                    {plan.prioritySupport && (
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>Priority support</span>
                      </li>
                    )}
                    {plan.analyticsAccess && (
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>Advanced analytics</span>
                      </li>
                    )}
                  </ul>

                  {isCurrent ? (
                    <button disabled className="w-full px-4 py-2 border rounded-md text-sm text-gray-400 cursor-not-allowed">
                      Current Plan
                    </button>
                  ) : isUpgrade ? (
                    <button
                      onClick={() => upgradeMutation.mutate(plan.tier)}
                      disabled={upgradeMutation.isPending}
                      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 disabled:opacity-50"
                    >
                      {upgradeMutation.isPending ? 'Upgrading...' : 'Upgrade'}
                    </button>
                  ) : isDowngrade ? (
                    <button disabled className="w-full px-4 py-2 border rounded-md text-sm text-gray-400 cursor-not-allowed">
                      Downgrade
                    </button>
                  ) : null}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
