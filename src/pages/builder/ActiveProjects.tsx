import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { projectApi, milestoneApi } from '@/services/api'
import { Briefcase, CheckCircle, Clock } from 'lucide-react'
import { Project } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Milestone {
  id: number
  title: string
  status: string
  sequenceOrder: number
}

function MilestoneProgress({ projectId }: { projectId: number }) {
  const { data: milestones = [] } = useQuery<Milestone[]>({
    queryKey: ['milestones', projectId],
    queryFn: () => milestoneApi.getProjectMilestones(projectId).then((r) => r.data),
  })

  if (milestones.length === 0) return null

  const completed = milestones.filter((m) => m.status === 'APPROVED').length
  const pct = Math.round((completed / milestones.length) * 100)

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Milestones</span>
        <span>{completed}/{milestones.length} completed ({pct}%)</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="bg-primary rounded-full h-2 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

const statusColors: Record<string, string> = {
  AWARDED: 'bg-indigo-100 text-indigo-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
}

export default function ActiveProjects() {
  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['builder-active-projects'],
    queryFn: () =>
      projectApi.getBuilderProjects({ size: 50 }).then((r) => r.data),
  })

  const allProjects: Project[] = projectsData?.content || []
  const activeProjects = allProjects.filter((p) =>
    ['AWARDED', 'IN_PROGRESS'].includes(p.status)
  )
  const completedProjects = allProjects.filter((p) => p.status === 'COMPLETED')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Active Projects</h1>
        <p className="text-gray-600">Projects you are currently working on</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card data-aos="fade-up" data-aos-delay="0" className="p-5 flex items-center gap-4">
          <div className="bg-blue-500 text-white p-3 rounded-xl shadow-sm">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activeProjects.length}</p>
            <p className="text-sm text-gray-500">In Progress</p>
          </div>
        </Card>
        <Card data-aos="fade-up" data-aos-delay="100" className="p-5 flex items-center gap-4">
          <div className="bg-green-500 text-white p-3 rounded-xl shadow-sm">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{completedProjects.length}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </Card>
        <Card data-aos="fade-up" data-aos-delay="200" className="p-5 flex items-center gap-4">
          <div className="bg-purple-500 text-white p-3 rounded-xl shadow-sm">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{allProjects.length}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
        </Card>
      </div>

      {/* Active Projects */}
      <Card data-aos="fade-up" hoverEffect={false} className="p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-semibold text-lg">Current Work</h2>
        </div>
        {activeProjects.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium mb-1">No active projects</p>
            <p className="text-sm">Win bids in the marketplace to get started.</p>
            <Link to="/builder/marketplace">
              <Button className="mt-4">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activeProjects.map((project, idx) => (
              <div key={project.id} data-aos="fade-up" data-aos-delay={(idx % 10) * 50} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{project.title}</h3>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusColors[project.status] || 'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {project.city} • {project.categoryName}
                    </p>
                    <MilestoneProgress projectId={project.id} />
                  </div>
                  <Link to={`/builder/projects/${project.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <Card data-aos="fade-up" hoverEffect={false} className="p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-semibold text-lg">Completed Projects</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {completedProjects.map((project, idx) => (
              <div key={project.id} data-aos="fade-up" data-aos-delay={(idx % 10) * 50} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <h3 className="font-medium">{project.title}</h3>
                  <p className="text-sm text-gray-500">
                    {project.city} • {project.categoryName}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
