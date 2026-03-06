import { useSearchParams, Link } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { builderApi } from '@/services/api'
import { ArrowLeft, Star, CheckCircle, XCircle } from 'lucide-react'

interface BuilderData {
  id: number
  name: string
  companyName: string
  city: string
  bio: string
  specializations: string | string[]
  skills: string | string[]
  isVerified: boolean
  isAvailable: boolean
  averageRating: number
  totalReviews: number
  totalProjectsCompleted: number
  yearsOfExperience: number
  hourlyRate: number | null
  subscriptionTier: string
  primaryTrade: string | null
}

function parseArr(raw: string | string[] | null | undefined): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  try { return JSON.parse(raw) } catch { return raw.split(',').map(s => s.trim()).filter(Boolean) }
}

function formatPKR(amount: number | null): string {
  if (!amount) return '—'
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount)
}

export default function BuilderComparison() {
  const [searchParams] = useSearchParams()
  const idsParam = searchParams.get('ids') || ''
  const ids = idsParam.split(',').map(Number).filter(n => n > 0).slice(0, 4)

  const queries = useQueries({
    queries: ids.map(id => ({
      queryKey: ['builder', id],
      queryFn: () => builderApi.getBuilder(id).then(r => r.data as BuilderData),
    })),
  })

  const isLoading = queries.some(q => q.isLoading)
  const builders = queries.map(q => q.data).filter(Boolean) as BuilderData[]

  if (ids.length < 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center max-w-md">
          <h2 className="text-lg font-bold mb-2">Select builders to compare</h2>
          <p className="text-gray-500 mb-4">Please select at least 2 builders from the search page.</p>
          <Link to="/builders" className="text-primary hover:underline">Back to Builder Search</Link>
        </div>
      </div>
    )
  }

  const renderStars = (rating: number) => {
    const r = rating || 0
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star key={star} className={`h-4 w-4 ${star <= Math.floor(r) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
        ))}
        <span className="text-sm text-gray-600 ml-1">{r.toFixed(1)}</span>
      </div>
    )
  }

  const boolCell = (val: boolean) =>
    val ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <XCircle className="h-5 w-5 text-gray-300 mx-auto" />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link to="/builders" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3">
            <ArrowLeft className="h-4 w-4" /> Back to Search
          </Link>
          <h1 className="text-3xl font-bold">Compare Builders</h1>
          <p className="text-gray-600 mt-1">Side-by-side comparison of {builders.length} builders</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading builder profiles...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left px-4 py-4 bg-gray-50 border-b font-medium text-gray-500 text-sm w-48">Attribute</th>
                  {builders.map(b => (
                    <th key={b.id} className="text-center px-4 py-4 bg-gray-50 border-b min-w-[200px]">
                      <div className="font-bold text-base">{b.companyName || b.name}</div>
                      <div className="text-sm text-gray-500 font-normal">{b.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {/* Rating */}
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">Rating</td>
                  {builders.map(b => (
                    <td key={b.id} className="px-4 py-3 text-center">
                      <div className="flex justify-center">{renderStars(b.averageRating)}</div>
                      <div className="text-xs text-gray-500 mt-1">{b.totalReviews} reviews</div>
                    </td>
                  ))}
                </tr>

                {/* Location */}
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">City</td>
                  {builders.map(b => (
                    <td key={b.id} className="px-4 py-3 text-center text-sm">{b.city || '—'}</td>
                  ))}
                </tr>

                {/* Experience */}
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">Experience</td>
                  {builders.map(b => (
                    <td key={b.id} className="px-4 py-3 text-center text-sm">
                      {b.yearsOfExperience > 0 ? `${b.yearsOfExperience} years` : '—'}
                    </td>
                  ))}
                </tr>

                {/* Primary Trade */}
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">Primary Trade</td>
                  {builders.map(b => (
                    <td key={b.id} className="px-4 py-3 text-center text-sm">{b.primaryTrade || '—'}</td>
                  ))}
                </tr>

                {/* Projects Completed */}
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">Projects Completed</td>
                  {builders.map(b => (
                    <td key={b.id} className="px-4 py-3 text-center text-sm font-semibold">{b.totalProjectsCompleted}</td>
                  ))}
                </tr>

                {/* Hourly Rate */}
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">Hourly Rate</td>
                  {builders.map(b => (
                    <td key={b.id} className="px-4 py-3 text-center text-sm">{formatPKR(b.hourlyRate)}</td>
                  ))}
                </tr>

                {/* Verified */}
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">Verified</td>
                  {builders.map(b => (
                    <td key={b.id} className="px-4 py-3">{boolCell(b.isVerified)}</td>
                  ))}
                </tr>

                {/* Available */}
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">Available Now</td>
                  {builders.map(b => (
                    <td key={b.id} className="px-4 py-3">{boolCell(b.isAvailable)}</td>
                  ))}
                </tr>

                {/* Subscription */}
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">Plan</td>
                  {builders.map(b => (
                    <td key={b.id} className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        b.subscriptionTier === 'ENTERPRISE' ? 'bg-purple-100 text-purple-800' :
                        b.subscriptionTier === 'PROFESSIONAL' ? 'bg-blue-100 text-blue-800' :
                        b.subscriptionTier === 'BASIC' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {b.subscriptionTier}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Specializations */}
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">Specializations</td>
                  {builders.map(b => {
                    const specs = parseArr(b.specializations)
                    return (
                      <td key={b.id} className="px-4 py-3 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {specs.length > 0 ? specs.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{s}</span>
                          )) : <span className="text-gray-400 text-sm">—</span>}
                        </div>
                      </td>
                    )
                  })}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">Actions</td>
                  {builders.map(b => (
                    <td key={b.id} className="px-4 py-3 text-center">
                      <Link
                        to={`/builders/${b.id}`}
                        className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90"
                      >
                        View Profile
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
