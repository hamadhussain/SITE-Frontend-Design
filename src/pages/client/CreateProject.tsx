import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { projectApi, budgetApi } from '@/services/api'
import BudgetBreakdownChart from '@/components/project/BudgetBreakdownChart'
import { Check, ChevronLeft, ChevronRight, Calculator, Loader2 } from 'lucide-react'
import type { BudgetEstimateResponse } from '@/types'

const TOTAL_STEPS = 7

const projectTypes = ['Residential', 'Commercial', 'Renovation', 'Industrial', 'Interior Design']

const categories = [
  { id: 1, name: 'New Construction' },
  { id: 2, name: 'Renovation' },
  { id: 3, name: 'Interior Design' },
  { id: 4, name: 'Kitchen Remodeling' },
  { id: 5, name: 'Bathroom Remodeling' },
  { id: 6, name: 'Painting' },
  { id: 7, name: 'Plumbing' },
  { id: 8, name: 'Electrical' },
]

const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta']

const trades = [
  'Civil', 'Electrical', 'Plumbing', 'HVAC', 'Painting',
  'Flooring', 'Roofing', 'Landscaping', 'Interior Design',
  'Kitchen Remodeling', 'Bathroom Remodeling',
]

const stepLabels = [
  'Project Type',
  'Basic Info',
  'Location',
  'Trades',
  'Budget',
  'Timeline & Options',
  'Review',
]

function formatPKR(amount: number | string): string {
  const num = typeof amount === 'string' ? Number(amount) : amount
  if (!num || isNaN(num)) return 'PKR 0'
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(num)
}

export default function CreateProject() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [budgetEstimate, setBudgetEstimate] = useState<BudgetEstimateResponse | null>(null)

  const [formData, setFormData] = useState({
    // Step 1: Project Type
    projectType: '',
    areaSqFt: '',
    // Step 2: Basic Info
    title: '',
    description: '',
    categoryId: '',
    // Step 3: Location
    city: '',
    locationAddress: '',
    // Step 4: Trades
    selectedTrades: [] as string[],
    requiredSkills: [] as string[],
    // Step 5: Budget
    budgetMin: '',
    budgetMax: '',
    // Step 6: Timeline & Options
    deadline: '',
    estimatedDurationDays: '',
    isUrgent: false,
    requiresInspection: false,
    allowPartialBids: false,
    isPublic: true,
    specialRequirements: '',
    // Step 7: Documents (URLs for now)
    attachmentUrls: [] as string[],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    })
  }

  const toggleTrade = (trade: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTrades: prev.selectedTrades.includes(trade)
        ? prev.selectedTrades.filter((t) => t !== trade)
        : [...prev.selectedTrades, trade],
    }))
  }

  // Budget estimate mutation
  const estimateMutation = useMutation({
    mutationFn: () =>
      budgetApi.getEstimate({
        projectType: formData.projectType,
        areaSqFt: Number(formData.areaSqFt) || 1000,
        trades: formData.selectedTrades,
        city: formData.city || 'Karachi',
      }).then((r) => r.data),
    onSuccess: (data: BudgetEstimateResponse) => {
      setBudgetEstimate(data)
      setFormData((prev) => ({
        ...prev,
        budgetMin: String(Math.round(data.estimatedTotal * 0.85)),
        budgetMax: String(Math.round(data.estimatedTotal * 1.15)),
        estimatedDurationDays: String(data.timelineEstimateDays),
      }))
      toast.success('Budget estimate calculated!')
    },
    onError: () => {
      toast.error('Failed to calculate estimate')
    },
  })

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: () =>
      projectApi.create({
        projectType: formData.projectType,
        areaSqFt: formData.areaSqFt ? Number(formData.areaSqFt) : null,
        trades: formData.selectedTrades,
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        city: formData.city,
        locationAddress: formData.locationAddress,
        budgetMin: Number(formData.budgetMin),
        budgetMax: Number(formData.budgetMax),
        deadline: formData.deadline || null,
        estimatedDurationDays: formData.estimatedDurationDays ? Number(formData.estimatedDurationDays) : null,
        requiredSkills: formData.selectedTrades,
        isUrgent: formData.isUrgent,
        requiresInspection: formData.requiresInspection,
        allowPartialBids: formData.allowPartialBids,
        isPublic: formData.isPublic,
        specialRequirements: formData.specialRequirements || null,
        attachmentUrls: formData.attachmentUrls.length > 0 ? formData.attachmentUrls : null,
        estimatedBudgetFromTool: budgetEstimate?.estimatedTotal || null,
      }),
    onSuccess: () => {
      toast.success('Project created successfully!')
      navigate('/client/projects')
    },
    onError: () => {
      toast.error('Failed to create project. Please check all required fields.')
    },
  })

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return !!formData.projectType
      case 2: return formData.title.length >= 10 && formData.description.length >= 50
      case 3: return !!formData.city
      case 4: return true // trades are optional
      case 5: return !!formData.budgetMin && !!formData.budgetMax
      case 6: return true // options are optional
      case 7: return true
      default: return false
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Project</h1>

      {/* Progress Steps */}
      <div className="flex items-center mb-8 overflow-x-auto pb-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div key={s} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step > s
                    ? 'bg-green-500 text-white'
                    : step === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              <span className={`text-xs mt-1 whitespace-nowrap ${step === s ? 'text-primary font-medium' : 'text-gray-400'}`}>
                {stepLabels[s - 1]}
              </span>
            </div>
            {s < TOTAL_STEPS && (
              <div className={`w-8 h-0.5 mx-1 mt-[-12px] ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Step 1: Project Type */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">What type of project?</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {projectTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, projectType: type })}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    formData.projectType === type
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Approximate Area (sq ft)</label>
              <input
                type="number"
                name="areaSqFt"
                value={formData.areaSqFt}
                onChange={handleChange}
                min="100"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., 1500"
              />
            </div>
          </div>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Project Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Kitchen Renovation in DHA Phase 5"
              />
              <p className="text-xs text-gray-400 mt-1">{formData.title.length}/200 characters (min 10)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description <span className="text-red-500">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe your project requirements in detail..."
              />
              <p className="text-xs text-gray-400 mt-1">{formData.description.length}/5000 characters (min 50)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Project Location</h2>

            <div>
              <label className="block text-sm font-medium mb-1">City <span className="text-red-500">*</span></label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select city</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Street Address</label>
              <input
                type="text"
                name="locationAddress"
                value={formData.locationAddress}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="House/Plot #, Street, Area"
              />
            </div>
          </div>
        )}

        {/* Step 4: Trade Selection */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Select Required Trades</h2>
            <p className="text-sm text-gray-500 mb-2">Choose the trades/specializations needed for your project.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {trades.map((trade) => (
                <button
                  key={trade}
                  onClick={() => toggleTrade(trade)}
                  className={`p-3 border-2 rounded-lg text-sm text-center transition-colors ${
                    formData.selectedTrades.includes(trade)
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {formData.selectedTrades.includes(trade) && <Check className="h-3 w-3 inline mr-1" />}
                  {trade}
                </button>
              ))}
            </div>

            {formData.selectedTrades.length > 0 && (
              <p className="text-sm text-gray-600">
                Selected: {formData.selectedTrades.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Step 5: Budget */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Budget</h2>

            {/* Budget Estimator Button */}
            {formData.projectType && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-blue-800">Budget Estimator</h3>
                    <p className="text-xs text-blue-600">
                      Get an AI-free rule-based estimate based on {formData.projectType}, {formData.areaSqFt || '1000'} sq ft
                      {formData.city && `, ${formData.city}`}
                    </p>
                  </div>
                  <button
                    onClick={() => estimateMutation.mutate()}
                    disabled={estimateMutation.isPending}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    {estimateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Calculator className="h-4 w-4" />
                    )}
                    {estimateMutation.isPending ? 'Calculating...' : 'Get Estimate'}
                  </button>
                </div>

                {budgetEstimate && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-blue-700">Estimated Total:</span>
                      <span className="text-xl font-bold text-blue-800">{formatPKR(budgetEstimate.estimatedTotal)}</span>
                    </div>
                    <BudgetBreakdownChart estimate={budgetEstimate} />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Budget (PKR) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="budgetMin"
                  value={formData.budgetMin}
                  onChange={handleChange}
                  min="1000"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="50,000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Maximum Budget (PKR) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="budgetMax"
                  value={formData.budgetMax}
                  onChange={handleChange}
                  min="1000"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="100,000"
                />
              </div>
            </div>

            {formData.budgetMin && formData.budgetMax && (
              <p className="text-sm text-gray-600">
                Budget range: {formatPKR(formData.budgetMin)} – {formatPKR(formData.budgetMax)}
              </p>
            )}
          </div>
        )}

        {/* Step 6: Timeline & Options */}
        {step === 6 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Timeline & Options</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estimated Duration (days)</label>
                <input
                  type="number"
                  name="estimatedDurationDays"
                  value={formData.estimatedDurationDays}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={budgetEstimate ? String(budgetEstimate.timelineEstimateDays) : 'e.g., 90'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Special Requirements</label>
              <textarea
                name="specialRequirements"
                value={formData.specialRequirements}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Any special requirements or notes for builders..."
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3">
                <input type="checkbox" name="isUrgent" checked={formData.isUrgent} onChange={handleChange} className="rounded" />
                <div>
                  <span className="font-medium text-sm">Urgent Project</span>
                  <p className="text-xs text-gray-500">Higher visibility to builders</p>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" name="requiresInspection" checked={formData.requiresInspection} onChange={handleChange} className="rounded" />
                <div>
                  <span className="font-medium text-sm">Require Professional Inspection</span>
                  <p className="text-xs text-gray-500">Mandatory quality inspection at milestones</p>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" name="allowPartialBids" checked={formData.allowPartialBids} onChange={handleChange} className="rounded" />
                <div>
                  <span className="font-medium text-sm">Allow Partial Bids</span>
                  <p className="text-xs text-gray-500">Builders can bid on specific trades only</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Step 7: Review & Submit */}
        {step === 7 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Review & Submit</h2>

            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-sm text-gray-500 mb-2">PROJECT TYPE</h3>
                <p>{formData.projectType || 'Not specified'}</p>
                {formData.areaSqFt && <p className="text-sm text-gray-600">{formData.areaSqFt} sq ft</p>}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-sm text-gray-500 mb-2">BASIC INFO</h3>
                <p className="font-medium">{formData.title}</p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">{formData.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-sm text-gray-500 mb-2">LOCATION</h3>
                  <p>{formData.city}</p>
                  {formData.locationAddress && <p className="text-sm text-gray-600">{formData.locationAddress}</p>}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-sm text-gray-500 mb-2">BUDGET</h3>
                  <p>{formatPKR(formData.budgetMin)} – {formatPKR(formData.budgetMax)}</p>
                </div>
              </div>

              {formData.selectedTrades.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-sm text-gray-500 mb-2">TRADES</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedTrades.map((t) => (
                      <span key={t} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-sm text-gray-500 mb-2">OPTIONS</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  {formData.deadline && <span className="px-2 py-1 bg-gray-200 rounded-full">Deadline: {formData.deadline}</span>}
                  {formData.estimatedDurationDays && <span className="px-2 py-1 bg-gray-200 rounded-full">{formData.estimatedDurationDays} days</span>}
                  {formData.isUrgent && <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">Urgent</span>}
                  {formData.requiresInspection && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Inspection Required</span>}
                  {formData.allowPartialBids && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Partial Bids</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-6 border-t">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 px-5 py-2 border rounded-md hover:bg-gray-50 text-sm"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
          ) : (
            <div />
          )}
          <div>
            {step < TOTAL_STEPS ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-1 bg-primary text-primary-foreground px-5 py-2 rounded-md hover:opacity-90 disabled:opacity-50 text-sm"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:opacity-90 disabled:opacity-50 text-sm"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Project'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
