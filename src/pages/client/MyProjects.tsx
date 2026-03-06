import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { projectApi } from '@/services/api'
import { Project, ProjectStatus } from '@/types'
import { CardSkeleton } from '@/components/ui/Skeleton'

const statusColors: Record<ProjectStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  OPEN: 'bg-blue-100 text-blue-800',
  BIDDING: 'bg-purple-100 text-purple-800',
  AWARDED: 'bg-yellow-100 text-yellow-800',
  CONTRACT_PENDING: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  ON_HOLD: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  DISPUTED: 'bg-red-100 text-red-800',
}

const statusLabels: Record<ProjectStatus, string> = {
  DRAFT: 'Draft',
  OPEN: 'Open',
  BIDDING: 'Accepting Bids',
  AWARDED: 'Awarded',
  CONTRACT_PENDING: 'Contract Pending',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  DISPUTED: 'Disputed',
}

export default function MyProjects() {
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('')
  const [page, setPage] = useState(0)

  const { data, isLoading, error } = useQuery({
    queryKey: ['client-projects', statusFilter, page],
    queryFn: async () => {
      const params: { status?: string; page: number } = { page }
      if (statusFilter) {
        params.status = statusFilter
      }
      const response = await projectApi.getClientProjects(params)
      return response.data
    },
  })

  const formatBudget = (min: number, max: number) => {
    const formatter = new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    return `${formatter.format(min)} - ${formatter.format(max)}`
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Projects</h1>
        <Link
          to="/client/projects/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90"
        >
          + Create Project
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ProjectStatus | '')
              setPage(0)
            }}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Projects</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load projects. Please try again.
        </div>
      ) : !data?.content?.length ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">📋</div>
          <h3 className="text-lg font-medium mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-4">
            Create your first project to start receiving bids from builders.
          </p>
          <Link
            to="/client/projects/new"
            className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:opacity-90"
          >
            Create Your First Project
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data?.content.map((project: Project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        to={`/client/projects/${project.id}`}
                        className="text-lg font-semibold hover:text-primary"
                      >
                        {project.title}
                      </Link>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[project.status]
                        }`}
                      >
                        {statusLabels[project.status]}
                      </span>
                      {project.isUrgent && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>📍 {project.city}</span>
                      <span>💰 {formatBudget(project.budgetMin, project.budgetMax)}</span>
                      {project.deadline && (
                        <span>📅 Deadline: {formatDate(project.deadline)}</span>
                      )}
                      <span>📝 {project.bidCount || 0} bids</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-sm font-medium">{formatDate(project.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page + 1} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                disabled={page >= data.totalPages - 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
