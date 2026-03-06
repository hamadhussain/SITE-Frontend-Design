import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '@/services/api'
import { Plus, Edit2, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react'

export default function BlogManagement() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({
    slug: '', title: '', excerpt: '', content: '', category: '', coverImageUrl: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blog-posts', page],
    queryFn: () => adminApi.getBlogPosts({ page, size: 10 }).then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => adminApi.createBlogPost(form),
    onSuccess: () => {
      toast.success('Blog post created')
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] })
      resetForm()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create post'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateBlogPost(editingId!, data),
    onSuccess: () => {
      toast.success('Blog post updated')
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] })
      resetForm()
    },
    onError: () => toast.error('Failed to update post'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteBlogPost(id),
    onSuccess: () => {
      toast.success('Blog post deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] })
    },
    onError: () => toast.error('Failed to delete post'),
  })

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: number; publish: boolean }) =>
      adminApi.updateBlogPost(id, { publish }),
    onSuccess: () => {
      toast.success('Post status updated')
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] })
    },
    onError: () => toast.error('Failed to update status'),
  })

  const posts = data?.content || []
  const totalPages = data?.totalPages || 0

  const resetForm = () => {
    setForm({ slug: '', title: '', excerpt: '', content: '', category: '', coverImageUrl: '' })
    setShowForm(false)
    setEditingId(null)
  }

  const startEdit = (post: any) => {
    setForm({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      category: post.category || '',
      coverImageUrl: post.coverImageUrl || '',
    })
    setEditingId(post.id)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({
        title: form.title, excerpt: form.excerpt, content: form.content,
        category: form.category, coverImageUrl: form.coverImageUrl,
      })
    } else {
      createMutation.mutate()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Blog Management</h1>
          <p className="text-gray-600">Create and manage blog posts.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="font-semibold mb-4">{editingId ? 'Edit Post' : 'Create New Post'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    placeholder="my-blog-post"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Construction Tips"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={form.coverImageUrl}
                  onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML)</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={10}
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

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No blog posts yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-600">Title</th>
                <th className="px-6 py-3 font-medium text-gray-600">Category</th>
                <th className="px-6 py-3 font-medium text-gray-600">Status</th>
                <th className="px-6 py-3 font-medium text-gray-600">Views</th>
                <th className="px-6 py-3 font-medium text-gray-600">Created</th>
                <th className="px-6 py-3 font-medium text-gray-600 w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map((post: any) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="font-medium">{post.title}</div>
                    <div className="text-xs text-gray-400 font-mono">/{post.slug}</div>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{post.category || '-'}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      post.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {post.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{post.viewCount || 0}</td>
                  <td className="px-6 py-3 text-gray-500 text-xs">{post.createdAt ? formatDate(post.createdAt) : '-'}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(post)} className="p-1.5 text-gray-400 hover:text-primary rounded" title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => togglePublishMutation.mutate({ id: post.id, publish: !post.isPublished })}
                        className="p-1.5 text-gray-400 hover:text-primary rounded"
                        title={post.isPublished ? 'Unpublish' : 'Publish'}
                      >
                        {post.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this post?')) deleteMutation.mutate(post.id) }}
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
