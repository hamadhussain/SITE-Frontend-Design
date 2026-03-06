import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { builderApi } from '@/services/api'
import { SlidersHorizontal, X, GitCompareArrows } from 'lucide-react'

interface BuilderSummary {
  id: number
  name: string
  companyName: string
  city: string
  specializations: string | string[]
  isVerified: boolean
  isAvailable: boolean
  averageRating: number
  totalReviews: number
  totalProjectsCompleted: number
  yearsOfExperience: number
  bio: string
}

const cities = ['All Cities', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan']

const specializations = [
  'General Contracting',
  'Residential',
  'Commercial',
  'Renovation',
  'Plumbing',
  'Electrical',
  'HVAC',
  'Roofing',
  'Landscaping',
  'Interior Design',
]

function getSpecializations(raw: string | string[] | null | undefined): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

export default function BuilderSearch() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [sortBy, setSortBy] = useState<'rating' | 'projects' | 'reviews'>('rating')
  const [showFilters, setShowFilters] = useState(false)
  const [compareIds, setCompareIds] = useState<number[]>([])

  const toggleCompare = (id: number) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev
    )
  }

  // Advanced filters
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [minExperience, setMinExperience] = useState<string>('')
  const [maxExperience, setMaxExperience] = useState<string>('')
  const [minRating, setMinRating] = useState<string>('')
  const [availableOnly, setAvailableOnly] = useState(false)

  const cityParam = selectedCity === 'All Cities' ? undefined : selectedCity
  const hasAdvancedFilters = selectedSpecialization || minExperience || maxExperience || minRating || availableOnly

  const { data, isLoading, isError } = useQuery({
    queryKey: ['builders', cityParam, selectedSpecialization, minExperience, maxExperience, minRating, availableOnly],
    queryFn: () =>
      builderApi.searchBuilders({
        city: cityParam,
        specialization: selectedSpecialization || undefined,
        minExperience: minExperience ? Number(minExperience) : undefined,
        maxExperience: maxExperience ? Number(maxExperience) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
        isAvailable: availableOnly || undefined,
        size: 50,
      }).then((r) => r.data),
  })

  const allBuilders: BuilderSummary[] = data?.content || []

  const filteredBuilders = allBuilders
    .filter((builder) => {
      const specs = getSpecializations(builder.specializations)
      const matchesSearch =
        !searchTerm ||
        (builder.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (builder.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        specs.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.averageRating || 0) - (a.averageRating || 0)
      if (sortBy === 'projects') return (b.totalProjectsCompleted || 0) - (a.totalProjectsCompleted || 0)
      return (b.totalReviews || 0) - (a.totalReviews || 0)
    })

  const clearFilters = () => {
    setSelectedSpecialization('')
    setMinExperience('')
    setMaxExperience('')
    setMinRating('')
    setAvailableOnly(false)
    setSelectedCity('All Cities')
    setSearchTerm('')
  }

  const renderStars = (rating: number) => {
    const r = rating || 0
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= Math.floor(r) ? 'text-yellow-400' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
        <span className="text-sm text-gray-600 ml-1">{r.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">Find Builders</h1>
          <p className="text-gray-600">
            Browse verified construction professionals for your next project
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search by name, company or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <div className="flex gap-2">
                {[
                  { value: 'rating', label: 'Top Rated' },
                  { value: 'projects', label: 'Most Projects' },
                  { value: 'reviews', label: 'Most Reviews' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as typeof sortBy)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      sortBy === option.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm ${
                showFilters || hasAdvancedFilters
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasAdvancedFilters && (
                <span className="ml-1 bg-white text-primary rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                  !
                </span>
              )}
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Specialization</label>
                  <select
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Specializations</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Experience (years)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      min="0"
                      value={minExperience}
                      onChange={(e) => setMinExperience(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-gray-400">–</span>
                    <input
                      type="number"
                      placeholder="Max"
                      min="0"
                      value={maxExperience}
                      onChange={(e) => setMaxExperience(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Minimum Rating</label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Any Rating</option>
                    <option value="3">3+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer w-full text-sm hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={availableOnly}
                      onChange={(e) => setAvailableOnly(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    Available only
                  </label>
                </div>
              </div>
              {hasAdvancedFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-3 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Compare Bar */}
        {compareIds.length > 0 && (
          <div className="bg-primary text-primary-foreground rounded-lg p-3 mb-4 flex items-center justify-between">
            <span className="text-sm font-medium">{compareIds.length} builder{compareIds.length !== 1 ? 's' : ''} selected</span>
            <div className="flex gap-2">
              <button onClick={() => setCompareIds([])} className="px-3 py-1 text-sm border border-white/30 rounded hover:bg-white/10">
                Clear
              </button>
              <button
                onClick={() => navigate(`/builders/compare?ids=${compareIds.join(',')}`)}
                disabled={compareIds.length < 2}
                className="flex items-center gap-1.5 px-3 py-1 text-sm bg-white text-primary rounded font-medium disabled:opacity-50"
              >
                <GitCompareArrows className="h-4 w-4" />
                Compare
              </button>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="text-sm text-gray-600 mb-4">
          {isLoading ? 'Loading...' : `Showing ${filteredBuilders.length} builder${filteredBuilders.length !== 1 ? 's' : ''}`}
        </div>

        {/* States */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading builders...</p>
          </div>
        ) : isError ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-red-500">Failed to load builders. Please try again.</p>
          </div>
        ) : filteredBuilders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-medium mb-2">No builders found</h3>
            <p className="text-gray-500">Try adjusting your search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuilders.map((builder) => {
              const specs = getSpecializations(builder.specializations)
              return (
                <div
                  key={builder.id}
                  className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden ${compareIds.includes(builder.id) ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl flex-shrink-0">
                          👷
                        </div>
                        <input
                          type="checkbox"
                          checked={compareIds.includes(builder.id)}
                          onChange={() => toggleCompare(builder.id)}
                          className="absolute -top-1 -left-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          title="Select to compare"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">
                            {builder.companyName || builder.name}
                          </h3>
                          {builder.isVerified && (
                            <span className="text-blue-500 flex-shrink-0" title="Verified">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{builder.name}</p>
                        {builder.city && (
                          <p className="text-sm text-gray-500">📍 {builder.city}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      {renderStars(builder.averageRating)}
                      <p className="text-sm text-gray-500 mt-1">
                        {builder.totalReviews || 0} reviews • {builder.totalProjectsCompleted || 0} projects completed
                        {builder.yearsOfExperience > 0 && (
                          <> • {builder.yearsOfExperience} yrs exp</>
                        )}
                      </p>
                    </div>

                    {specs.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {specs.slice(0, 3).map((spec) => (
                          <span
                            key={spec}
                            className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                          >
                            {spec}
                          </span>
                        ))}
                        {specs.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
                            +{specs.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t flex gap-2">
                      <Link
                        to={`/builders/${builder.id}`}
                        className="flex-1 text-center px-4 py-2 border rounded-md hover:bg-gray-50 text-sm"
                      >
                        View Profile
                      </Link>
                      <Link
                        to="/login"
                        className="flex-1 text-center bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 text-sm"
                      >
                        Contact
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
