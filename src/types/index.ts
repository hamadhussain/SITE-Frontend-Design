// User types
export interface User {
  id: number
  email: string
  name: string
  phone?: string
  role: UserRole
  city?: string
  address?: string
  profileImageUrl?: string
  active: boolean
  emailVerified: boolean
  twoFactorEnabled: boolean
  lastLogin?: string
  createdAt: string
  builderProfile?: BuilderProfile
  supplierProfile?: SupplierProfile
}

export type UserRole =
  | 'CLIENT'
  | 'BUILDER'
  | 'SUPPLIER'
  | 'SUPERVISOR'
  | 'INSPECTOR'
  | 'SUPPORT_AGENT'
  | 'ADMIN'
  | 'SUPER_ADMIN'

export interface BuilderProfile {
  id: number
  userId: number
  companyName?: string
  yearsOfExperience: number
  bio?: string
  specializations: string[]
  skills: string[]
  serviceAreas: string[]
  isVerified: boolean
  isAvailable: boolean
  hourlyRate?: number
  minimumProjectValue?: number
  portfolioImages: string[]
  totalProjectsCompleted: number
  averageRating: number
  totalReviews: number
  subscriptionTier: string
  leadCredits: number
  primaryTrade?: string
  secondaryTrades?: string[]
  experiencePerTrade?: string
  ntnNumber?: string
  pecNumber?: string
  teamMembers?: string
  serviceAreaRadius?: number
}

// Subscription types
export interface SubscriptionPlan {
  id: number
  name: string
  tier: string
  price: number
  billingCycle: string
  leadCreditsPerMonth: number
  maxActiveBids: number
  maxPortfolioImages: number
  featuredListing: boolean
  prioritySupport: boolean
  analyticsAccess: boolean
  badgeLabel?: string
  description?: string
}

export interface LeadTransaction {
  id: number
  transactionType: string
  amount: number
  balanceAfter: number
  referenceType?: string
  referenceId?: number
  description?: string
  createdAt: string
}

export interface SupplierProfile {
  id: number
  userId: number
  companyName: string
  description?: string
  categories: string[]
  isVerified: boolean
  warehouseAddress?: string
  deliveryAreas: string[]
  minimumOrderValue: number
  totalOrdersCompleted: number
  averageRating: number
}

// Project types
export interface Project {
  id: number
  projectNumber: string
  title: string
  description: string
  categoryId?: number
  categoryName?: string
  city: string
  locationAddress?: string
  budgetMin: number
  budgetMax: number
  finalBudget?: number
  deadline?: string
  estimatedDurationDays?: number
  requiredSkills: string[]
  attachments: string[]
  specialRequirements?: string
  status: ProjectStatus
  isUrgent: boolean
  isFeatured: boolean
  requiresInspection: boolean
  progressPercentage: number
  publishedAt?: string
  biddingDeadline?: string
  awardedAt?: string
  startedAt?: string
  expectedCompletionDate?: string
  actualCompletionDate?: string
  createdAt: string
  client?: User
  awardedBuilder?: User
  bidCount?: number
}

export type ProjectStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'BIDDING'
  | 'AWARDED'
  | 'CONTRACT_PENDING'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'

// Bid types
export interface Bid {
  id: number
  bidNumber: string
  projectId: number
  projectTitle?: string
  builderId: number
  builderName?: string
  builderCompanyName?: string
  builderRating?: number
  amount: number
  proposal: string
  workPlan?: string
  estimatedDurationDays: number
  laborCost?: number
  materialCost?: number
  otherCost?: number
  attachments: string[]
  status: BidStatus
  clientNotes?: string
  rejectionReason?: string
  validUntil?: string
  submittedAt?: string
  createdAt: string
  updatedAt?: string
  builder?: User
  project?: Project
}

export type BidStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'EXPIRED'

// Milestone types
export interface Milestone {
  id: number
  projectId: number
  title: string
  description?: string
  sequenceOrder: number
  paymentAmount: number
  paymentPercentage?: number
  startDate?: string
  dueDate?: string
  completedAt?: string
  approvedAt?: string
  status: MilestoneStatus
  progressPercentage: number
  deliverables: string[]
  completionEvidence: string[]
  rejectionReason?: string
}

export type MilestoneStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_RELEASED'
  | 'DISPUTED'

// Chat types
export interface ChatRoom {
  id: number
  roomCode: string
  roomType: 'PROJECT' | 'BID' | 'SUPPORT' | 'DIRECT' | 'GROUP'
  projectId?: number
  name?: string
  lastMessageAt?: string
  lastMessagePreview?: string
  isActive: boolean
}

export interface ChatMessage {
  id: number
  chatRoomId: number
  senderId: number
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'
  content: string
  attachmentUrl?: string
  attachmentName?: string
  isEdited: boolean
  isDeleted: boolean
  createdAt: string
  sender?: User
}

// Notification types
export interface Notification {
  id: number
  notificationType: string
  title: string
  message: string
  icon?: string
  relatedEntityType?: string
  relatedEntityId?: number
  actionUrl?: string
  isRead: boolean
  readAt?: string
  createdAt: string
}

// API Response types
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

// Contract types
export interface Contract {
  message: boolean
  id: number
  contractNumber: string
  projectId: number
  projectTitle: string
  status: ContractStatus
  client?: { id: number; name: string; email: string }
  builder?: { id: number; name: string; email: string }
  totalAmount: number
  paymentTerms?: string
  scopeOfWork?: string
  termsAndConditions?: string
  specialClauses?: string
  startDate: string
  endDate: string
  clientSignedAt?: string
  builderSignedAt?: string
  fullySigned: boolean
  createdAt: string
  updatedAt?: string
}

export type ContractStatus =
  | 'DRAFT'
  | 'PENDING_CLIENT'
  | 'PENDING_BUILDER'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'TERMINATED'
  | 'DISPUTED'

// Milestone Update types
export interface MilestoneUpdate {
  id: number
  milestoneId: number
  updateType: string
  message: string
  progressPercentage?: number
  attachments?: string
  createdBy?: { id: number; name: string; email: string }
  createdAt: string
}

// Change Request types
export interface ChangeRequest {
  id: number
  projectId: number
  changeType: string
  title: string
  description: string
  proposedValue?: string
  currentValue?: string
  status: string
  requestedBy?: { id: number; name: string; email: string }
  reviewedBy?: { id: number; name: string; email: string }
  reviewedAt?: string
  rejectionReason?: string
  createdAt: string
}

// Contract Version types
export interface ContractVersion {
  id: number
  contractId: number
  versionNumber: number
  scopeOfWork?: string
  termsAndConditions?: string
  totalAmount?: number
  startDate?: string
  endDate?: string
  changeSummary?: string
  createdBy?: { id: number; name: string; email: string }
  createdAt: string
}

// Escrow types
export interface EscrowBalance {
  message: any
  projectId: number
  totalFunded: number
  totalReleased: number
  totalRefunded: number
  currentBalance: number
  pendingRelease: number
  currency: string
  isActive: boolean
  transactions: EscrowTransaction[]
}

export interface EscrowTransaction {
  id: number
  transactionReference: string
  transactionType: 'FUND' | 'RELEASE' | 'REFUND' | 'HOLD'
  amount: number
  netAmount: number
  balanceBefore: number
  balanceAfter: number
  description?: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED'
  createdAt: string
}

// Budget Estimator types
export interface BudgetEstimateRequest {
  projectType: string
  areaSqFt: number
  trades: string[]
  city: string
}

export interface BudgetEstimateResponse {
  estimatedTotal: number
  materialsCost: number
  laborCost: number
  contingencyCost: number
  tradeBreakdown: Record<string, number>
  timelineEstimateDays: number
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW'
  currency: string
  projectType: string
  city: string
  areaSqFt: number
}

export interface CostTables {
  projectTypes: string[]
  baseRates: Record<string, number>
  cities: string[]
  cityMultipliers: Record<string, number>
  trades: string[]
  tradeAddonRates: Record<string, number>
  timelineBaseDays: Record<string, number>
}

// Payment types
export interface Payment {
  id: number
  paymentReference: string
  payer?: { id: number; name: string; email: string }
  payee?: { id: number; name: string; email: string }
  projectId?: number
  projectTitle?: string
  milestoneId?: number
  paymentType: string
  amount: number
  feeAmount: number
  netAmount: number
  currency: string
  paymentMethod: string
  status: string
  failureReason?: string
  initiatedAt?: string
  completedAt?: string
  createdAt: string
}

// Invoice types
export interface Invoice {
  id: number
  invoiceNumber: string
  issuedTo?: { id: number; name: string; email: string }
  issuedBy?: { id: number; name: string; email: string }
  projectId?: number
  projectTitle?: string
  paymentId?: number
  invoiceType: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  currency: string
  lineItems?: string
  issueDate: string
  dueDate?: string
  paidDate?: string
  status: string
  documentUrl?: string
  notes?: string
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: {
    id: number
    email: string
    name: string
    role: UserRole
    profileImageUrl?: string
    emailVerified: boolean
    twoFactorEnabled: boolean
  }
}
