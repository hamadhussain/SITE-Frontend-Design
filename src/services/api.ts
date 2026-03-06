import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, {
            refreshToken,
          })

          const { accessToken, refreshToken: newRefreshToken } = response.data
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)

          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed - logout user
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api

// Typed API helpers
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/v1/auth/login', { email, password }),
  register: (data: any) =>
    api.post('/v1/auth/register', data),
  logout: () =>
    api.post('/v1/auth/logout'),
  refreshToken: (refreshToken: string) =>
    api.post('/v1/auth/refresh', { refreshToken }),
  getCurrentUser: () =>
    api.get('/v1/auth/me'),
  verifyEmail: (token: string) =>
    api.post('/v1/auth/verify-email', { token }),
  forgotPassword: (email: string) =>
    api.post('/v1/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/v1/auth/reset-password', { token, newPassword }),
}

export const projectApi = {
  create: (data: any) =>
    api.post('/v1/client/projects', data),
  getClientProjects: (params?: any) =>
    api.get('/v1/client/projects', { params }),
  getBuilderProjects: (params?: any) =>
    api.get('/v1/builder/projects', { params }),
  getProject: (id: number) =>
    api.get(`/v1/projects/${id}`),
  publish: (id: number) =>
    api.post(`/v1/client/projects/${id}/publish`),
  award: (projectId: number, bidId: number) =>
    api.post(`/v1/client/projects/${projectId}/award/${bidId}`),
  searchProjects: (params?: any) =>
    api.get('/v1/projects', { params }),
}

export const bidApi = {
  create: (data: any) =>
    api.post('/v1/builder/bids', data),
  getBuilderBids: (params?: any) =>
    api.get('/v1/builder/bids', { params }),
  getProjectBids: (projectId: number) =>
    api.get(`/v1/projects/${projectId}/bids`),
  withdraw: (id: number) =>
    api.post(`/v1/builder/bids/${id}/withdraw`),
}

export const milestoneApi = {
  getProjectMilestones: (projectId: number) =>
    api.get(`/v1/projects/${projectId}/milestones`),
  complete: (id: number, evidence: any) =>
    api.post(`/v1/milestones/${id}/complete`, evidence),
  approve: (id: number) =>
    api.post(`/v1/milestones/${id}/approve`),
  reject: (id: number, reason: string) =>
    api.post(`/v1/milestones/${id}/reject`, { reason }),
  addUpdate: (id: number, data: { message: string; updateType?: string; progressPercentage?: number; attachments?: string }) =>
    api.post(`/v1/milestones/${id}/updates`, data),
  getUpdates: (id: number) =>
    api.get(`/v1/milestones/${id}/updates`),
}

export const changeRequestApi = {
  getByProject: (projectId: number) =>
    api.get(`/v1/projects/${projectId}/change-requests`),
  submit: (projectId: number, data: { changeType: string; title: string; description: string; proposedValue?: string }) =>
    api.post(`/v1/projects/${projectId}/change-requests`, data),
  approve: (projectId: number, id: number) =>
    api.post(`/v1/projects/${projectId}/change-requests/${id}/approve`),
  reject: (projectId: number, id: number, reason: string) =>
    api.post(`/v1/projects/${projectId}/change-requests/${id}/reject`, { reason }),
}

export const contractVersionApi = {
  getVersionHistory: (projectId: number) =>
    api.get(`/v1/projects/${projectId}/contract/versions`),
  createVersion: (projectId: number, changeSummary: string) =>
    api.post(`/v1/projects/${projectId}/contract/versions`, { changeSummary }),
}

export const paymentApi = {
  fundEscrow: (projectId: number, amount: number) =>
    api.post('/v1/payments/topup', { projectId, amount }),
  getEscrowBalance: (projectId: number) =>
    api.get(`/v1/payments/escrow/${projectId}`),
  releasePayment: (milestoneId: number) =>
    api.post('/v1/payments/release', { milestoneId }),
  getHistory: (params?: any) =>
    api.get('/v1/payments/history', { params }),
  getProjectPayments: (projectId: number) =>
    api.get(`/v1/payments/project/${projectId}`),
  getInvoices: (params?: any) =>
    api.get('/v1/payments/invoices', { params }),
  getInvoice: (id: number) =>
    api.get(`/v1/payments/invoices/${id}`),
  downloadInvoicePdf: (id: number) =>
    api.get(`/v1/payments/invoices/${id}/pdf`, { responseType: 'blob' }),
}

export const chatApi = {
  getRooms: () =>
    api.get('/v1/chat/rooms'),
  getMessages: (roomId: number, params?: any) =>
    api.get(`/v1/chat/rooms/${roomId}/messages`, { params }),
  sendMessage: (roomId: number, content: string) =>
    api.post(`/v1/chat/rooms/${roomId}/messages`, { content }),
  createDirectRoom: (userId: number) =>
    api.post(`/v1/chat/rooms/direct/${userId}`),
}

export const reviewApi = {
  createReview: (projectId: number, data: any) =>
    api.post(`/v1/projects/${projectId}/review`, data),
  getBuilderReviews: (builderUserId: number, params?: any) =>
    api.get(`/v1/builders/${builderUserId}/reviews`, { params }),
  getMyReviews: (params?: any) =>
    api.get('/v1/builder/reviews', { params }),
}

export const notificationApi = {
  getNotifications: (params?: any) =>
    api.get('/v1/notifications', { params }),
  markAsRead: (id: number) =>
    api.post(`/v1/notifications/${id}/read`),
  markAllAsRead: () =>
    api.post('/v1/notifications/read-all'),
  getUnreadCount: () =>
    api.get('/v1/notifications/unread-count'),
}

export const contractApi = {
  getContract: (projectId: number) =>
    api.get(`/v1/projects/${projectId}/contract`),
  signContract: (projectId: number) =>
    api.post(`/v1/projects/${projectId}/contract/sign`),
}

export const builderApi = {
  searchBuilders: (params?: {
    city?: string
    minExperience?: number
    maxExperience?: number
    minRating?: number
    isAvailable?: boolean
    specialization?: string
    page?: number
    size?: number
  }) =>
    api.get('/v1/builders', { params }),
  getBuilder: (id: number) =>
    api.get(`/v1/builders/${id}`),
  getMyProfile: () =>
    api.get('/v1/builder/me/profile'),
  updateMyProfile: (data: any) =>
    api.put('/v1/builder/me/profile', data),
  getAnalytics: () =>
    api.get('/v1/builder/me/analytics'),
}

export const leadApi = {
  getCreditBalance: () =>
    api.get('/v1/builder/leads/credits'),
  getTransactions: (params?: any) =>
    api.get('/v1/builder/leads/transactions', { params }),
}

export const subscriptionApi = {
  getPlans: () =>
    api.get('/v1/subscriptions/plans'),
  getMySubscription: () =>
    api.get('/v1/builder/subscription'),
  upgradeTier: (tier: string) =>
    api.post('/v1/builder/subscription/upgrade', { tier }),
}

export const userApi = {
  updateProfile: (data: { name?: string; phone?: string; city?: string; address?: string }) =>
    api.put('/v1/users/me', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/v1/users/me/change-password', { currentPassword, newPassword }),
}

export const budgetApi = {
  getEstimate: (data: { projectType: string; areaSqFt: number; trades: string[]; city: string }) =>
    api.post('/v1/budget-estimate', data),
  getCostTables: () =>
    api.get('/v1/budget-estimate/cost-tables'),
}

export const adminApi = {
  getMetrics: () =>
    api.get('/v1/admin/metrics'),
  getUsers: (params?: any) =>
    api.get('/v1/admin/users', { params }),
  verifyBuilder: (userId: number) =>
    api.post(`/v1/admin/verify-builder`, { userId }),
  suspendUser: (userId: number, reason: string) =>
    api.post('/v1/admin/suspend-user', { userId, reason }),
  unsuspendUser: (userId: number) =>
    api.post('/v1/admin/unsuspend-user', { userId }),
  getPendingVerifications: (params?: any) =>
    api.get('/v1/admin/builders/pending', { params }),
  getRevenueSummary: () =>
    api.get('/v1/admin/revenue-summary'),
  getAuditLogs: (params?: any) =>
    api.get('/v1/admin/audit-logs', { params }),
  getModerationQueue: (params?: any) =>
    api.get('/v1/admin/moderation-queue', { params }),
  moderateReview: (id: number, action: string, notes?: string) =>
    api.post(`/v1/admin/reviews/${id}/moderate`, { action, notes }),
  getSettings: () =>
    api.get('/v1/admin/settings'),
  updateSetting: (key: string, value: string) =>
    api.put(`/v1/admin/settings/${key}`, { value }),
  // CMS
  getCmsPages: (params?: any) =>
    api.get('/v1/admin/cms/pages', { params }),
  createCmsPage: (data: { slug: string; title: string; content: string; metaDescription?: string }) =>
    api.post('/v1/admin/cms/pages', data),
  updateCmsPage: (id: number, data: any) =>
    api.put(`/v1/admin/cms/pages/${id}`, data),
  deleteCmsPage: (id: number) =>
    api.delete(`/v1/admin/cms/pages/${id}`),
  getBlogPosts: (params?: any) =>
    api.get('/v1/admin/cms/blog', { params }),
  createBlogPost: (data: { slug: string; title: string; excerpt?: string; content: string; category?: string; coverImageUrl?: string }) =>
    api.post('/v1/admin/cms/blog', data),
  updateBlogPost: (id: number, data: any) =>
    api.put(`/v1/admin/cms/blog/${id}`, data),
  deleteBlogPost: (id: number) =>
    api.delete(`/v1/admin/cms/blog/${id}`),
  getEmailTemplates: () =>
    api.get('/v1/admin/cms/email-templates'),
  updateEmailTemplate: (id: number, data: { subject?: string; body?: string; isActive?: boolean }) =>
    api.put(`/v1/admin/cms/email-templates/${id}`, data),
}
