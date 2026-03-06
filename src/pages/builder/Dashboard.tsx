import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { bidApi, projectApi } from '@/services/api'

// Stats card component
function StatCard({ title, value, icon, trend }: { title: string; value: string | number; icon: string; trend?: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && <p className="text-sm text-green-600 mt-1">{trend}</p>}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}

export default function BuilderDashboard() {
  const { user } = useAuth()

  const { data: bidsData } = useQuery({
    queryKey: ['builder-bids'],
    queryFn: async () => {
      const response = await bidApi.getBuilderBids({ size: 5 })
      return response.data
    },
  })

  const { data: projectsData } = useQuery({
    queryKey: ['builder-projects'],
    queryFn: async () => {
      const response = await projectApi.getBuilderProjects({ size: 5 })
      return response.data
    },
  })

  const pendingBids =
    bidsData?.content?.filter((bid: any) => bid.status === 'SUBMITTED' || bid.status === 'SHORTLISTED').length || 0

  const activeProjects =
    projectsData?.content?.filter((project: any) => project.status === 'IN_PROGRESS' || project.status === 'AWARDED')
      .length || 0

  const completedProjects =
    projectsData?.content?.filter((project: any) => project.status === 'COMPLETED').length || 0

  const builderProfile = (user as any)?.builderProfile
  const leadCredits = builderProfile?.leadCredits || 0
  const rating = builderProfile?.averageRating || 0
  const totalEarnings = builderProfile?.totalEarnings || 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const bidStatusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    SHORTLISTED: 'bg-purple-100 text-purple-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    WITHDRAWN: 'bg-gray-100 text-gray-800',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-gray-600">Here's what's happening with your business today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Active Projects" value={activeProjects} icon="🏗️" />
        <StatCard title="Pending Bids" value={pendingBids} icon="📝" />
        <StatCard title="Total Earnings" value={formatCurrency(totalEarnings)} icon="💰" />
        <StatCard title="Lead Credits" value={leadCredits} icon="🎯" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Your Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold">{Number(rating).toFixed(1)}</span>
                <span className="text-yellow-400 text-xl">★</span>
              </div>
            </div>
            <Link to="/builder/reviews" className="text-sm text-primary hover:underline">
              View Reviews
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed Projects</p>
              <p className="text-2xl font-bold mt-1">{completedProjects}</p>
            </div>
            <span className="text-3xl">✅</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bids</p>
              <p className="text-2xl font-bold mt-1">{bidsData?.totalElements || 0}</p>
            </div>
            <span className="text-3xl">📊</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Bids</h2>
            <Link to="/builder/bids" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {bidsData?.content?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No bids yet. Start bidding on projects!</p>
            ) : (
              bidsData?.content?.slice(0, 5).map((bid: any) => (
                <div key={bid.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{bid.projectTitle}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(bid.amount)}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bidStatusColors[bid.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {bid.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Active Projects</h2>
            <Link to="/builder/projects" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {projectsData?.content?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active projects yet. Win a bid to get started!</p>
            ) : (
              projectsData?.content?.slice(0, 5).map((project: any) => (
                <div key={project.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium">{project.title}</p>
                    <span className="text-sm text-gray-500">
                      {project.deadline ? `Due: ${formatDate(project.deadline)}` : 'No deadline'}
                    </span>
                  </div>

                  {project.progressPercentage !== undefined && (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${project.progressPercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{project.progressPercentage}% complete</p>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/builder/marketplace"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
          >
            🔍 Browse Projects
          </Link>

          <Link
            to="/builder/profile"
            className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            ✏️ Edit Profile
          </Link>

          <Link
            to="/builder/credits"
            className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            💳 Buy Lead Credits
          </Link>

          <Link
            to="/builder/portfolio"
            className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            📸 Update Portfolio
          </Link>
        </div>
      </div>
    </div>
  )
}











// import { Link } from 'react-router-dom'
// import { useQuery } from '@tanstack/react-query'
// import { useAuth } from '@/contexts/AuthContext'
// import { bidApi, projectApi } from '@/services/api'

// // Stats card component
// function StatCard({ title, value, icon, trend }: { title: string; value: string | number; icon: string; trend?: string }) {
//   return (
//     <div className="bg-white rounded-lg shadow-sm p-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm text-gray-500">{title}</p>
//           <p className="text-2xl font-bold mt-1">{value}</p>
//           {trend && <p className="text-sm text-green-600 mt-1">{trend}</p>}
//         </div>
//         <div className="text-3xl">{icon}</div>
//       </div>
//     </div>
//   )
// }

// export default function BuilderDashboard() {
//   const { user } = useAuth()

//   // Fetch builder's bids
//   const { data: bidsData } = useQuery({
//     queryKey: ['builder-bids'],
//     queryFn: async () => {
//       const response = await bidApi.getBuilderBids({ size: 5 })
//       return response.data
//     },
//   })

//   // Fetch builder's active projects
//   const { data: projectsData } = useQuery({
//     queryKey: ['builder-projects'],
//     queryFn: async () => {
//       const response = await projectApi.getBuilderProjects({ size: 5 })
//       return response.data
//     },
//   })

//   // Calculate stats from fetched data
//   const pendingBids = bidsData?.content?.filter((bid: any) =>
//     bid.status === 'SUBMITTED' || bid.status === 'SHORTLISTED'
//   ).length || 0

//   const activeProjects = projectsData?.content?.filter((project: any) =>
//     project.status === 'IN_PROGRESS' || project.status === 'AWARDED'
//   ).length || 0

//   const completedProjects = projectsData?.content?.filter((project: any) =>
//     project.status === 'COMPLETED'
//   ).length || 0

//   // Get builder profile data
//   const builderProfile = user?.builderProfile
//   const leadCredits = builderProfile?.leadCredits || 0
//   const rating = builderProfile?.averageRating || 0
//   const totalEarnings = builderProfile?.totalEarnings || 0

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-PK', {
//       style: 'currency',
//       currency: 'PKR',
//       minimumFractionDigits: 0,
//     }).format(amount)
//   }

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-PK', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     })
//   }

//   const bidStatusColors: Record<string, string> = {
//     DRAFT: 'bg-gray-100 text-gray-800',
//     SUBMITTED: 'bg-blue-100 text-blue-800',
//     UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
//     SHORTLISTED: 'bg-purple-100 text-purple-800',
//     ACCEPTED: 'bg-green-100 text-green-800',
//     REJECTED: 'bg-red-100 text-red-800',
//     WITHDRAWN: 'bg-gray-100 text-gray-800',
//   }

//   return (
//     <div>
//       {/* Welcome Header */}
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
//         <p className="text-gray-600">Here's what's happening with your business today.</p>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         <StatCard title="Active Projects" value={activeProjects} icon="🏗️" />
//         <StatCard title="Pending Bids" value={pendingBids} icon="📝" />
//         <StatCard title="Total Earnings" value={formatCurrency(totalEarnings)} icon="💰" />
//         <StatCard title="Lead Credits" value={leadCredits} icon="🎯" />
//       </div>

//       {/* Secondary Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500">Your Rating</p>
//               <div className="flex items-center gap-2 mt-1">
//                 <span className="text-2xl font-bold">{Number(rating).toFixed(1)}</span>
//                 <span className="text-yellow-400 text-xl">★</span>
//               </div>
//             </div>
//             <Link to="/builder/reviews" className="text-sm text-primary hover:underline">
//               View Reviews
//             </Link>
//           </div>
//         </div>
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500">Completed Projects</p>
//               <p className="text-2xl font-bold mt-1">{completedProjects}</p>
//             </div>
//             <span className="text-3xl">✅</span>
//           </div>
//         </div>
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500">Total Bids</p>
//               <p className="text-2xl font-bold mt-1">{bidsData?.totalElements || 0}</p>
//             </div>
//             <span className="text-3xl">📊</span>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Recent Bids */}
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-semibold">Recent Bids</h2>
//             <Link to="/builder/bids" className="text-sm text-primary hover:underline">
//               View All
//             </Link>
//           </div>
//           <div className="space-y-4">
//             {bidsData?.content?.length === 0 ? (
//               <p className="text-gray-500 text-center py-4">No bids yet. Start bidding on projects!</p>
//             ) : (
//               bidsData?.content?.slice(0, 5).map((bid: any) => (
//                 <div key={bid.id} className="border-b pb-4 last:border-0 last:pb-0">
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <p className="font-medium">{bid.projectTitle}</p>
//                       <p className="text-sm text-gray-500">{formatCurrency(bid.amount)}</p>
//                     </div>
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${bidStatusColors[bid.status] || 'bg-gray-100 text-gray-800'}`}>
//                       {bid.status}
//                     </span>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Active Projects */}
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-semibold">Active Projects</h2>
//             <Link to="/builder/projects" className="text-sm text-primary hover:underline">
//               View All
//             </Link>
//           </div>
//           <div className="space-y-4">
//             {projectsData?.content?.length === 0 ? (
//               <p className="text-gray-500 text-center py-4">No active projects yet. Win a bid to get started!</p>
//             ) : (
//               projectsData?.content?.slice(0, 5).map((project: any) => (
//                 <div key={project.id} className="border-b pb-4 last:border-0 last:pb-0">
//                   <div className="flex justify-between items-start mb-2">
//                     <p className="font-medium">{project.title}</p>
//                     <span className="text-sm text-gray-500">
//                       {project.deadline ? `Due: ${formatDate(project.deadline)}` : 'No deadline'}
//                     </span>
//                   </div>
//                   {project.progressPercentage !== undefined && (
//                     <>
//                       <div className="w-full bg-gray-200 rounded-full h-2">
//                         <div
//                           className="bg-primary h-2 rounded-full"
//                           style={{ width: `${project.progressPercentage}%` }}
//                         ></div>
//                       </div>
//                       <p className="text-sm text-gray-500 mt-1">{project.progressPercentage}% complete</p>
//                     </>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Quick Actions */}
//       <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
//         <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
//         <div className="flex flex-wrap gap-3">
//           <Link
//             to="/builder/marketplace"
//             className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
//           >
//             🔍 Browse Projects
//           </Link>
//           <Link
//             to="/builder/profile"
//             className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
//           >
//             ✏️ Edit Profile
//           </Link>
//           <Link
//             to="/builder/credits"
//             className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
//           >
//             💳 Buy Lead Credits
//           </Link>
//           <Link
//             to="/builder/portfolio"
//             className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
//           >
//             📸 Update Portfolio
//           </Link>
//         </div>
//       </div>
//     </div>
//   )
// }
