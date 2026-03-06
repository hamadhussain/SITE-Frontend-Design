import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { bidApi } from '@/services/api'
import { Bid, BidStatus } from '@/types'

const statusColors: Record<BidStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  SHORTLISTED: 'bg-purple-100 text-purple-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-gray-100 text-gray-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
}

const statusLabels: Record<BidStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
  EXPIRED: 'Expired',
}

export default function MyBids() {
  const [statusFilter, setStatusFilter] = useState<BidStatus | ''>('')
  const [page, setPage] = useState(0)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['builder-bids', statusFilter, page],
    queryFn: () =>
      bidApi.getBuilderBids({ status: statusFilter || undefined, page }).then(r => r.data),
  })

  const withdrawMutation = useMutation({
    mutationFn: (bidId: number) => bidApi.withdraw(bidId),
    onSuccess: () => {
      toast.success('Bid withdrawn successfully')
      queryClient.invalidateQueries({ queryKey: ['builder-bids'] })
    },
    onError: () => toast.error('Failed to withdraw bid'),
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const bids: Bid[] = data?.content || []
  const totalBids = data?.totalElements || 0

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Bids</h1>
          <p className="text-gray-600">Track and manage your project proposals</p>
        </div>
        <Link
          to="/builder/marketplace"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90"
        >
          Browse Projects
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Bids', value: totalBids, color: 'bg-gray-100' },
          { label: 'Pending', value: bids.filter(b => ['SUBMITTED', 'UNDER_REVIEW'].includes(b.status)).length, color: 'bg-blue-100' },
          { label: 'Shortlisted', value: bids.filter(b => b.status === 'SHORTLISTED').length, color: 'bg-purple-100' },
          { label: 'Won', value: bids.filter(b => b.status === 'ACCEPTED').length, color: 'bg-green-100' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-lg p-4 text-center`}>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as BidStatus | '')
              setPage(0)
            }}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Bids</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading bids...</p>
        </div>
      ) : bids.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">📋</div>
          <h3 className="text-lg font-medium mb-2">No bids found</h3>
          <p className="text-gray-500 mb-4">
            {statusFilter
              ? `You don't have any ${statusLabels[statusFilter].toLowerCase()} bids.`
              : 'Start bidding on projects to grow your business.'}
          </p>
          <Link
            to="/builder/marketplace"
            className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:opacity-90"
          >
            Browse Projects
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bids.map((bid: Bid) => (
            <div
              key={bid.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-semibold">{bid.projectTitle}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[bid.status]}`}>
                      {statusLabels[bid.status]}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{bid.proposal}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>💰 Your Bid: {formatCurrency(bid.amount)}</span>
                    <span>📅 Duration: {bid.estimatedDurationDays} days</span>
                    <span>🕐 Submitted: {formatDate(bid.createdAt)}</span>
                  </div>
                </div>

                <div className="text-right ml-4">
                  {bid.status === 'ACCEPTED' && (
                    <Link
                      to={`/builder/projects`}
                      className="inline-block bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                    >
                      View Project
                    </Link>
                  )}
                  {bid.status === 'SHORTLISTED' && (
                    <span className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-md text-sm">
                      Awaiting Decision
                    </span>
                  )}
                  {['SUBMITTED', 'UNDER_REVIEW'].includes(bid.status) && (
                    <button
                      onClick={() => withdrawMutation.mutate(bid.id)}
                      disabled={withdrawMutation.isPending}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50 disabled:opacity-50"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>

              {bid.status === 'ACCEPTED' && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <span>✓</span>
                    <span>Congratulations! Your bid was accepted on {formatDate(bid.updatedAt)}</span>
                  </div>
                </div>
              )}
              {bid.status === 'REJECTED' && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <span>✗</span>
                    <span>This bid was not selected. Keep trying!</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page + 1} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
            disabled={page >= data.totalPages - 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}






// import { useState } from 'react'
// import { Link } from 'react-router-dom'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { toast } from 'sonner'
// import { bidApi } from '@/services/api'
// import { Bid, BidStatus } from '@/types'

// const statusColors: Record<BidStatus, string> = {
//   DRAFT: 'bg-gray-100 text-gray-800',
//   SUBMITTED: 'bg-blue-100 text-blue-800',
//   UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
//   SHORTLISTED: 'bg-purple-100 text-purple-800',
//   ACCEPTED: 'bg-green-100 text-green-800',
//   REJECTED: 'bg-red-100 text-red-800',
//   WITHDRAWN: 'bg-gray-100 text-gray-800',
//   EXPIRED: 'bg-gray-100 text-gray-800',
// }

// const statusLabels: Record<BidStatus, string> = {
//   DRAFT: 'Draft',
//   SUBMITTED: 'Submitted',
//   UNDER_REVIEW: 'Under Review',
//   SHORTLISTED: 'Shortlisted',
//   ACCEPTED: 'Accepted',
//   REJECTED: 'Rejected',
//   WITHDRAWN: 'Withdrawn',
//   EXPIRED: 'Expired',
// }

// export default function MyBids() {
//   const [statusFilter, setStatusFilter] = useState<BidStatus | ''>('')
//   const [page, setPage] = useState(0)
//   const queryClient = useQueryClient()

//   const { data, isLoading } = useQuery({
//     queryKey: ['builder-bids', statusFilter, page],
//     queryFn: () =>
//       bidApi.getBuilderBids({ status: statusFilter || undefined, page }).then(r => r.data),
//   })

//   const withdrawMutation = useMutation({
//     mutationFn: (bidId: number) => bidApi.withdraw(bidId),
//     onSuccess: () => {
//       toast.success('Bid withdrawn successfully')
//       queryClient.invalidateQueries({ queryKey: ['builder-bids'] })
//     },
//     onError: () => toast.error('Failed to withdraw bid'),
//   })

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-PK', {
//       style: 'currency',
//       currency: 'PKR',
//       minimumFractionDigits: 0,
//     }).format(amount)
//   }

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-PK', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     })
//   }

//   const bids: Bid[] = data?.content || []
//   const totalBids = data?.totalElements || 0

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold">My Bids</h1>
//           <p className="text-gray-600">Track and manage your project proposals</p>
//         </div>
//         <Link
//           to="/builder/marketplace"
//           className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90"
//         >
//           Browse Projects
//         </Link>
//       </div>

//       {/* Stats Summary */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//         {[
//           { label: 'Total Bids', value: totalBids, color: 'bg-gray-100' },
//           { label: 'Pending', value: bids.filter(b => ['SUBMITTED', 'UNDER_REVIEW'].includes(b.status)).length, color: 'bg-blue-100' },
//           { label: 'Shortlisted', value: bids.filter(b => b.status === 'SHORTLISTED').length, color: 'bg-purple-100' },
//           { label: 'Won', value: bids.filter(b => b.status === 'ACCEPTED').length, color: 'bg-green-100' },
//         ].map((stat) => (
//           <div key={stat.label} className={`${stat.color} rounded-lg p-4 text-center`}>
//             <p className="text-2xl font-bold">{stat.value}</p>
//             <p className="text-sm text-gray-600">{stat.label}</p>
//           </div>
//         ))}
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
//         <div className="flex items-center gap-4">
//           <label className="text-sm font-medium">Filter by Status:</label>
//           <select
//             value={statusFilter}
//             onChange={(e) => {
//               setStatusFilter(e.target.value as BidStatus | '')
//               setPage(0)
//             }}
//             className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
//           >
//             <option value="">All Bids</option>
//             {Object.entries(statusLabels).map(([value, label]) => (
//               <option key={value} value={value}>
//                 {label}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Bids List */}
//       {isLoading ? (
//         <div className="text-center py-12">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
//           <p className="mt-2 text-gray-500">Loading bids...</p>
//         </div>
//       ) : bids.length === 0 ? (
//         <div className="bg-white rounded-lg shadow-sm p-12 text-center">
//           <div className="text-gray-400 text-5xl mb-4">📋</div>
//           <h3 className="text-lg font-medium mb-2">No bids found</h3>
//           <p className="text-gray-500 mb-4">
//             {statusFilter
//               ? `You don't have any ${statusLabels[statusFilter].toLowerCase()} bids.`
//               : 'Start bidding on projects to grow your business.'}
//           </p>
//           <Link
//             to="/builder/marketplace"
//             className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:opacity-90"
//           >
//             Browse Projects
//           </Link>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {bids.map((bid: Bid) => (
//             <div
//               key={bid.id}
//               className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
//             >
//               <div className="flex justify-between items-start">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-3 mb-2">
//                     <span className="text-lg font-semibold">{bid.projectTitle}</span>
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[bid.status]}`}>
//                       {statusLabels[bid.status]}
//                     </span>
//                   </div>

//                   <p className="text-gray-600 text-sm mb-3 line-clamp-2">{bid.proposal}</p>

//                   <div className="flex flex-wrap gap-4 text-sm text-gray-500">
//                     <span>💰 Your Bid: {formatCurrency(bid.amount)}</span>
//                     <span>📅 Duration: {bid.estimatedDuration} days</span>
//                     <span>🕐 Submitted: {formatDate(bid.createdAt)}</span>
//                   </div>
//                 </div>

//                 <div className="text-right ml-4">
//                   {bid.status === 'ACCEPTED' && (
//                     <Link
//                       to={`/builder/projects`}
//                       className="inline-block bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
//                     >
//                       View Project
//                     </Link>
//                   )}
//                   {bid.status === 'SHORTLISTED' && (
//                     <span className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-md text-sm">
//                       Awaiting Decision
//                     </span>
//                   )}
//                   {['SUBMITTED', 'UNDER_REVIEW'].includes(bid.status) && (
//                     <button
//                       onClick={() => withdrawMutation.mutate(bid.id)}
//                       disabled={withdrawMutation.isPending}
//                       className="px-4 py-2 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50 disabled:opacity-50"
//                     >
//                       Withdraw
//                     </button>
//                   )}
//                 </div>
//               </div>

//               {bid.status === 'ACCEPTED' && (
//                 <div className="mt-4 pt-4 border-t">
//                   <div className="flex items-center gap-2 text-sm text-green-600">
//                     <span>✓</span>
//                     <span>Congratulations! Your bid was accepted on {formatDate(bid.updatedAt)}</span>
//                   </div>
//                 </div>
//               )}
//               {bid.status === 'REJECTED' && (
//                 <div className="mt-4 pt-4 border-t">
//                   <div className="flex items-center gap-2 text-sm text-red-600">
//                     <span>✗</span>
//                     <span>This bid was not selected. Keep trying!</span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Pagination */}
//       {data && data.totalPages > 1 && (
//         <div className="flex justify-center gap-2 mt-6">
//           <button
//             onClick={() => setPage(p => Math.max(0, p - 1))}
//             disabled={page === 0}
//             className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//           >
//             Previous
//           </button>
//           <span className="px-4 py-2">
//             Page {page + 1} of {data.totalPages}
//           </span>
//           <button
//             onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
//             disabled={page >= data.totalPages - 1}
//             className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }
