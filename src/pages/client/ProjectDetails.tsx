import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { projectApi, bidApi, milestoneApi, reviewApi, chatApi, contractApi, paymentApi } from '@/services/api'
import { Bid, Milestone, ProjectStatus, BidStatus, MilestoneStatus, Contract, ContractStatus, EscrowBalance } from '@/types'
import { MessageSquare, Star, FileText, CheckCircle, Clock, Shield, Wallet, GitPullRequest } from 'lucide-react'
import MilestoneTimeline from '@/components/project/MilestoneTimeline'
import ChangeRequestForm from '@/components/project/ChangeRequestForm'
import ReasonDialog from '@/components/ui/ReasonDialog'

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

const bidStatusColors: Record<BidStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  SHORTLISTED: 'bg-purple-100 text-purple-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-gray-100 text-gray-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
}

const milestoneStatusColors: Record<MilestoneStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-purple-100 text-purple-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  PAYMENT_PENDING: 'bg-orange-100 text-orange-800',
  PAYMENT_RELEASED: 'bg-green-100 text-green-800',
  DISPUTED: 'bg-red-100 text-red-800',
}

const contractStatusColors: Record<ContractStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING_CLIENT: 'bg-orange-100 text-orange-800',
  PENDING_BUILDER: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-green-100 text-green-800',
  TERMINATED: 'bg-red-100 text-red-800',
  DISPUTED: 'bg-red-100 text-red-800',
}

type TabKey = 'overview' | 'bids' | 'contract' | 'milestones' | 'updates' | 'changes' | 'chat' | 'review'

export default function ProjectDetails() {
  const { id } = useParams()
  const projectId = Number(id ?? 0)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [fundAmount, setFundAmount] = useState('')
  const [showFundModal, setShowFundModal] = useState(false)
  const [rejectingMilestoneId, setRejectingMilestoneId] = useState<number | null>(null)

  // Review form state
  const [review, setReview] = useState({
    overallRating: 0,
    qualityRating: 0,
    communicationRating: 0,
    timelinessRating: 0,
    comment: '',
  })

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getProject(projectId).then(r => r.data),
    enabled: !!projectId,
  })

  const { data: bids } = useQuery({
    queryKey: ['project-bids', projectId],
    queryFn: () => bidApi.getProjectBids(projectId).then(r => r.data),
    enabled: !!projectId && activeTab === 'bids',
  })

  const { data: milestones } = useQuery({
    queryKey: ['project-milestones', projectId],
    queryFn: () => milestoneApi.getProjectMilestones(projectId).then(r => r.data),
    enabled: !!projectId && (activeTab === 'milestones' || activeTab === 'updates'),
  })

  const { data: contract } = useQuery<Contract>({
    queryKey: ['project-contract', projectId],
    queryFn: () => contractApi.getContract(projectId).then(r => r.data),
    enabled: !!projectId && activeTab === 'contract',
  })

  const { data: escrowBalance } = useQuery<EscrowBalance>({
    queryKey: ['escrow-balance', id],
    queryFn: () => paymentApi.getEscrowBalance(projectId).then(r => r.data),
    enabled: !!projectId && activeTab === 'milestones',
  })

  const approveMilestoneMutation = useMutation({
    mutationFn: (milestoneId: number) => milestoneApi.approve(milestoneId),
    onSuccess: () => {
      toast.success('Milestone approved!')
      queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] })
    },
    onError: () => toast.error('Failed to approve milestone'),
  })

  const rejectMilestoneMutation = useMutation({
    mutationFn: ({ milestoneId, reason }: { milestoneId: number; reason: string }) =>
      milestoneApi.reject(milestoneId, reason),
    onSuccess: () => {
      toast.success('Milestone rejected.')
      queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] })
    },
    onError: () => toast.error('Failed to reject milestone'),
  })

  const awardMutation = useMutation({
    mutationFn: ({ projectId, bidId }: { projectId: number; bidId: number }) =>
      projectApi.award(projectId, bidId),
    onSuccess: () => {
      toast.success('Project awarded successfully!')
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project-bids', projectId] })
    },
    onError: () => toast.error('Failed to award project'),
  })

  const publishMutation = useMutation({
    mutationFn: (projectId: number) => projectApi.publish(projectId),
    onSuccess: () => {
      toast.success('Project published successfully!')
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
    onError: () => toast.error('Failed to publish project'),
  })

  const openChatMutation = useMutation({
    mutationFn: (builderUserId: number) => chatApi.createDirectRoom(builderUserId),
    onSuccess: () => navigate('/client/messages'),
    onError: () => toast.error('Failed to open chat'),
  })

  const signContractMutation = useMutation({
    mutationFn: () => contractApi.signContract(projectId),
    onSuccess: () => {
      toast.success('Contract signed successfully!')
      queryClient.invalidateQueries({ queryKey: ['project-contract', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
    onError: () => toast.error('Failed to sign contract'),
  })

  const fundEscrowMutation = useMutation({
    mutationFn: (amount: number) => paymentApi.fundEscrow(projectId, amount),
    onSuccess: () => {
      toast.success('Escrow funded successfully!')
      setShowFundModal(false)
      setFundAmount('')
      queryClient.invalidateQueries({ queryKey: ['escrow-balance', projectId] })
    },
    onError: () => toast.error('Failed to fund escrow'),
  })

  const releasePaymentMutation = useMutation({
    mutationFn: (milestoneId: number) => paymentApi.releasePayment(milestoneId),
    onSuccess: () => {
      toast.success('Payment released!')
      queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] })
      queryClient.invalidateQueries({ queryKey: ['escrow-balance', projectId] })
    },
    onError: () => toast.error('Failed to release payment'),
  })

  const submitReviewMutation = useMutation({
    mutationFn: () =>
      reviewApi.createReview(projectId, {
        overallRating: review.overallRating,
        qualityRating: review.qualityRating || undefined,
        communicationRating: review.communicationRating || undefined,
        timelinessRating: review.timelinessRating || undefined,
        comment: review.comment || undefined,
      }),
    onSuccess: () => {
      toast.success('Review submitted!')
      queryClient.invalidateQueries({ queryKey: [projectId] })
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || 'Failed to submit review'),
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
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading project...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
        <h2 className="text-lg font-semibold mb-2">Project not found</h2>
        <Link to="/client/projects" className="text-primary hover:underline">
          Back to My Projects
        </Link>
      </div>
    )
  }

  return (
    <div>
      <ReasonDialog
        isOpen={rejectingMilestoneId !== null}
        title="Rejection Reason"
        placeholder="Enter rejection reason..."
        onConfirm={(reason) => {
          if (rejectingMilestoneId !== null) {
            rejectMilestoneMutation.mutate({ milestoneId: rejectingMilestoneId, reason })
            setRejectingMilestoneId(null)
          }
        }}
        onCancel={() => setRejectingMilestoneId(null)}
      />
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{project.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status as ProjectStatus] || 'bg-gray-100 text-gray-800'}`}>
                {String(project.status).replace(/_/g, ' ')}
              </span>
              {project.isUrgent && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Urgent
                </span>
              )}
            </div>
            <p className="text-gray-500">
              Project #{project.projectNumber} • Created {formatDate(project.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            {project.status === 'DRAFT' && (
              <button
                onClick={() => publishMutation.mutate(project.id)}
                disabled={publishMutation.isPending}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
              >
                {publishMutation.isPending ? 'Publishing...' : 'Publish Project'}
              </button>
            )}
            <Link
              to="/client/projects"
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b">
          <nav className="flex -mb-px overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'bids', label: `Bids (${project.bidCount || 0})` },
              { key: 'contract', label: 'Contract', icon: FileText },
              { key: 'milestones', label: 'Milestones' },
              { key: 'updates', label: 'Updates' },
              { key: 'changes', label: 'Change Requests', icon: GitPullRequest },
              { key: 'chat', label: 'Messages' },
              ...(project.status === 'COMPLETED' ? [{ key: 'review', label: 'Leave Review' }] : []),
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Project Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Description:</span>
                    <p className="mt-1">{project.description}</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span>{project.categoryName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span>{project.city}</span>
                  </div>
                  {project.locationAddress && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Address:</span>
                      <span>{project.locationAddress}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Budget & Timeline</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Budget Range:</span>
                    <span className="font-medium">
                      {formatCurrency(project.budgetMin)} - {formatCurrency(project.budgetMax)}
                    </span>
                  </div>
                  {project.deadline && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Deadline:</span>
                      <span>{formatDate(project.deadline)}</span>
                    </div>
                  )}
                  {project.finalBudget && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Awarded Amount:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(project.finalBudget)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bids Tab */}
          {activeTab === 'bids' && (
            <div>
              {!bids?.length ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No bids received yet.</p>
                  {project.status === 'DRAFT' && (
                    <p className="mt-2">Publish your project to start receiving bids.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid: Bid) => (
                    <div key={bid.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{bid.builderName}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${bidStatusColors[bid.status]}`}>
                              {bid.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{bid.proposal}</p>
                          <div className="flex gap-4 text-sm text-gray-500">
                            <span>Amount: {formatCurrency(bid.amount)}</span>
                            <span>Duration: {bid.estimatedDurationDays} days</span>
                          </div>
                        </div>
                        {project.status === 'BIDDING' && bid.status === 'SUBMITTED' && (
                          <button
                            onClick={() => awardMutation.mutate({ projectId: project.id, bidId: bid.id })}
                            disabled={awardMutation.isPending}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            Award Project
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contract Tab */}
          {activeTab === 'contract' && (
            <div>
              {!contract || contract.message ? (
                <div className="text-center py-10">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No contract generated yet.</p>
                  <p className="text-sm text-gray-400 mt-1">A contract will be generated when the project is awarded.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Contract Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Contract {contract.contractNumber}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Total Amount: <span className="font-semibold text-gray-800">{formatCurrency(contract.totalAmount)}</span>
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${contractStatusColors[contract.status]}`}>
                      {contract.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {contract.clientSignedAt ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                        <span className="font-medium">Client Signature</span>
                      </div>
                      {contract.clientSignedAt ? (
                        <p className="text-sm text-green-600">Signed on {formatDate(contract.clientSignedAt)}</p>
                      ) : (
                        <p className="text-sm text-gray-500">Awaiting signature</p>
                      )}
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {contract.builderSignedAt ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                        <span className="font-medium">Builder Signature</span>
                      </div>
                      {contract.builderSignedAt ? (
                        <p className="text-sm text-green-600">Signed on {formatDate(contract.builderSignedAt)}</p>
                      ) : (
                        <p className="text-sm text-gray-500">Awaiting signature</p>
                      )}
                    </div>
                  </div>

                  {/* Sign Button */}
                  {contract.status === 'PENDING_CLIENT' && !contract.clientSignedAt && (
                    <button
                      onClick={() => signContractMutation.mutate()}
                      disabled={signContractMutation.isPending}
                      className="w-full bg-primary text-primary-foreground py-3 rounded-md hover:opacity-90 disabled:opacity-50 font-medium"
                    >
                      {signContractMutation.isPending ? 'Signing...' : 'Sign Contract'}
                    </button>
                  )}

                  {/* Contract Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Start Date:</span>
                        <p className="font-medium">{formatDate(contract.startDate)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">End Date:</span>
                        <p className="font-medium">{formatDate(contract.endDate)}</p>
                      </div>
                    </div>

                    {contract.scopeOfWork && (
                      <div>
                        <h4 className="font-medium mb-2">Scope of Work</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{contract.scopeOfWork}</p>
                      </div>
                    )}

                    {contract.termsAndConditions && (
                      <div>
                        <h4 className="font-medium mb-2">Terms & Conditions</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{contract.termsAndConditions}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Milestones Tab */}
          {activeTab === 'milestones' && (
            <div>
              {/* Escrow Balance Card */}
              {escrowBalance && !escrowBalance.message && (
                <div className="border rounded-lg p-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Escrow Account
                    </h4>
                    <button
                      onClick={() => setShowFundModal(true)}
                      className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:opacity-90"
                    >
                      Fund Escrow
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total Funded</p>
                      <p className="font-semibold text-lg">{formatCurrency(escrowBalance.totalFunded)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Released</p>
                      <p className="font-semibold text-lg">{formatCurrency(escrowBalance.totalReleased)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Balance</p>
                      <p className="font-semibold text-lg text-green-600">{formatCurrency(escrowBalance.currentBalance)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Fund Escrow Modal */}
              {showFundModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="font-semibold text-lg mb-4">Fund Escrow</h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount (PKR)</label>
                      <input
                        type="number"
                        min="1"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const amount = parseFloat(fundAmount)
                          if (!amount || amount <= 0) {
                            toast.error('Please enter a valid amount')
                            return
                          }
                          fundEscrowMutation.mutate(amount)
                        }}
                        disabled={fundEscrowMutation.isPending}
                        className="flex-1 bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 disabled:opacity-50"
                      >
                        {fundEscrowMutation.isPending ? 'Processing...' : 'Fund'}
                      </button>
                      <button
                        onClick={() => { setShowFundModal(false); setFundAmount('') }}
                        className="flex-1 border py-2 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!milestones?.length ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No milestones defined yet.</p>
                  <p className="mt-2">Milestones will be created after the project is awarded.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone: Milestone, index: number) => (
                    <div key={milestone.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-gray-400 text-sm">#{index + 1}</span>
                            <span className="font-semibold">{milestone.title}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${milestoneStatusColors[milestone.status]}`}>
                              {milestone.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {milestone.description && (
                            <p className="text-gray-600 text-sm mb-2">{milestone.description}</p>
                          )}
                          <div className="flex gap-4 text-sm text-gray-500">
                            <span>Amount: {formatCurrency(milestone.paymentAmount)}</span>
                            {milestone.dueDate && <span>Due: {formatDate(milestone.dueDate)}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {(milestone.status === 'COMPLETED' || milestone.status === 'UNDER_REVIEW') && (
                            <>
                              <button
                                onClick={() => approveMilestoneMutation.mutate(milestone.id)}
                                disabled={approveMilestoneMutation.isPending}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectingMilestoneId(milestone.id)}
                                disabled={rejectMilestoneMutation.isPending}
                                className="border border-red-600 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-50 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {(milestone.status === 'APPROVED' || milestone.status === 'PAYMENT_PENDING') && (
                            <button
                              onClick={() => releasePaymentMutation.mutate(milestone.id)}
                              disabled={releasePaymentMutation.isPending}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                            >
                              {releasePaymentMutation.isPending ? 'Releasing...' : 'Release Payment'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Updates Tab */}
          {activeTab === 'updates' && (
            <div>
              {!milestones?.length ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No milestones yet. Updates will appear once milestones are created.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {milestones.map((milestone: Milestone) => (
                    <div key={milestone.id} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">{milestone.title}</h4>
                      {/* FIX: Added canPost prop to satisfy TypeScript */}
                      <MilestoneTimeline milestoneId={milestone.id} canPost={false} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Change Requests Tab */}
          {activeTab === 'changes' && (
            /* FIX: Pass userRole correctly or omit if your component uses a different prop name */
            <ChangeRequestForm projectId={projectId} />
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="text-center py-10">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              {project.awardedBuilder ? (
                <>
                  <p className="font-medium text-gray-800 mb-1">
                    Chat with {project.awardedBuilder.name}
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Open the conversation in the Messages section.
                  </p>
                  <button
                    onClick={() => openChatMutation.mutate(project.awardedBuilder!.id)}
                    disabled={openChatMutation.isPending}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
                  >
                    {openChatMutation.isPending ? 'Opening...' : 'Open Chat'}
                  </button>
                </>
              ) : (
                <>
                  <p className="font-medium text-gray-700 mb-1">No builder assigned yet</p>
                  <p className="text-sm text-gray-500">
                    Chat will be available once the project is awarded.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Review Tab */}
          {activeTab === 'review' && (
            <div className="max-w-xl">
              {submitReviewMutation.isSuccess ? (
                <div className="text-center py-10">
                  <div className="text-green-500 text-5xl mb-3">★</div>
                  <h3 className="font-semibold text-lg mb-1">Review Submitted!</h3>
                  <p className="text-gray-500">Thank you for rating your builder.</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!review.overallRating) {
                      toast.error('Please select an overall rating')
                      return
                    }
                    submitReviewMutation.mutate()
                  }}
                  className="space-y-5"
                >
                  <h3 className="font-semibold text-lg">
                    Rate {project.awardedBuilder?.name || 'your builder'}
                  </h3>

                  {[
                    { key: 'overallRating', label: 'Overall Rating *' },
                    { key: 'qualityRating', label: 'Quality of Work' },
                    { key: 'communicationRating', label: 'Communication' },
                    { key: 'timelinessRating', label: 'Timeliness' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReview({ ...review, [key]: star })}
                            className={`text-2xl transition-colors ${
                              star <= (review[key as keyof typeof review] as number)
                                ? 'text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-300'
                            }`}
                          >
                            <Star className="h-7 w-7" fill={star <= (review[key as keyof typeof review] as number) ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                    <textarea
                      value={review.comment}
                      onChange={(e) => setReview({ ...review, comment: e.target.value })}
                      rows={4}
                      placeholder="Share your experience with this builder..."
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitReviewMutation.isPending}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
                  >
                    {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}












// import { useState } from 'react'
// import { useParams, Link, useNavigate } from 'react-router-dom'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { toast } from 'sonner'
// import { projectApi, bidApi, milestoneApi, reviewApi, chatApi, contractApi, paymentApi } from '@/services/api'
// import { Bid, Milestone, ProjectStatus, BidStatus, MilestoneStatus, Contract, ContractStatus, EscrowBalance } from '@/types'
// import { MessageSquare, Star, FileText, CheckCircle, Clock, Shield, Wallet, GitPullRequest } from 'lucide-react'
// import MilestoneTimeline from '@/components/project/MilestoneTimeline'
// import ChangeRequestForm from '@/components/project/ChangeRequestForm'
// import ReasonDialog from '@/components/ui/ReasonDialog'

// const statusColors: Record<ProjectStatus, string> = {
//   DRAFT: 'bg-gray-100 text-gray-800',
//   OPEN: 'bg-blue-100 text-blue-800',
//   BIDDING: 'bg-purple-100 text-purple-800',
//   AWARDED: 'bg-yellow-100 text-yellow-800',
//   CONTRACT_PENDING: 'bg-amber-100 text-amber-800',
//   IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
//   ON_HOLD: 'bg-orange-100 text-orange-800',
//   COMPLETED: 'bg-green-100 text-green-800',
//   CANCELLED: 'bg-red-100 text-red-800',
//   DISPUTED: 'bg-red-100 text-red-800',
// }

// const bidStatusColors: Record<BidStatus, string> = {
//   DRAFT: 'bg-gray-100 text-gray-800',
//   SUBMITTED: 'bg-blue-100 text-blue-800',
//   UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
//   SHORTLISTED: 'bg-purple-100 text-purple-800',
//   ACCEPTED: 'bg-green-100 text-green-800',
//   REJECTED: 'bg-red-100 text-red-800',
//   WITHDRAWN: 'bg-gray-100 text-gray-800',
//   EXPIRED: 'bg-gray-100 text-gray-800',
// }

// const milestoneStatusColors: Record<MilestoneStatus, string> = {
//   PENDING: 'bg-gray-100 text-gray-800',
//   IN_PROGRESS: 'bg-blue-100 text-blue-800',
//   COMPLETED: 'bg-yellow-100 text-yellow-800',
//   UNDER_REVIEW: 'bg-purple-100 text-purple-800',
//   APPROVED: 'bg-green-100 text-green-800',
//   REJECTED: 'bg-red-100 text-red-800',
//   PAYMENT_PENDING: 'bg-orange-100 text-orange-800',
//   PAYMENT_RELEASED: 'bg-green-100 text-green-800',
//   DISPUTED: 'bg-red-100 text-red-800',
// }

// const contractStatusColors: Record<ContractStatus, string> = {
//   DRAFT: 'bg-gray-100 text-gray-800',
//   PENDING_CLIENT: 'bg-orange-100 text-orange-800',
//   PENDING_BUILDER: 'bg-yellow-100 text-yellow-800',
//   ACTIVE: 'bg-green-100 text-green-800',
//   COMPLETED: 'bg-green-100 text-green-800',
//   TERMINATED: 'bg-red-100 text-red-800',
//   DISPUTED: 'bg-red-100 text-red-800',
// }

// type TabKey = 'overview' | 'bids' | 'contract' | 'milestones' | 'updates' | 'changes' | 'chat' | 'review'

// export default function ProjectDetails() {
// const { id } = useParams()
// const projectId = Number(id ?? 0)
//   const navigate = useNavigate()
//   const queryClient = useQueryClient()
//   const [activeTab, setActiveTab] = useState<TabKey>('overview')
//   const [fundAmount, setFundAmount] = useState('')
//   const [showFundModal, setShowFundModal] = useState(false)
//   const [rejectingMilestoneId, setRejectingMilestoneId] = useState<number | null>(null)

//   // Review form state
//   const [review, setReview] = useState({
//     overallRating: 0,
//     qualityRating: 0,
//     communicationRating: 0,
//     timelinessRating: 0,
//     comment: '',
//   })

//   const { data: project, isLoading, error } = useQuery({
//     queryKey: ['project', projectId],
//     queryFn: () => projectApi.getProject(projectId).then(r => r.data),
//     enabled: !!projectId,
//   })

//   const { data: bids } = useQuery({
//     queryKey: ['project-bids', projectId],
//     queryFn: () => bidApi.getProjectBids(projectId).then(r => r.data),
//     enabled: !!projectId && activeTab === 'bids',
//   })

//   const { data: milestones } = useQuery({
//     queryKey: ['project-milestones', projectId],
//     queryFn: () => milestoneApi.getProjectMilestones(projectId).then(r => r.data),
//     enabled: !!projectId && (activeTab === 'milestones' || activeTab === 'updates'),
//   })

//   const { data: contract } = useQuery<Contract>({
//     queryKey: ['project-contract', projectId],
//     queryFn: () => contractApi.getContract(projectId).then(r => r.data),
//     enabled: !!projectId && activeTab === 'contract',
//   })

//   const { data: escrowBalance } = useQuery<EscrowBalance>({
//     queryKey: ['escrow-balance', id],
//     queryFn: () => paymentApi.getEscrowBalance(projectId).then(r => r.data),
//     enabled: !!projectId && activeTab === 'milestones',
//   })

//   const approveMilestoneMutation = useMutation({
//     mutationFn: (milestoneId: number) => milestoneApi.approve(milestoneId),
//     onSuccess: () => {
//       toast.success('Milestone approved!')
//       queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] })
//     },
//     onError: () => toast.error('Failed to approve milestone'),
//   })

//   const rejectMilestoneMutation = useMutation({
//     mutationFn: ({ milestoneId, reason }: { milestoneId: number; reason: string }) =>
//       milestoneApi.reject(milestoneId, reason),
//     onSuccess: () => {
//       toast.success('Milestone rejected.')
//       queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] })
//     },
//     onError: () => toast.error('Failed to reject milestone'),
//   })

//   const awardMutation = useMutation({
//     mutationFn: ({ projectId, bidId }: { projectId: number; bidId: number }) =>
//       projectApi.award(projectId, bidId),
//     onSuccess: () => {
//       toast.success('Project awarded successfully!')
//       queryClient.invalidateQueries({ queryKey: ['project', projectId] })
//       queryClient.invalidateQueries({ queryKey: ['project-bids', projectId] })
//     },
//     onError: () => toast.error('Failed to award project'),
//   })

//   const publishMutation = useMutation({
//     mutationFn: (projectId: number) => projectApi.publish(projectId),
//     onSuccess: () => {
//       toast.success('Project published successfully!')
//       queryClient.invalidateQueries({ queryKey: ['project', projectId] })
//     },
//     onError: () => toast.error('Failed to publish project'),
//   })

//   const openChatMutation = useMutation({
//     mutationFn: (builderUserId: number) => chatApi.createDirectRoom(builderUserId),
//     onSuccess: () => navigate('/client/messages'),
//     onError: () => toast.error('Failed to open chat'),
//   })

//   const signContractMutation = useMutation({
//     mutationFn: () => contractApi.signContract(projectId),
//     onSuccess: () => {
//       toast.success('Contract signed successfully!')
//       queryClient.invalidateQueries({ queryKey: ['project-contract', projectId] })
//       queryClient.invalidateQueries({ queryKey: ['project', projectId] })
//     },
//     onError: () => toast.error('Failed to sign contract'),
//   })

//   const fundEscrowMutation = useMutation({
//     mutationFn: (amount: number) => paymentApi.fundEscrow(projectId, amount),
//     onSuccess: () => {
//       toast.success('Escrow funded successfully!')
//       setShowFundModal(false)
//       setFundAmount('')
//       queryClient.invalidateQueries({ queryKey: ['escrow-balance', projectId] })
//     },
//     onError: () => toast.error('Failed to fund escrow'),
//   })

//   const releasePaymentMutation = useMutation({
//     mutationFn: (milestoneId: number) => paymentApi.releasePayment(milestoneId),
//     onSuccess: () => {
//       toast.success('Payment released!')
//       queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] })
//       queryClient.invalidateQueries({ queryKey: ['escrow-balance', projectId] })
//     },
//     onError: () => toast.error('Failed to release payment'),
//   })

//   const submitReviewMutation = useMutation({
//     mutationFn: () =>
//       reviewApi.createReview(projectId, {
//         overallRating: review.overallRating,
//         qualityRating: review.qualityRating || undefined,
//         communicationRating: review.communicationRating || undefined,
//         timelinessRating: review.timelinessRating || undefined,
//         comment: review.comment || undefined,
//       }),
//     onSuccess: () => {
//       toast.success('Review submitted!')
//       queryClient.invalidateQueries({ queryKey: [projectId] })
//     },
//     onError: (err: any) =>
//       toast.error(err?.response?.data?.message || 'Failed to submit review'),
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
//       month: 'long',
//       day: 'numeric',
//     })
//   }

//   if (isLoading) {
//     return (
//       <div className="text-center py-12">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
//         <p className="mt-2 text-gray-500">Loading project...</p>
//       </div>
//     )
//   }

//   if (error || !project) {
//     return (
//       <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
//         <h2 className="text-lg font-semibold mb-2">Project not found</h2>
//         <Link to="/client/projects" className="text-primary hover:underline">
//           Back to My Projects
//         </Link>
//       </div>
//     )
//   }

//   return (
//     <div>
//       <ReasonDialog
//         isOpen={rejectingMilestoneId !== null}
//         title="Rejection Reason"
//         placeholder="Enter rejection reason..."
//         onConfirm={(reason) => {
//           if (rejectingMilestoneId !== null) {
//             rejectMilestoneMutation.mutate({ milestoneId: rejectingMilestoneId, reason })
//             setRejectingMilestoneId(null)
//           }
//         }}
//         onCancel={() => setRejectingMilestoneId(null)}
//       />
//       {/* Header */}
//       <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//         <div className="flex justify-between items-start">
//           <div>
//             <div className="flex items-center gap-3 mb-2">
//               <h1 className="text-2xl font-bold">{project.title}</h1>
//               <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status as ProjectStatus] || 'bg-gray-100 text-gray-800'}`}>
//                 {String(project.status).replace(/_/g, ' ')}
//               </span>
//               {project.isUrgent && (
//                 <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
//                   Urgent
//                 </span>
//               )}
//             </div>
//             <p className="text-gray-500">
//               Project #{project.projectNumber} • Created {formatDate(project.createdAt)}
//             </p>
//           </div>
//           <div className="flex gap-2">
//             {project.status === 'DRAFT' && (
//               <button
//                 onClick={() => publishMutation.mutate(project.id)}
//                 disabled={publishMutation.isPending}
//                 className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
//               >
//                 {publishMutation.isPending ? 'Publishing...' : 'Publish Project'}
//               </button>
//             )}
//             <Link
//               to="/client/projects"
//               className="px-4 py-2 border rounded-md hover:bg-gray-50"
//             >
//               Back to Projects
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="bg-white rounded-lg shadow-sm mb-6">
//         <div className="border-b">
//           <nav className="flex -mb-px overflow-x-auto">
//             {[
//               { key: 'overview', label: 'Overview' },
//               { key: 'bids', label: `Bids (${project.bidCount || 0})` },
//               { key: 'contract', label: 'Contract', icon: FileText },
//               { key: 'milestones', label: 'Milestones' },
//               { key: 'updates', label: 'Updates' },
//               { key: 'changes', label: 'Change Requests', icon: GitPullRequest },
//               { key: 'chat', label: 'Messages' },
//               ...(project.status === 'COMPLETED' ? [{ key: 'review', label: 'Leave Review' }] : []),
//             ].map((tab) => (
//               <button
//                 key={tab.key}
//                 onClick={() => setActiveTab(tab.key as TabKey)}
//                 className={`px-6 py-3 text-sm font-medium border-b-2 ${
//                   activeTab === tab.key
//                     ? 'border-primary text-primary'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 {tab.label}
//               </button>
//             ))}
//           </nav>
//         </div>

//         <div className="p-6">
//           {/* Overview Tab */}
//           {activeTab === 'overview' && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <h3 className="font-semibold mb-3">Project Details</h3>
//                 <div className="space-y-3 text-sm">
//                   <div>
//                     <span className="text-gray-500">Description:</span>
//                     <p className="mt-1">{project.description}</p>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Category:</span>
//                     <span>{project.categoryName}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Location:</span>
//                     <span>{project.city}</span>
//                   </div>
//                   {project.locationAddress && (
//                     <div className="flex justify-between">
//                       <span className="text-gray-500">Address:</span>
//                       <span>{project.locationAddress}</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <div>
//                 <h3 className="font-semibold mb-3">Budget & Timeline</h3>
//                 <div className="space-y-3 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Budget Range:</span>
//                     <span className="font-medium">
//                       {formatCurrency(project.budgetMin)} - {formatCurrency(project.budgetMax)}
//                     </span>
//                   </div>
//                   {project.deadline && (
//                     <div className="flex justify-between">
//                       <span className="text-gray-500">Deadline:</span>
//                       <span>{formatDate(project.deadline)}</span>
//                     </div>
//                   )}
//                   {project.finalBudget && (
//                     <div className="flex justify-between">
//                       <span className="text-gray-500">Awarded Amount:</span>
//                       <span className="font-medium text-green-600">
//                         {formatCurrency(project.finalBudget)}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Bids Tab */}
//           {activeTab === 'bids' && (
//             <div>
//               {!bids?.length ? (
//                 <div className="text-center py-8 text-gray-500">
//                   <p>No bids received yet.</p>
//                   {project.status === 'DRAFT' && (
//                     <p className="mt-2">Publish your project to start receiving bids.</p>
//                   )}
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {bids.map((bid: Bid) => (
//                     <div key={bid.id} className="border rounded-lg p-4">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <div className="flex items-center gap-2 mb-2">
//                             <span className="font-semibold">{bid.builderName}</span>
//                             <span className={`px-2 py-0.5 rounded-full text-xs ${bidStatusColors[bid.status]}`}>
//                               {bid.status}
//                             </span>
//                           </div>
//                           <p className="text-gray-600 text-sm mb-2">{bid.proposal}</p>
//                           <div className="flex gap-4 text-sm text-gray-500">
//                             <span>Amount: {formatCurrency(bid.amount)}</span>
//                             <span>Duration: {bid.estimatedDurationDays} days</span>
//                           </div>
//                         </div>
//                         {project.status === 'BIDDING' && bid.status === 'SUBMITTED' && (
//                           <button
//                             onClick={() => awardMutation.mutate({ projectId: project.id, bidId: bid.id })}
//                             disabled={awardMutation.isPending}
//                             className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
//                           >
//                             Award Project
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Contract Tab */}
//           {activeTab === 'contract' && (
//             <div>
//               {!contract || contract.message ? (
//                 <div className="text-center py-10">
//                   <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
//                   <p className="text-gray-500">No contract generated yet.</p>
//                   <p className="text-sm text-gray-400 mt-1">A contract will be generated when the project is awarded.</p>
//                 </div>
//               ) : (
//                 <div className="space-y-6">
//                   {/* Contract Header */}
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h3 className="font-semibold text-lg flex items-center gap-2">
//                         <Shield className="h-5 w-5" />
//                         Contract {contract.contractNumber}
//                       </h3>
//                       <p className="text-sm text-gray-500 mt-1">
//                         Total Amount: <span className="font-semibold text-gray-800">{formatCurrency(contract.totalAmount)}</span>
//                       </p>
//                     </div>
//                     <span className={`px-3 py-1 rounded-full text-sm font-medium ${contractStatusColors[contract.status]}`}>
//                       {contract.status.replace(/_/g, ' ')}
//                     </span>
//                   </div>

//                   {/* Signatures */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="border rounded-lg p-4">
//                       <div className="flex items-center gap-2 mb-2">
//                         {contract.clientSignedAt ? (
//                           <CheckCircle className="h-5 w-5 text-green-500" />
//                         ) : (
//                           <Clock className="h-5 w-5 text-gray-400" />
//                         )}
//                         <span className="font-medium">Client Signature</span>
//                       </div>
//                       {contract.clientSignedAt ? (
//                         <p className="text-sm text-green-600">Signed on {formatDate(contract.clientSignedAt)}</p>
//                       ) : (
//                         <p className="text-sm text-gray-500">Awaiting signature</p>
//                       )}
//                     </div>
//                     <div className="border rounded-lg p-4">
//                       <div className="flex items-center gap-2 mb-2">
//                         {contract.builderSignedAt ? (
//                           <CheckCircle className="h-5 w-5 text-green-500" />
//                         ) : (
//                           <Clock className="h-5 w-5 text-gray-400" />
//                         )}
//                         <span className="font-medium">Builder Signature</span>
//                       </div>
//                       {contract.builderSignedAt ? (
//                         <p className="text-sm text-green-600">Signed on {formatDate(contract.builderSignedAt)}</p>
//                       ) : (
//                         <p className="text-sm text-gray-500">Awaiting signature</p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Sign Button */}
//                   {contract.status === 'PENDING_CLIENT' && !contract.clientSignedAt && (
//                     <button
//                       onClick={() => signContractMutation.mutate()}
//                       disabled={signContractMutation.isPending}
//                       className="w-full bg-primary text-primary-foreground py-3 rounded-md hover:opacity-90 disabled:opacity-50 font-medium"
//                     >
//                       {signContractMutation.isPending ? 'Signing...' : 'Sign Contract'}
//                     </button>
//                   )}

//                   {/* Contract Details */}
//                   <div className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4 text-sm">
//                       <div>
//                         <span className="text-gray-500">Start Date:</span>
//                         <p className="font-medium">{formatDate(contract.startDate)}</p>
//                       </div>
//                       <div>
//                         <span className="text-gray-500">End Date:</span>
//                         <p className="font-medium">{formatDate(contract.endDate)}</p>
//                       </div>
//                     </div>

//                     {contract.scopeOfWork && (
//                       <div>
//                         <h4 className="font-medium mb-2">Scope of Work</h4>
//                         <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{contract.scopeOfWork}</p>
//                       </div>
//                     )}

//                     {contract.termsAndConditions && (
//                       <div>
//                         <h4 className="font-medium mb-2">Terms & Conditions</h4>
//                         <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{contract.termsAndConditions}</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Milestones Tab */}
//           {activeTab === 'milestones' && (
//             <div>
//               {/* Escrow Balance Card */}
//               {escrowBalance && !escrowBalance.message && (
//                 <div className="border rounded-lg p-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
//                   <div className="flex items-center justify-between mb-3">
//                     <h4 className="font-semibold flex items-center gap-2">
//                       <Wallet className="h-5 w-5" />
//                       Escrow Account
//                     </h4>
//                     <button
//                       onClick={() => setShowFundModal(true)}
//                       className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:opacity-90"
//                     >
//                       Fund Escrow
//                     </button>
//                   </div>
//                   <div className="grid grid-cols-3 gap-4 text-sm">
//                     <div>
//                       <p className="text-gray-500">Total Funded</p>
//                       <p className="font-semibold text-lg">{formatCurrency(escrowBalance.totalFunded)}</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-500">Released</p>
//                       <p className="font-semibold text-lg">{formatCurrency(escrowBalance.totalReleased)}</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-500">Balance</p>
//                       <p className="font-semibold text-lg text-green-600">{formatCurrency(escrowBalance.currentBalance)}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Fund Escrow Modal */}
//               {showFundModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                   <div className="bg-white rounded-lg p-6 w-full max-w-md">
//                     <h3 className="font-semibold text-lg mb-4">Fund Escrow</h3>
//                     <div className="mb-4">
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Amount (PKR)</label>
//                       <input
//                         type="number"
//                         min="1"
//                         value={fundAmount}
//                         onChange={(e) => setFundAmount(e.target.value)}
//                         placeholder="Enter amount"
//                         className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
//                       />
//                     </div>
//                     <div className="flex gap-3">
//                       <button
//                         onClick={() => {
//                           const amount = parseFloat(fundAmount)
//                           if (!amount || amount <= 0) {
//                             toast.error('Please enter a valid amount')
//                             return
//                           }
//                           fundEscrowMutation.mutate(amount)
//                         }}
//                         disabled={fundEscrowMutation.isPending}
//                         className="flex-1 bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 disabled:opacity-50"
//                       >
//                         {fundEscrowMutation.isPending ? 'Processing...' : 'Fund'}
//                       </button>
//                       <button
//                         onClick={() => { setShowFundModal(false); setFundAmount('') }}
//                         className="flex-1 border py-2 rounded-md hover:bg-gray-50"
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {!milestones?.length ? (
//                 <div className="text-center py-8 text-gray-500">
//                   <p>No milestones defined yet.</p>
//                   <p className="mt-2">Milestones will be created after the project is awarded.</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {milestones.map((milestone: Milestone, index: number) => (
//                     <div key={milestone.id} className="border rounded-lg p-4">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <div className="flex items-center gap-2 mb-2">
//                             <span className="text-gray-400 text-sm">#{index + 1}</span>
//                             <span className="font-semibold">{milestone.title}</span>
//                             <span className={`px-2 py-0.5 rounded-full text-xs ${milestoneStatusColors[milestone.status]}`}>
//                               {milestone.status.replace(/_/g, ' ')}
//                             </span>
//                           </div>
//                           {milestone.description && (
//                             <p className="text-gray-600 text-sm mb-2">{milestone.description}</p>
//                           )}
//                           <div className="flex gap-4 text-sm text-gray-500">
//                             <span>Amount: {formatCurrency(milestone.paymentAmount)}</span>
//                             {milestone.dueDate && <span>Due: {formatDate(milestone.dueDate)}</span>}
//                           </div>
//                         </div>
//                         <div className="flex gap-2">
//                           {(milestone.status === 'COMPLETED' || milestone.status === 'UNDER_REVIEW') && (
//                             <>
//                               <button
//                                 onClick={() => approveMilestoneMutation.mutate(milestone.id)}
//                                 disabled={approveMilestoneMutation.isPending}
//                                 className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
//                               >
//                                 Approve
//                               </button>
//                               <button
//                                 onClick={() => setRejectingMilestoneId(milestone.id)}
//                                 disabled={rejectMilestoneMutation.isPending}
//                                 className="border border-red-600 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-50 disabled:opacity-50"
//                               >
//                                 Reject
//                               </button>
//                             </>
//                           )}
//                           {(milestone.status === 'APPROVED' || milestone.status === 'PAYMENT_PENDING') && (
//                             <button
//                               onClick={() => releasePaymentMutation.mutate(milestone.id)}
//                               disabled={releasePaymentMutation.isPending}
//                               className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
//                             >
//                               {releasePaymentMutation.isPending ? 'Releasing...' : 'Release Payment'}
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Updates Tab */}
//           {activeTab === 'updates' && (
//             <div>
//               {!milestones?.length ? (
//                 <div className="text-center py-8 text-gray-500">
//                   <p>No milestones yet. Updates will appear once milestones are created.</p>
//                 </div>
//               ) : (
//                 <div className="space-y-6">
//                   {milestones.map((milestone: Milestone) => (
//                     <div key={milestone.id} className="border rounded-lg p-4">
//                       <h4 className="font-semibold mb-3">{milestone.title}</h4>
//                       <MilestoneTimeline milestoneId={milestone.id} />
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Change Requests Tab */}
//           {activeTab === 'changes' && (
//             <ChangeRequestForm projectId={projectId} userRole="CLIENT" />
//           )}

//           {/* Chat Tab */}
//           {activeTab === 'chat' && (
//             <div className="text-center py-10">
//               <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
//               {project.awardedBuilder ? (
//                 <>
//                   <p className="font-medium text-gray-800 mb-1">
//                     Chat with {project.awardedBuilder.name}
//                   </p>
//                   <p className="text-sm text-gray-500 mb-6">
//                     Open the conversation in the Messages section.
//                   </p>
//                   <button
//                     onClick={() => openChatMutation.mutate(project.awardedBuilder!.id)}
//                     disabled={openChatMutation.isPending}
//                     className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
//                   >
//                     {openChatMutation.isPending ? 'Opening...' : 'Open Chat'}
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <p className="font-medium text-gray-700 mb-1">No builder assigned yet</p>
//                   <p className="text-sm text-gray-500">
//                     Chat will be available once the project is awarded.
//                   </p>
//                 </>
//               )}
//             </div>
//           )}

//           {/* Review Tab */}
//           {activeTab === 'review' && (
//             <div className="max-w-xl">
//               {submitReviewMutation.isSuccess ? (
//                 <div className="text-center py-10">
//                   <div className="text-green-500 text-5xl mb-3">★</div>
//                   <h3 className="font-semibold text-lg mb-1">Review Submitted!</h3>
//                   <p className="text-gray-500">Thank you for rating your builder.</p>
//                 </div>
//               ) : (
//                 <form
//                   onSubmit={(e) => {
//                     e.preventDefault()
//                     if (!review.overallRating) {
//                       toast.error('Please select an overall rating')
//                       return
//                     }
//                     submitReviewMutation.mutate()
//                   }}
//                   className="space-y-5"
//                 >
//                   <h3 className="font-semibold text-lg">
//                     Rate {project.awardedBuilder?.name || 'your builder'}
//                   </h3>

//                   {[
//                     { key: 'overallRating', label: 'Overall Rating *' },
//                     { key: 'qualityRating', label: 'Quality of Work' },
//                     { key: 'communicationRating', label: 'Communication' },
//                     { key: 'timelinessRating', label: 'Timeliness' },
//                   ].map(({ key, label }) => (
//                     <div key={key}>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//                       <div className="flex gap-2">
//                         {[1, 2, 3, 4, 5].map((star) => (
//                           <button
//                             key={star}
//                             type="button"
//                             onClick={() => setReview({ ...review, [key]: star })}
//                             className={`text-2xl transition-colors ${
//                               star <= (review[key as keyof typeof review] as number)
//                                 ? 'text-yellow-400'
//                                 : 'text-gray-300 hover:text-yellow-300'
//                             }`}
//                           >
//                             <Star className="h-7 w-7" fill={star <= (review[key as keyof typeof review] as number) ? 'currentColor' : 'none'} />
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   ))}

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
//                     <textarea
//                       value={review.comment}
//                       onChange={(e) => setReview({ ...review, comment: e.target.value })}
//                       rows={4}
//                       placeholder="Share your experience with this builder..."
//                       className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
//                     />
//                   </div>

//                   <button
//                     type="submit"
//                     disabled={submitReviewMutation.isPending}
//                     className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
//                   >
//                     {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
//                   </button>
//                 </form>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }
