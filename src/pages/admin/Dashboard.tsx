import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { adminApi } from '@/services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, Briefcase, FileText, CheckCircle, AlertTriangle, DollarSign, Shield, TrendingUp } from 'lucide-react'
import { StatCardSkeleton } from '@/components/ui/Skeleton'

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8']

function StatCard({ title, value, icon: Icon, linkTo, isLoading, color = 'text-gray-600' }: {
  title: string
  value: string | number
  icon: React.ElementType
  linkTo?: string
  isLoading?: boolean
  color?: string
}) {
  const content = (
    <div className="bg-white dark:bg-gray-50 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-600 dark:bg-gray-200 animate-pulse rounded mt-1"></div>
          ) : (
            <p className="text-2xl font-bold mt-1 dark:text-gray-600">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-gray-50 dark:bg-gray-700 ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
  return linkTo ? <Link to={linkTo}>{content}</Link> : content
}

export default function AdminDashboard() {
  const { user } = useAuth()

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => adminApi.getMetrics().then(r => r.data),
  })

  const { data: revenue } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => adminApi.getRevenueSummary().then(r => r.data),
  })

  const userCounts = metrics?.users || {}
  const projectCounts = metrics?.projects || {}
  const bidCounts = metrics?.bids || {}
  const paymentCounts = metrics?.payments || {}
  const reviewCounts = metrics?.reviews || {}

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Project status data for pie chart
  const projectStatusData = [
    { name: 'Open', value: projectCounts.open || 0 },
    { name: 'Bidding', value: projectCounts.bidding || 0 },
    { name: 'In Progress', value: projectCounts.inProgress || 0 },
    { name: 'Completed', value: projectCounts.completed || 0 },
  ].filter(d => d.value > 0)

  // Monthly revenue for bar chart
  const monthlyData = (revenue?.monthlyTrends || [])
    .slice()
    .reverse()
    .map((item: any) => ({
      month: item.month,
      total: Number(item.total) || 0,
      count: Number(item.count) || 0,
    }))

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.name?.split(' ')[0]}. Here's your platform overview.</p>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Users"
          value={(userCounts.total || 0).toLocaleString()}
          icon={Users}
          linkTo="/admin/users"
          isLoading={isLoading}
          color="text-blue-600"
        />
        <StatCard
          title="Active Projects"
          value={((projectCounts.open || 0) + (projectCounts.bidding || 0) + (projectCounts.inProgress || 0)).toLocaleString()}
          icon={Briefcase}
          isLoading={isLoading}
          color="text-indigo-600"
        />
        <StatCard
          title="Total Revenue"
          value={isLoading ? '...' : formatCurrency(paymentCounts.totalRevenue || 0)}
          icon={DollarSign}
          linkTo="/admin/revenue"
          isLoading={isLoading}
          color="text-green-600"
        />
        <StatCard
          title="Platform Fees"
          value={isLoading ? '...' : formatCurrency(paymentCounts.platformFees || 0)}
          icon={TrendingUp}
          isLoading={isLoading}
          color="text-emerald-600"
        />
      </div>

      {/* KPI Cards Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Bids"
          value={(bidCounts.total || 0).toLocaleString()}
          icon={FileText}
          isLoading={isLoading}
        />
        <StatCard
          title="Completed Projects"
          value={(projectCounts.completed || 0).toLocaleString()}
          icon={CheckCircle}
          isLoading={isLoading}
          color="text-green-600"
        />
        <StatCard
          title="Pending Verifications"
          value={(metrics?.pendingVerifications || 0).toLocaleString()}
          icon={Shield}
          linkTo="/admin/verifications"
          isLoading={isLoading}
          color="text-yellow-600"
        />
        <StatCard
          title="Reviews to Moderate"
          value={(reviewCounts.pending || 0).toLocaleString()}
          icon={AlertTriangle}
          linkTo="/admin/moderation"
          isLoading={isLoading}
          color="text-orange-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Trend Bar Chart */}
        <div className="bg-white dark:bg-gray-50 rounded-lg shadow-sm p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Revenue Trend</h2>
            <Link to="/admin/revenue" className="text-sm text-primary hover:underline">Details</Link>
          </div>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400">
              <p>No revenue data yet</p>
            </div>
          )}
        </div>

        {/* Project Status Pie Chart */}
        <div className="bg-white dark:bg-gray-50 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 ">Project Status</h2>
          {projectStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {projectStatusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400">
              <p>No projects yet</p>
            </div>
          )}
        </div>
      </div>

      {/* User Breakdown + Admin Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Breakdown */}
        <div className="bg-white dark:bg-gray-50 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">User Breakdown</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{isLoading ? '...' : userCounts.clients || 0}</p>
              <p className="text-sm text-gray-600">Clients</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-600">{isLoading ? '...' : userCounts.builders || 0}</p>
              <p className="text-sm text-gray-600">Builders</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{isLoading ? '...' : metrics?.verifiedBuilders || 0}</p>
              <p className="text-sm text-gray-600">Verified Builders</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{isLoading ? '...' : userCounts.suppliers || 0}</p>
              <p className="text-sm text-gray-600">Suppliers</p>
            </div>
          </div>
        </div>

        {/* Admin Tasks */}
        <div className="bg-white dark:bg-gray-50 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/verifications"
              className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors"
            >
              <div>
                <p className="font-medium text-sm">Builder Verifications</p>
                <p className="text-xs text-gray-500">{metrics?.pendingVerifications || 0} pending</p>
              </div>
              <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs">Review</span>
            </Link>
            <Link
              to="/admin/moderation"
              className="flex items-center justify-between p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <div>
                <p className="font-medium text-sm">Review Moderation</p>
                <p className="text-xs text-gray-500">{reviewCounts.pending || 0} pending, {reviewCounts.flagged || 0} flagged</p>
              </div>
              <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded-full text-xs">Moderate</span>
            </Link>
            <Link
              to="/admin/audit-logs"
              className="flex items-center justify-between p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <div>
                <p className="font-medium text-sm">Audit Logs</p>
                <p className="text-xs text-gray-500">View platform activity</p>
              </div>
              <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">View</span>
            </Link>
            <Link
              to="/admin/system-settings"
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-medium text-sm">System Settings</p>
                <p className="text-xs text-gray-500">Platform configuration</p>
              </div>
              <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs">Configure</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
