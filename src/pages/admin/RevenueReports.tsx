import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight } from 'lucide-react'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

export default function RevenueReports() {
  const { data: revenue, isLoading } = useQuery({
    queryKey: ['admin-revenue-summary'],
    queryFn: () => adminApi.getRevenueSummary().then(r => r.data),
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const totalRevenue = Number(revenue?.totalRevenue) || 0
  const platformFees = Number(revenue?.platformFees) || 0
  const escrowRevenue = Number(revenue?.escrowRevenue) || 0
  const subscriptionRevenue = Number(revenue?.subscriptionRevenue) || 0
  const leadCreditRevenue = Number(revenue?.leadCreditRevenue) || 0

  // Monthly trends for bar chart
  const monthlyData = (revenue?.monthlyTrends || [])
    .slice()
    .reverse()
    .map((item: any) => ({
      month: item.month,
      total: Number(item.total) || 0,
      count: Number(item.count) || 0,
    }))

  // Breakdown for pie chart
  const breakdownData = (revenue?.breakdown || []).map((item: any) => ({
    name: String(item.type).replace(/_/g, ' '),
    value: Number(item.total) || 0,
    count: Number(item.count) || 0,
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Revenue Reports</h1>
        <p className="text-gray-600">Financial overview and revenue breakdown.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              {isLoading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold mt-1 text-green-600">{formatCurrency(totalRevenue)}</p>
              )}
            </div>
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Platform Fees</p>
              {isLoading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold mt-1">{formatCurrency(platformFees)}</p>
              )}
            </div>
            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Escrow Volume</p>
              {isLoading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold mt-1">{formatCurrency(escrowRevenue)}</p>
              )}
            </div>
            <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Subscriptions</p>
              {isLoading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold mt-1">{formatCurrency(subscriptionRevenue + leadCreditRevenue)}</p>
              )}
            </div>
            <div className="p-3 rounded-full bg-purple-50 text-purple-600">
              <ArrowUpRight className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === 'total' ? formatCurrency(value) : value,
                    name === 'total' ? 'Revenue' : 'Transactions',
                  ]}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} name="total" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-400">
              <p>No monthly data available</p>
            </div>
          )}
        </div>

        {/* Payment Type Breakdown Pie */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue by Type</h2>
          {breakdownData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={breakdownData}
                  cx="50%"
                  cy="45%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {breakdownData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-400">
              <p>No breakdown data</p>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Revenue Breakdown Details</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : breakdownData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No payment data available.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-600">Payment Type</th>
                <th className="px-6 py-3 font-medium text-gray-600 text-right">Transactions</th>
                <th className="px-6 py-3 font-medium text-gray-600 text-right">Total Revenue</th>
                <th className="px-6 py-3 font-medium text-gray-600 text-right">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {breakdownData.map((item: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right">{item.count}</td>
                  <td className="px-6 py-3 text-right font-medium">{formatCurrency(item.value)}</td>
                  <td className="px-6 py-3 text-right text-gray-500">
                    {totalRevenue > 0 ? ((item.value / totalRevenue) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold">
              <tr>
                <td className="px-6 py-3">Total</td>
                <td className="px-6 py-3 text-right">
                  {breakdownData.reduce((sum: number, item: any) => sum + item.count, 0)}
                </td>
                <td className="px-6 py-3 text-right">{formatCurrency(totalRevenue)}</td>
                <td className="px-6 py-3 text-right">100%</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
