import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import AOS from 'aos'
import 'aos/dist/aos.css'

// Layouts
import DashboardLayout from './components/layout/DashboardLayout'

// Public pages
import Home from './pages/public/Home'
import BuilderSearch from './pages/public/BuilderSearch'
import BuilderComparison from './pages/public/BuilderComparison'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// Client pages
import ClientDashboard from './pages/client/Dashboard'
import CreateProject from './pages/client/CreateProject'
import MyProjects from './pages/client/MyProjects'
import ProjectDetails from './pages/client/ProjectDetails'
import PaymentHistory from './pages/client/PaymentHistory'
import Invoices from './pages/client/Invoices'

// Builder pages
import BuilderDashboard from './pages/builder/Dashboard'
import Marketplace from './pages/builder/Marketplace'
import MyBids from './pages/builder/MyBids'
import ActiveProjects from './pages/builder/ActiveProjects'
import BuilderProjectView from './pages/builder/ProjectView'
import BuilderReviews from './pages/builder/Reviews'
import BuilderProfile from './pages/builder/Profile'
import BuilderAnalytics from './pages/builder/Analytics'
import LeadManagement from './pages/builder/LeadManagement'
import BuilderSubscription from './pages/builder/Subscription'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import UsersManagement from './pages/admin/Users'
import Verifications from './pages/admin/Verifications'
import AuditLogs from './pages/admin/AuditLogs'
import ModerationQueue from './pages/admin/ModerationQueue'
import RevenueReports from './pages/admin/RevenueReports'
import SystemSettings from './pages/admin/SystemSettings'
import CmsPages from './pages/admin/CmsPages'
import BlogManagement from './pages/admin/BlogManagement'
import EmailTemplates from './pages/admin/EmailTemplates'

// Shared pages
import Messages from './pages/shared/Messages'
import NotificationCenter from './pages/shared/NotificationCenter'
import Settings from './pages/shared/Settings'
import ComingSoon from './pages/shared/ComingSoon'

// Protected Route wrapper
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
    })
  }, [])

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/builders" element={<BuilderSearch />} />
      <Route path="/builders/compare" element={<BuilderComparison />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Client Routes */}
      <Route
        path="/client/*"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<ClientDashboard />} />
                <Route path="projects/new" element={<CreateProject />} />
                <Route path="projects" element={<MyProjects />} />
                <Route path="projects/:id" element={<ProjectDetails />} />
                <Route path="payments" element={<PaymentHistory />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="messages" element={<Messages />} />
                <Route path="notifications" element={<NotificationCenter />} />
                <Route path="settings" element={<Settings />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Builder Routes */}
      <Route
        path="/builder/*"
        element={
          <ProtectedRoute allowedRoles={['BUILDER']}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<BuilderDashboard />} />
                <Route path="marketplace" element={<Marketplace />} />
                <Route path="bids" element={<MyBids />} />
                <Route path="projects" element={<ActiveProjects />} />
                <Route path="projects/:id" element={<BuilderProjectView />} />
                <Route path="reviews" element={<BuilderReviews />} />
                <Route path="profile" element={<BuilderProfile />} />
                <Route path="analytics" element={<BuilderAnalytics />} />
                <Route path="leads" element={<LeadManagement />} />
                <Route path="subscription" element={<BuilderSubscription />} />
                <Route path="messages" element={<Messages />} />
                <Route path="notifications" element={<NotificationCenter />} />
                <Route path="settings" element={<Settings />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="verifications" element={<Verifications />} />
                <Route path="audit-logs" element={<AuditLogs />} />
                <Route path="moderation" element={<ModerationQueue />} />
                <Route path="revenue" element={<RevenueReports />} />
                <Route path="system-settings" element={<SystemSettings />} />
                <Route path="cms-pages" element={<CmsPages />} />
                <Route path="blog" element={<BlogManagement />} />
                <Route path="email-templates" element={<EmailTemplates />} />
                <Route path="notifications" element={<NotificationCenter />} />
                <Route path="settings" element={<Settings />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Supplier Routes (placeholder) */}
      <Route
        path="/supplier/*"
        element={
          <ProtectedRoute allowedRoles={['SUPPLIER']}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<ComingSoon />} />
                <Route path="catalog" element={<ComingSoon />} />
                <Route path="orders" element={<ComingSoon />} />
                <Route path="messages" element={<Messages />} />
                <Route path="notifications" element={<NotificationCenter />} />
                <Route path="settings" element={<Settings />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Supervisor Routes (placeholder) */}
      <Route
        path="/supervisor/*"
        element={
          <ProtectedRoute allowedRoles={['SUPERVISOR']}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<ComingSoon />} />
                <Route path="projects" element={<ComingSoon />} />
                <Route path="logs" element={<ComingSoon />} />
                <Route path="messages" element={<Messages />} />
                <Route path="notifications" element={<NotificationCenter />} />
                <Route path="settings" element={<Settings />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Inspector Routes (placeholder) */}
      <Route
        path="/inspector/*"
        element={
          <ProtectedRoute allowedRoles={['INSPECTOR']}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<ComingSoon />} />
                <Route path="assignments" element={<ComingSoon />} />
                <Route path="messages" element={<Messages />} />
                <Route path="notifications" element={<NotificationCenter />} />
                <Route path="settings" element={<Settings />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App


