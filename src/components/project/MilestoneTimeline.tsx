import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { milestoneApi } from '@/services/api'
import { toast } from 'sonner'
import { MessageSquare, AlertTriangle, Camera, CheckCircle, Clock, Send } from 'lucide-react'
import type { MilestoneUpdate } from '@/types'

const typeIcons: Record<string, typeof MessageSquare> = {
  PROGRESS: Clock,
  NOTE: MessageSquare,
  ISSUE: AlertTriangle,
  PHOTO: Camera,
  COMPLETION_REQUEST: CheckCircle,
}

const typeColors: Record<string, string> = {
  PROGRESS: 'bg-blue-100 text-blue-600',
  NOTE: 'bg-gray-100 text-gray-600',
  ISSUE: 'bg-red-100 text-red-600',
  PHOTO: 'bg-purple-100 text-purple-600',
  COMPLETION_REQUEST: 'bg-green-100 text-green-600',
}

interface Props {
  milestoneId: number
  canPost: boolean
}

export default function MilestoneTimeline({ milestoneId, canPost }: Props) {
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const [updateType, setUpdateType] = useState('PROGRESS')
  const [progress, setProgress] = useState('')

  const { data: updates, isLoading } = useQuery({
    queryKey: ['milestone-updates', milestoneId],
    queryFn: () => milestoneApi.getUpdates(milestoneId).then(r => r.data as MilestoneUpdate[]),
  })

  const addMutation = useMutation({
    mutationFn: () => milestoneApi.addUpdate(milestoneId, {
      message,
      updateType,
      progressPercentage: progress ? Number(progress) : undefined,
    }),
    onSuccess: () => {
      toast.success('Update posted')
      setMessage('')
      setProgress('')
      queryClient.invalidateQueries({ queryKey: ['milestone-updates', milestoneId] })
    },
    onError: () => toast.error('Failed to post update'),
  })

  return (
    <div>
      {/* Post form */}
      {canPost && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex gap-2 mb-2">
            <select
              value={updateType}
              onChange={e => setUpdateType(e.target.value)}
              className="px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="PROGRESS">Progress</option>
              <option value="NOTE">Note</option>
              <option value="ISSUE">Issue</option>
              <option value="PHOTO">Photo</option>
            </select>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="Progress %"
              value={progress}
              onChange={e => setProgress(e.target.value)}
              className="w-24 px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add an update..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && message.trim() && addMutation.mutate()}
              className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => addMutation.mutate()}
              disabled={!message.trim() || addMutation.isPending}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      {isLoading ? (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : !updates || updates.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No updates yet</p>
      ) : (
        <div className="space-y-0">
          {updates.map((update, idx) => {
            const Icon = typeIcons[update.updateType] || MessageSquare
            const color = typeColors[update.updateType] || typeColors.NOTE
            return (
              <div key={update.id} className="flex gap-3">
                {/* Timeline line + dot */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {idx < updates.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>}
                </div>

                {/* Content */}
                <div className="pb-4 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{update.createdBy?.name || 'Unknown'}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">{update.updateType}</span>
                    {update.progressPercentage != null && (
                      <span className="text-xs text-blue-600 font-medium">{update.progressPercentage}%</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5">{update.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(update.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
