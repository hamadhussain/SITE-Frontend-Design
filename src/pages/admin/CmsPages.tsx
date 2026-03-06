import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '@/services/api'
import { Plus, Edit2, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react'

export default function CmsPages() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ slug: '', title: '', content: '', metaDescription: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-cms-pages', page],
    queryFn: () => adminApi.getCmsPages({ page, size: 10 }).then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => adminApi.createCmsPage(form),
    onSuccess: () => {
      toast.success('Page created')
      queryClient.invalidateQueries({ queryKey: ['admin-cms-pages'] })
      resetForm()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create page'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateCmsPage(editingId!, data),
    onSuccess: () => {
      toast.success('Page updated')
      queryClient.invalidateQueries({ queryKey: ['admin-cms-pages'] })
      resetForm()
    },
    onError: () => toast.error('Failed to update page'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCmsPage(id),
    onSuccess: () => {
      toast.success('Page deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-cms-pages'] })
    },
    onError: () => toast.error('Failed to delete page'),
  })

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: number; publish: boolean }) =>
      adminApi.updateCmsPage(id, { publish }),
    onSuccess: () => {
      toast.success('Page status updated')
      queryClient.invalidateQueries({ queryKey: ['admin-cms-pages'] })
    },
    onError: () => toast.error('Failed to update status'),
  })

  const pages = data?.content || []
  const totalPages = data?.totalPages || 0

  const resetForm = () => {
    setForm({ slug: '', title: '', content: '', metaDescription: '' })
    setShowForm(false)
    setEditingId(null)
  }

  const startEdit = (p: any) => {
    setForm({ slug: p.slug, title: p.title, content: p.content, metaDescription: p.metaDescription || '' })
    setEditingId(p.id)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ title: form.title, content: form.content, metaDescription: form.metaDescription })
    } else {
      createMutation.mutate()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">CMS Pages</h1>
          <p className="text-gray-600">Manage static pages (About, Terms, etc.)</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New Page
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="font-semibold mb-4">{editingId ? 'Edit Page' : 'Create New Page'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  placeholder="about-us"
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <input
                type="text"
                value={form.metaDescription}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML)</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={8}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 border rounded-md hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pages Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading pages...</div>
        ) : pages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No pages yet. Create your first page.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-600">Title</th>
                <th className="px-6 py-3 font-medium text-gray-600">Slug</th>
                <th className="px-6 py-3 font-medium text-gray-600">Status</th>
                <th className="px-6 py-3 font-medium text-gray-600 w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pages.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{p.title}</td>
                  <td className="px-6 py-3 text-gray-500 font-mono text-xs">/{p.slug}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      p.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {p.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(p)} className="p-1.5 text-gray-400 hover:text-primary rounded" title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => togglePublishMutation.mutate({ id: p.id, publish: !p.isPublished })}
                        className="p-1.5 text-gray-400 hover:text-primary rounded"
                        title={p.isPublished ? 'Unpublish' : 'Publish'}
                      >
                        {p.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this page?')) deleteMutation.mutate(p.id) }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t">
            <p className="text-sm text-gray-500">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
