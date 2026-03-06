import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { builderApi } from '@/services/api'
import { toast } from 'sonner'

export default function BuilderProfile() {
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['builder-my-profile'],
    queryFn: () => builderApi.getMyProfile().then((r) => r.data),
  })

  const [form, setForm] = useState({
    companyName: '',
    bio: '',
    yearsOfExperience: '',
    hourlyRate: '',
    minimumProjectValue: '',
    specializations: '',
    skills: '',
    serviceAreas: '',
    isAvailable: true,
    portfolioDescription: '',
  })

  // Pre-fill form when data loads
  useEffect(() => {
    if (!profileData) return
    const parseJson = (v: string | null) => {
      if (!v) return ''
      try {
        const arr = JSON.parse(v)
        return Array.isArray(arr) ? arr.join(', ') : v
      } catch {
        return v
      }
    }
    setForm({
      companyName: profileData.companyName || '',
      bio: profileData.bio || '',
      yearsOfExperience: String(profileData.yearsOfExperience || ''),
      hourlyRate: String(profileData.hourlyRate || ''),
      minimumProjectValue: String(profileData.minimumProjectValue || ''),
      specializations: parseJson(profileData.specializations),
      skills: parseJson(profileData.skills),
      serviceAreas: parseJson(profileData.serviceAreas),
      isAvailable: profileData.isAvailable ?? true,
      portfolioDescription: profileData.portfolioDescription || '',
    })
  }, [profileData])

  const updateMutation = useMutation({
    mutationFn: () => {
      const toJsonArray = (v: string) =>
        JSON.stringify(v.split(',').map((s) => s.trim()).filter(Boolean))

      return builderApi.updateMyProfile({
        companyName: form.companyName || undefined,
        bio: form.bio || undefined,
        yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        minimumProjectValue: form.minimumProjectValue ? Number(form.minimumProjectValue) : undefined,
        specializations: form.specializations ? toJsonArray(form.specializations) : undefined,
        skills: form.skills ? toJsonArray(form.skills) : undefined,
        serviceAreas: form.serviceAreas ? toJsonArray(form.serviceAreas) : undefined,
        isAvailable: form.isAvailable,
        portfolioDescription: form.portfolioDescription || undefined,
      })
    },
    onSuccess: () => toast.success('Profile updated successfully'),
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || 'Failed to update profile'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Builder Profile</h1>
        <p className="text-gray-600">Manage your business profile visible to clients</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-lg">Business Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input
                type="number"
                min="0"
                max="50"
                value={form.yearsOfExperience}
                onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. 5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (PKR)</label>
              <input
                type="number"
                min="0"
                value={form.hourlyRate}
                onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. 2500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Project Value (PKR)</label>
              <input
                type="number"
                min="0"
                value={form.minimumProjectValue}
                onChange={(e) => setForm({ ...form, minimumProjectValue: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. 50000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Describe your experience, expertise, and what makes you stand out..."
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Available for Projects</label>
            <button
              type="button"
              onClick={() => setForm({ ...form, isAvailable: !form.isAvailable })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.isAvailable ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  form.isAvailable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-gray-500">
              {form.isAvailable ? 'Available' : 'Not available'}
            </span>
          </div>
        </div>

        {/* Skills & Areas */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-lg">Skills & Service Areas</h2>
          <p className="text-sm text-gray-500">Separate multiple values with commas</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specializations</label>
            <input
              type="text"
              value={form.specializations}
              onChange={(e) => setForm({ ...form, specializations: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="New Construction, Renovation, Interior Design"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <input
              type="text"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Plumbing, Electrical, Tiling, Painting"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Areas (Cities)</label>
            <input
              type="text"
              value={form.serviceAreas}
              onChange={(e) => setForm({ ...form, serviceAreas: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Karachi, Hyderabad, Thatta"
            />
          </div>
        </div>

        {/* Portfolio */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-lg">Portfolio</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Description</label>
            <textarea
              value={form.portfolioDescription}
              onChange={(e) => setForm({ ...form, portfolioDescription: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Describe your past projects and achievements..."
            />
          </div>
        </div>

        {/* Read-only stats */}
        {profileData && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Account Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{profileData.totalProjectsCompleted || 0}</p>
                <p className="text-sm text-gray-500">Projects Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{Number(profileData.averageRating || 0).toFixed(1)}</p>
                <p className="text-sm text-gray-500">Average Rating</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{profileData.totalReviews || 0}</p>
                <p className="text-sm text-gray-500">Total Reviews</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{profileData.leadCredits || 0}</p>
                <p className="text-sm text-gray-500">Lead Credits</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-8 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
