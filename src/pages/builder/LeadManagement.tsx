import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { leadApi } from '@/services/api'
import { Coins, ArrowDownCircle, ArrowUpCircle, Gift, RefreshCw } from 'lucide-react'
import type { LeadTransaction, PageResponse } from '@/types'

export default function LeadManagement() {
  const [page, setPage] = useState(0)

  const { data: balanceData } = useQuery({
    queryKey: ['lead-credits-balance'],
    queryFn: () => leadApi.getCreditBalance().then(r => r.data as { credits: number; subscriptionTier: string }),
  })

  const { data: txData, isLoading } = useQuery({
    queryKey: ['lead-transactions', page],
    queryFn: () => leadApi.getTransactions({ page, size: 20 }).then(r => r.data as PageResponse<LeadTransaction>),
  })

  const transactions = txData?.content || []

  const typeConfig: Record<string, { icon: typeof Coins; color: string; label: string }> = {
    DEBIT: { icon: ArrowDownCircle, color: 'text-red-500', label: 'Used' },
    CREDIT: { icon: ArrowUpCircle, color: 'text-green-500', label: 'Purchased' },
    BONUS: { icon: Gift, color: 'text-purple-500', label: 'Bonus' },
    REFUND: { icon: RefreshCw, color: 'text-blue-500', label: 'Refunded' },
    SUBSCRIPTION_RENEWAL: { icon: ArrowUpCircle, color: 'text-green-500', label: 'Subscription' },
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Lead Credits</h1>

      {/* Balance Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-yellow-100 rounded-full">
            <Coins className="h-8 w-8 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Available Credits</p>
            <p className="text-3xl font-bold">{balanceData?.credits ?? '—'}</p>
            <p className="text-sm text-gray-400 mt-1">
              Plan: <span className="font-medium text-gray-600">{balanceData?.subscriptionTier || 'FREE'}</span>
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Each bid submission costs 1 lead credit. Upgrade your subscription for more monthly credits.
        </p>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold">Credit History</h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <Coins className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
            <p className="text-gray-500">Your credit usage will appear here when you submit bids.</p>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {transactions.map(tx => {
                const config = typeConfig[tx.transactionType] || typeConfig.DEBIT
                const Icon = config.icon
                return (
                  <div key={tx.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50">
                    <Icon className={`h-5 w-5 flex-shrink-0 ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description || config.label}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${tx.transactionType === 'DEBIT' ? 'text-red-600' : 'text-green-600'}`}>
                        {tx.transactionType === 'DEBIT' ? '-' : '+'}{tx.amount}
                      </p>
                      <p className="text-xs text-gray-400">Balance: {tx.balanceAfter}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {txData && txData.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <p className="text-sm text-gray-600">
                  Page {(txData.number || 0) + 1} of {txData.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={txData.first}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={txData.last}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
