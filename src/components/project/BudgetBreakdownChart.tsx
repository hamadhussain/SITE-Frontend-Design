import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { BudgetEstimateResponse } from '@/types'

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount)
}

interface Props {
  estimate: BudgetEstimateResponse
}

export default function BudgetBreakdownChart({ estimate }: Props) {
  const pieData = [
    { name: 'Materials', value: estimate.materialsCost },
    { name: 'Labor', value: estimate.laborCost },
    { name: 'Contingency', value: estimate.contingencyCost },
  ]

  const tradeData = Object.entries(estimate.tradeBreakdown || {}).map(([name, value]) => ({
    name,
    cost: value,
  }))

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-xs text-blue-600 font-medium">Materials</p>
          <p className="text-lg font-bold text-blue-700">{formatPKR(estimate.materialsCost)}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-xs text-green-600 font-medium">Labor</p>
          <p className="text-lg font-bold text-green-700">{formatPKR(estimate.laborCost)}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center">
          <p className="text-xs text-amber-600 font-medium">Contingency</p>
          <p className="text-lg font-bold text-amber-700">{formatPKR(estimate.contingencyCost)}</p>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="flex justify-center">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((_entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatPKR(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Trade Breakdown Bar Chart */}
      {tradeData.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Cost by Trade</h4>
          <ResponsiveContainer width="100%" height={tradeData.length * 40 + 40}>
            <BarChart data={tradeData} layout="vertical" margin={{ left: 80, right: 20 }}>
              <XAxis type="number" tickFormatter={(v) => formatPKR(v)} />
              <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => formatPKR(value)} />
              <Bar dataKey="cost" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer info */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
        <span>Confidence: <span className={
          estimate.confidenceLevel === 'HIGH' ? 'text-green-600 font-medium' :
          estimate.confidenceLevel === 'MEDIUM' ? 'text-amber-600 font-medium' :
          'text-red-600 font-medium'
        }>{estimate.confidenceLevel}</span></span>
        <span>Est. timeline: {estimate.timelineEstimateDays} days</span>
      </div>
    </div>
  )
}
