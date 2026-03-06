import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '@/services/api'
import { Save, RotateCcw } from 'lucide-react'

interface SystemSetting {
  id: number
  key: string
  value: string
  type: string
  description: string
  isPublic: boolean
  updatedAt: string | null
}

export default function SystemSettings() {
  const queryClient = useQueryClient()
  const [editValues, setEditValues] = useState<Record<string, string>>({})

  const { data: settings, isLoading } = useQuery<SystemSetting[]>({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings().then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      adminApi.updateSetting(key, value),
    onSuccess: (_, variables) => {
      toast.success(`Setting "${variables.key}" updated`)
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      setEditValues(prev => {
        const next = { ...prev }
        delete next[variables.key]
        return next
      })
    },
    onError: () => toast.error('Failed to update setting'),
  })

  const handleChange = (key: string, value: string) => {
    setEditValues(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = (key: string) => {
    const value = editValues[key]
    if (value !== undefined) {
      updateMutation.mutate({ key, value })
    }
  }

  const handleReset = (key: string, originalValue: string) => {
    setEditValues(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const isModified = (key: string) => editValues[key] !== undefined

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-gray-600">Configure platform settings and parameters.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading settings...</p>
          </div>
        ) : !settings?.length ? (
          <div className="p-8 text-center text-gray-500">
            <p>No system settings configured.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-600">Setting</th>
                <th className="px-6 py-3 font-medium text-gray-600">Value</th>
                <th className="px-6 py-3 font-medium text-gray-600">Type</th>
                <th className="px-6 py-3 font-medium text-gray-600">Public</th>
                <th className="px-6 py-3 font-medium text-gray-600">Last Updated</th>
                <th className="px-6 py-3 font-medium text-gray-600 w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {settings.map((setting: SystemSetting) => {
                const currentValue = editValues[setting.key] ?? setting.value
                const modified = isModified(setting.key)

                return (
                  <tr key={setting.id} className={`hover:bg-gray-50 ${modified ? 'bg-yellow-50' : ''}`}>
                    <td className="px-6 py-3">
                      <div className="font-medium font-mono text-xs">{setting.key}</div>
                      {setting.description && (
                        <div className="text-xs text-gray-400 mt-0.5">{setting.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {setting.type === 'BOOLEAN' ? (
                        <select
                          value={currentValue}
                          onChange={(e) => handleChange(setting.key, e.target.value)}
                          className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      ) : (
                        <input
                          type={setting.type === 'NUMBER' ? 'number' : 'text'}
                          value={currentValue || ''}
                          onChange={(e) => handleChange(setting.key, e.target.value)}
                          className="w-full max-w-xs px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                        {setting.type}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        setting.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {setting.isPublic ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs">
                      {formatDate(setting.updatedAt)}
                    </td>
                    <td className="px-6 py-3">
                      {modified && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSave(setting.key)}
                            disabled={updateMutation.isPending}
                            className="p-1.5 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50"
                            title="Save"
                          >
                            <Save className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleReset(setting.key, setting.value)}
                            className="p-1.5 border rounded hover:bg-gray-50"
                            title="Reset"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
