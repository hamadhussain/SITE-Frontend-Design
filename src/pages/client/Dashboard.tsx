import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { projectApi } from '@/services/api'
import { Briefcase, Clock, CheckCircle, AlertCircle, ArrowRight, PlusCircle, Search } from 'lucide-react'
import { Project } from '@/types'

export default function ClientDashboard() {
  const { user } = useAuth()

  const { data: projectsData } = useQuery({
    queryKey: ['client-projects-all'],
    queryFn: () => projectApi.getClientProjects({ size: 100 }).then(r => r.data),
  })

  const projects: Project[] = projectsData?.content || []

  const stats = [
    {
      label: 'Active Projects',
      value: projects.filter(p => ['OPEN', 'BIDDING', 'AWARDED', 'IN_PROGRESS'].includes(p.status)).length,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Awaiting Bids',
      value: projects.filter(p => p.status === 'BIDDING').length,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Completed',
      value: projects.filter(p => p.status === 'COMPLETED').length,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Requires Action',
      value: projects.filter(p => ['DRAFT', 'AWARDED'].includes(p.status)).length,
      icon: AlertCircle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
    },
  ]

  const recentProjects = projects.slice(0, 5)

  const statusColors: Record<string, string> = {
    COMPLETED: 'bg-emerald-50 text-emerald-700',
    IN_PROGRESS: 'bg-blue-50 text-blue-700',
    BIDDING: 'bg-amber-50 text-amber-700',
    OPEN: 'bg-indigo-50 text-indigo-700',
    AWARDED: 'bg-violet-50 text-violet-700',
    DRAFT: 'bg-slate-100 text-slate-700',
    CANCELLED: 'bg-rose-50 text-rose-700',
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Hero */}
      <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Welcome back, {user?.name}!</h1>
          <p className="text-lg text-slate-500 font-medium">Here's an overview of your projects and recent activities.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} ${stat.color} p-4 rounded-xl`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{stat.value}</span>
            </div>
            <p className="text-slate-500 font-semibold">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col pt-2">
          <div className="p-8 pb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent Projects</h2>
            <Link to="/client/projects" className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="p-4 pt-0 flex-1 flex flex-col">
            {recentProjects.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-xl m-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <Briefcase className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No projects yet</h3>
                <p className="text-slate-500 mb-6 font-medium">You haven't posted any projects on the platform.</p>
                <Link to="/client/projects/new" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2 hover:-translate-y-0.5">
                  <PlusCircle className="h-5 w-5" /> Post Your First Project
                </Link>
              </div>
            ) : (
              <div className="space-y-2 px-4 pb-4">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/client/projects/${project.id}`}
                    className="block p-5 bg-white hover:bg-slate-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors mb-1.5">{project.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500 font-semibold">
                          <span>{project.city}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span>{project.categoryName}</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${statusColors[project.status] || 'bg-slate-100 text-slate-700'}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                        {project.bidCount !== undefined && project.bidCount > 0 && (
                          <p className="text-sm font-bold text-slate-400">{project.bidCount} {project.bidCount === 1 ? 'bid' : 'bids'}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-6">Quick Actions</h2>

            <div className="space-y-4">
              <Link
                to="/client/projects/new"
                className="group flex flex-col p-6 bg-slate-50 rounded-xl hover:bg-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary mb-5 shadow-sm">
                  <PlusCircle className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-white transition-colors mb-2">Post a New Project</h3>
                <p className="text-sm text-slate-500 font-medium group-hover:text-white/80 transition-colors leading-relaxed">Create a project and receive bids from verified builders</p>
              </Link>

              <Link
                to="/builders"
                className="group flex flex-col p-6 bg-slate-50 rounded-xl hover:bg-slate-900 hover:shadow-lg hover:shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-900 mb-5 shadow-sm">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-white transition-colors mb-2">Browse Builders</h3>
                <p className="text-sm text-slate-500 font-medium group-hover:text-slate-400 transition-colors leading-relaxed">Find top-rated construction professionals in your area</p>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
