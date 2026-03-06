import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import DOMPurify from 'dompurify'
import { adminApi } from '@/services/api'
import { Save, RotateCcw, Eye, Code } from 'lucide-react'

interface EmailTemplate {
  id: number
  templateKey: string
  name: string
  subject: string
  body: string
  variables: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export default function EmailTemplates() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ subject: '', body: '' })
  const [previewId, setPreviewId] = useState<number | null>(null)

  const { data: templates, isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ['admin-email-templates'],
    queryFn: () => adminApi.getEmailTemplates().then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      adminApi.updateEmailTemplate(id, data),
    onSuccess: () => {
      toast.success('Template updated')
      queryClient.invalidateQueries({ queryKey: ['admin-email-templates'] })
      setEditingId(null)
    },
    onError: () => toast.error('Failed to update template'),
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      adminApi.updateEmailTemplate(id, { isActive }),
    onSuccess: () => {
      toast.success('Template status updated')
      queryClient.invalidateQueries({ queryKey: ['admin-email-templates'] })
    },
    onError: () => toast.error('Failed to update template'),
  })

  const startEdit = (template: EmailTemplate) => {
    setEditForm({ subject: template.subject, body: template.body })
    setEditingId(template.id)
    setPreviewId(null)
  }

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: editForm })
    }
  }

  const parseVariables = (variables: string | null): string[] => {
    if (!variables) return []
    try {
      return JSON.parse(variables)
    } catch {
      return []
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Email Templates</h1>
        <p className="text-gray-600">Manage outbound email templates with variable placeholders.</p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading templates...</p>
        </div>
      ) : !templates?.length ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
          No email templates configured.
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((template: EmailTemplate) => (
            <div key={template.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Template Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{template.name}</h3>
                    <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      {template.templateKey}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {parseVariables(template.variables).length > 0 && (
                    <div className="flex gap-1 mt-1">
                      <span className="text-xs text-gray-400">Variables:</span>
                      {parseVariables(template.variables).map(v => (
                        <span key={v} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-mono">
                          {`{{${v}}}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActiveMutation.mutate({ id: template.id, isActive: !template.isActive })}
                    className={`text-xs px-3 py-1 rounded-md ${
                      template.isActive
                        ? 'border text-gray-600 hover:bg-gray-50'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {template.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  {editingId === template.id ? (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded-md text-xs hover:opacity-90 disabled:opacity-50"
                      >
                        <Save className="h-3.5 w-3.5" /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1 border px-3 py-1 rounded-md text-xs hover:bg-gray-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(template)}
                        className="flex items-center gap-1 border px-3 py-1 rounded-md text-xs hover:bg-gray-50"
                      >
                        <Code className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => setPreviewId(previewId === template.id ? null : template.id)}
                        className="flex items-center gap-1 border px-3 py-1 rounded-md text-xs hover:bg-gray-50"
                      >
                        <Eye className="h-3.5 w-3.5" /> Preview
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Edit Mode */}
              {editingId === template.id && (
                <div className="px-6 py-4 space-y-4 bg-gray-50">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={editForm.subject}
                      onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Body (HTML)</label>
                    <textarea
                      value={editForm.body}
                      onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                      rows={8}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Preview Mode */}
              {previewId === template.id && (
                <div className="px-6 py-4">
                  <div className="text-sm text-gray-500 mb-2">
                    Subject: <span className="font-medium text-gray-700">{template.subject}</span>
                  </div>
                  <div
                    className="border rounded-lg p-4 bg-white text-sm"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(template.body) }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
