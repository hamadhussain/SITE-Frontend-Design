import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { projectApi } from '@/services/api'
import { Project } from '@/types'

const categories = [
  { id: '', name: 'All Categories' },
  { id: '1', name: 'New Construction' },
  { id: '2', name: 'Renovation' },
  { id: '3', name: 'Interior Design' },
  { id: '4', name: 'Kitchen Remodeling' },
  { id: '5', name: 'Bathroom Remodeling' },
  { id: '6', name: 'Painting' },
  { id: '7', name: 'Plumbing' },
  { id: '8', name: 'Electrical' },
]

const cities = ['All Cities', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan']

export default function Marketplace() {
  const [filters, setFilters] = useState({
    city: '',
    categoryId: '',
    minBudget: '',
    maxBudget: '',
  })
  const [page, setPage] = useState(0)

  const { data, isLoading, error } = useQuery({
    queryKey: ['marketplace-projects', filters, page],
    queryFn: async () => {
      const response = await projectApi.searchProjects({
        city: filters.city || undefined,
        categoryId: filters.categoryId ? Number(filters.categoryId) : undefined,
        minBudget: filters.minBudget ? Number(filters.minBudget) : undefined,
        maxBudget: filters.maxBudget ? Number(filters.maxBudget) : undefined,
        page,
      })
      return response.data
    },
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

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  const clearFilters = () => {
    setFilters({ city: '', categoryId: '', minBudget: '', maxBudget: '' })
    setPage(0)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Project Marketplace</h1>
        <p className="text-gray-600">Browse and bid on available projects</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <select
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {cities.map((city) => (
              <option key={city} value={city === 'All Cities' ? '' : city}>
                {city}
              </option>
            ))}
          </select>

          <select
            value={filters.categoryId}
            onChange={(e) => handleFilterChange('categoryId', e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min Budget (PKR)"
            value={filters.minBudget}
            onChange={(e) => handleFilterChange('minBudget', e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="number"
            placeholder="Max Budget (PKR)"
            value={filters.maxBudget}
            onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            onClick={clearFilters}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading projects...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load projects. Please try again.
        </div>
      ) : data?.content.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-gray-500">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-600 mb-4">
            Found {data?.totalElements || 0} projects
          </div>

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
                        to={`/builder/projects/${project.id}`}
                        className="text-lg font-semibold hover:text-primary"
                      >
                        {project.title}
                      </Link>
                      {project.isUrgent && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Urgent
                        </span>
                      )}
                      {project.requiresInspection && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Inspection Required
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>📍 {project.city}</span>
                      <span>📁 {project.categoryName}</span>
                      <span>💰 {formatCurrency(project.budgetMin)} - {formatCurrency(project.budgetMax)}</span>
                      {project.deadline && <span>📅 Due: {formatDate(project.deadline)}</span>}
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <p className="text-sm text-gray-500">{getTimeAgo(project.createdAt)}</p>
                    <p className="text-sm font-medium mt-1">{project.bidCount || 0} bids</p>
                    <Link
                      to={`/builder/projects/${project.id}`}
                      className="inline-block mt-3 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:opacity-90"
                    >
                      View & Bid
                    </Link>
                  </div>
                </div>

                {/* Client Info */}
                <div className="mt-4 pt-4 border-t flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    👤
                  </div>
                  <div>
                    <p className="text-sm font-medium">{project.clientName || 'Anonymous Client'}</p>
                    {project.clientProjectCount !== undefined && (
                      <p className="text-xs text-gray-500">
                        {project.clientProjectCount} projects posted
                      </p>
                    )}
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
