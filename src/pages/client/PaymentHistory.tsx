import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { paymentApi } from '@/services/api'
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Clock } from 'lucide-react'
import type { Payment, PageResponse } from '@/types'

function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount)
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
}

const typeLabels: Record<string, string> = {
  ESCROW_FUND: 'Escrow Fund',
  MILESTONE_RELEASE: 'Milestone Release',
  REFUND: 'Refund',
  SUBSCRIPTION: 'Subscription',
  LEAD_CREDIT_PURCHASE: 'Lead Credits',
  INSPECTION_FEE: 'Inspection Fee',
  PLATFORM_FEE: 'Platform Fee',
}

export default function PaymentHistory() {
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(0)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payment-history', statusFilter, typeFilter, page],
    queryFn: () =>
      paymentApi.getHistory({
        status: statusFilter || undefined,
        paymentType: typeFilter || undefined,
        page,
        size: 20,
      }).then((r) => r.data as PageResponse<Payment>),
  })

  const payments = data?.content || []

  // Compute summary from current page
  const totalFunded = payments
    .filter((p) => p.paymentType === 'ESCROW_FUND' && p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0)
  const totalReleased = payments
    .filter((p) => p.paymentType === 'MILESTONE_RELEASE' && p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0)
  const totalPending = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full">
            <ArrowUpCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Funded</p>
            <p className="text-xl font-bold text-green-700">{formatPKR(totalFunded)}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <ArrowDownCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Released</p>
            <p className="text-xl font-bold text-blue-700">{formatPKR(totalReleased)}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-xl font-bold text-yellow-700">{formatPKR(totalPending)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-4 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0) }}
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Types</option>
            <option value="ESCROW_FUND">Escrow Fund</option>
            <option value="MILESTONE_RELEASE">Milestone Release</option>
            <option value="REFUND">Refund</option>
            <option value="SUBSCRIPTION">Subscription</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading payments...</p>
        </div>
      ) : isError ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-red-500">Failed to load payment history.</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No payments yet</h3>
          <p className="text-gray-500">Your payment history will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-500">
                    {payment.paymentReference}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {typeLabels[payment.paymentType] || payment.paymentType}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">
                    {payment.projectTitle || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-right">
                    {formatPKR(payment.amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[payment.status] || 'bg-gray-100'}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <p className="text-sm text-gray-600">
                Page {(data.number || 0) + 1} of {data.totalPages} ({data.totalElements} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={data.first}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={data.last}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
