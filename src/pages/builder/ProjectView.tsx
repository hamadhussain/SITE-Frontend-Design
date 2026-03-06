import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectApi, milestoneApi, contractApi } from '@/services/api'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle, Clock, AlertCircle, FileText, Shield } from 'lucide-react'
import { Milestone, Project, Contract } from '@/types'

type TabKey = 'milestones' | 'contract'

const statusColors: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-yellow-100 text-yellow-700',
  UNDER_REVIEW: 'bg-purple-100 text-purple-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  PAYMENT_PENDING: 'bg-orange-100 text-orange-700',
  PAYMENT_RELEASED: 'bg-green-100 text-green-700',
  DISPUTED: 'bg-red-100 text-red-700',
}

const projectStatusColors: Record<string, string> = {
  AWARDED: 'bg-indigo-100 text-indigo-700',
  CONTRACT_PENDING: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  ON_HOLD: 'bg-yellow-100 text-yellow-700',
}

const contractStatusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PENDING_CLIENT: 'bg-yellow-100 text-yellow-700',
  PENDING_BUILDER: 'bg-amber-100 text-amber-800',
  ACTIVE: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  TERMINATED: 'bg-red-100 text-red-700',
  DISPUTED: 'bg-red-100 text-red-700',
}

function MilestoneCard({ milestone, projectId }: { milestone: Milestone; projectId: number }) {
  const queryClient = useQueryClient()

  const completeMutation = useMutation({
    mutationFn: () => milestoneApi.complete(milestone.id, {}),
    onSuccess: () => {
      toast.success(`"${milestone.title}" marked as complete`)
      queryClient.invalidateQueries({ queryKey: ['builder-project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] })
    },
    onError: () => toast.error('Failed to mark milestone as complete'),
  })

  const canComplete = milestone.status === 'PENDING' || milestone.status === 'IN_PROGRESS'

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg">
      <div className="mt-0.5">
        {milestone.status === 'APPROVED' || milestone.status === 'PAYMENT_RELEASED' ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : milestone.status === 'REJECTED' || milestone.status === 'DISPUTED' ? (
          <AlertCircle className="h-5 w-5 text-red-500" />
        ) : (
          <Clock className="h-5 w-5 text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-gray-400">#{milestone.sequenceOrder}</span>
          <h4 className="font-medium">{milestone.title}</h4>
          <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[milestone.status] || 'bg-gray-100 text-gray-600'}`}>
            {milestone.status.replace('_', ' ')}
          </span>
        </div>
        {milestone.description && (
          <p className="text-sm text-gray-500 mb-2">{milestone.description}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>PKR {milestone.paymentAmount?.toLocaleString()}</span>
          {milestone.dueDate && (
            <span>Due: {new Date(milestone.dueDate).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          )}
          {milestone.rejectionReason && (
            <span className="text-red-500">Rejected: {milestone.rejectionReason}</span>
          )}
        </div>
      </div>
      {canComplete && (
        <button
          onClick={() => completeMutation.mutate()}
          disabled={completeMutation.isPending}
          className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-md hover:opacity-90 disabled:opacity-50 flex-shrink-0"
        >
          {completeMutation.isPending ? 'Submitting...' : 'Mark Complete'}
        </button>
      )}
    </div>
  )
}

export default function BuilderProjectView() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabKey>('milestones')

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ['builder-project', projectId],
    queryFn: () => projectApi.getProject(projectId).then((r) => r.data),
    enabled: !!projectId,
  })

  const { data: milestones = [], isLoading: milestonesLoading } = useQuery<Milestone[]>({
    queryKey: ['project-milestones', projectId],
    queryFn: () => milestoneApi.getProjectMilestones(projectId).then((r) => r.data),
    enabled: !!projectId,
  })

  const { data: contract, isLoading: contractLoading } = useQuery<Contract>({
    queryKey: ['project-contract', projectId],
    queryFn: () => contractApi.getContract(projectId).then((r) => r.data),
    enabled: !!projectId,
  })

  const signContractMutation = useMutation({
    mutationFn: () => contractApi.signContract(projectId),
    onSuccess: () => {
      toast.success('Contract signed successfully')
      queryClient.invalidateQueries({ queryKey: ['project-contract', projectId] })
      queryClient.invalidateQueries({ queryKey: ['builder-project', projectId] })
    },
    onError: () => toast.error('Failed to sign contract'),
  })

  const isLoading = projectLoading || milestonesLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p>Project not found.</p>
        <Link to="/builder/projects" className="text-primary hover:underline text-sm mt-2 inline-block">
          Back to Projects
        </Link>
      </div>
    )
  }

  const approvedMilestones = milestones.filter((m) => m.status === 'APPROVED' || m.status === 'PAYMENT_RELEASED').length
  const progressPct = milestones.length > 0 ? Math.round((approvedMilestones / milestones.length) * 100) : 0

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'milestones', label: 'Milestones', icon: <CheckCircle className="h-4 w-4" /> },
    { key: 'contract', label: 'Contract', icon: <FileText className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/builder/projects"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      {/* Project header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold">{project.title}</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs ${projectStatusColors[project.status] || 'bg-gray-100 text-gray-600'}`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-500">{project.projectNumber}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm text-gray-500">Budget</p>
            {project.finalBudget ? (
              <p className="font-semibold">PKR {project.finalBudget.toLocaleString()}</p>
            ) : (
              <p className="font-semibold">
                PKR {project.budgetMin.toLocaleString()} – {project.budgetMax.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-500">City</p>
            <p className="font-medium">{project.city}</p>
          </div>
          <div>
            <p className="text-gray-500">Category</p>
            <p className="font-medium">{project.categoryName || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Client</p>
            <p className="font-medium">{project.client?.name || '—'}</p>
          </div>
          {project.deadline && (
            <div>
              <p className="text-gray-500">Deadline</p>
              <p className="font-medium">
                {new Date(project.deadline).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600">{project.description}</p>

        {/* Milestone progress bar */}
        {milestones.length > 0 && (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Overall Progress</span>
              <span>{approvedMilestones}/{milestones.length} milestones approved ({progressPct}%)</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <>
            <div className="p-5 border-b">
              <h2 className="font-semibold text-lg">Milestones</h2>
              <p className="text-sm text-gray-500">Mark milestones complete when work is done — the client will approve them.</p>
            </div>
            {milestones.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <p>No milestones defined for this project.</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {milestones
                  .slice()
                  .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                  .map((milestone) => (
                    <MilestoneCard key={milestone.id} milestone={milestone} projectId={projectId} />
                  ))}
              </div>
            )}
          </>
        )}

        {/* Contract Tab */}
        {activeTab === 'contract' && (
          <div className="p-6">
            {contractLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : contract && contract.contractNumber ? (
              <div className="space-y-6">
                {/* Contract header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Contract {contract.contractNumber}
                    </h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${contractStatusColors[contract.status] || 'bg-gray-100 text-gray-600'}`}>
                      {contract.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-500">Total Amount</p>
                    <p className="font-semibold text-lg">PKR {contract.totalAmount?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Client Signature</p>
                    {contract.clientSignedAt ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">
                          Signed on {new Date(contract.clientSignedAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Awaiting signature</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Your Signature</p>
                    {contract.builderSignedAt ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">
                          Signed on {new Date(contract.builderSignedAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Awaiting your signature</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sign button for builder */}
                {contract.status === 'PENDING_BUILDER' && !contract.builderSignedAt && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800 mb-3">
                      This contract is awaiting your signature. Please review the terms below and sign to proceed.
                    </p>
                    <button
                      onClick={() => signContractMutation.mutate()}
                      disabled={signContractMutation.isPending}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 disabled:opacity-50"
                    >
                      {signContractMutation.isPending ? 'Signing...' : 'Accept & Sign Contract'}
                    </button>
                  </div>
                )}

                {contract.fullySigned && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-800">
                      Both parties have signed. The contract is now active.
                    </p>
                  </div>
                )}

                {/* Contract details */}
                {contract.scopeOfWork && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Scope of Work</h4>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 whitespace-pre-line">
                      {contract.scopeOfWork}
                    </div>
                  </div>
                )}

                {contract.paymentTerms && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Payment Terms</h4>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 whitespace-pre-line">
                      {contract.paymentTerms}
                    </div>
                  </div>
                )}

                {contract.termsAndConditions && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Terms & Conditions</h4>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 whitespace-pre-line max-h-64 overflow-y-auto">
                      {contract.termsAndConditions}
                    </div>
                  </div>
                )}

                {(contract.startDate || contract.endDate) && (
                  <div className="flex gap-6 text-sm">
                    {contract.startDate && (
                      <div>
                        <span className="text-gray-500">Start Date: </span>
                        <span className="font-medium">{new Date(contract.startDate).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}
                    {contract.endDate && (
                      <div>
                        <span className="text-gray-500">End Date: </span>
                        <span className="font-medium">{new Date(contract.endDate).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No contract generated yet for this project.</p>
                <p className="text-sm mt-1">A contract will be created when the project is awarded.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
