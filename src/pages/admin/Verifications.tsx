import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/services/api'
import { toast } from 'sonner'
import { CheckCircle, Clock } from 'lucide-react'

interface PendingBuilder {
  id: number
  userId: number
  name: string
  email: string
  city: string
  companyName: string
  yearsOfExperience: number
  createdAt: string
}

export default function Verifications() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['pending-verifications'],
    queryFn: () => adminApi.getPendingVerifications({ size: 50 }).then((r) => r.data),
  })

  const pendingBuilders: PendingBuilder[] = data?.content || []

  const verifyMutation = useMutation({
    mutationFn: (userId: number) => adminApi.verifyBuilder(userId),
    onSuccess: () => {
      toast.success('Builder verified successfully')
      queryClient.invalidateQueries({ queryKey: ['pending-verifications'] })
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] })
    },
    onError: () => toast.error('Failed to verify builder'),
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Builder Verifications</h1>
        <p className="text-gray-600">Review and approve builder verification requests</p>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-sm p-5 mb-6 flex items-center gap-4">
        <div className="bg-yellow-100 text-yellow-700 p-3 rounded-lg">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-bold">{pendingBuilders.length}</p>
          <p className="text-sm text-gray-500">Pending Verifications</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : pendingBuilders.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-300" />
            <p className="font-medium mb-1">All caught up!</p>
            <p className="text-sm">No pending verification requests.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-600">Builder</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600">Company</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600">City</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600">Experience</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600">Registered</th>
                <th className="px-6 py-3 text-right font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pendingBuilders.map((builder) => (
                <tr key={builder.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{builder.name}</div>
                    <div className="text-gray-500 text-xs">{builder.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {builder.companyName || <span className="text-gray-400 italic">Not set</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {builder.city || <span className="text-gray-400 italic">Unknown</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {builder.yearsOfExperience ? `${builder.yearsOfExperience} yrs` : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {builder.createdAt ? formatDate(builder.createdAt) : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => verifyMutation.mutate(builder.userId)}
                      disabled={verifyMutation.isPending}
                      className="px-4 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {verifyMutation.isPending ? 'Verifying...' : 'Verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
