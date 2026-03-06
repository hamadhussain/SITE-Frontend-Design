

import { ReactNode, useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import gsap from 'gsap'
import NotificationDropdown from './NotificationDropdown'
import ThemeToggle from '../ui/ThemeToggle'
import {
  Home,
  Briefcase,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  BarChart3,
  ShoppingBag,
  ClipboardCheck,
  Hammer,
  DollarSign,
  Coins,
  Crown,
  ScrollText,
  Shield,
  TrendingUp,
  Sliders,
  Newspaper,
  Mail,
} from 'lucide-react'

interface DashboardLayoutProps {
  children: ReactNode
}

const menuItems = {
  CLIENT: [
    { path: '/client/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/client/projects', icon: Briefcase, label: 'My Projects' },
    { path: '/client/projects/new', icon: FileText, label: 'New Project' },
    { path: '/client/payments', icon: DollarSign, label: 'Payments' },
    { path: '/client/invoices', icon: FileText, label: 'Invoices' },
    { path: '/client/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/client/settings', icon: Settings, label: 'Settings' },
  ],
  BUILDER: [
    { path: '/builder/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/builder/marketplace', icon: ShoppingBag, label: 'Marketplace' },
    { path: '/builder/bids', icon: FileText, label: 'My Bids' },
    { path: '/builder/projects', icon: Briefcase, label: 'Active Projects' },
    { path: '/builder/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/builder/leads', icon: Coins, label: 'Lead Credits' },
    { path: '/builder/subscription', icon: Crown, label: 'Subscription' },
    { path: '/builder/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/builder/settings', icon: Settings, label: 'Settings' },
  ],
  SUPPLIER: [
    { path: '/supplier/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/supplier/catalog', icon: ShoppingBag, label: 'Catalog' },
    { path: '/supplier/orders', icon: FileText, label: 'Orders' },
    { path: '/supplier/settings', icon: Settings, label: 'Settings' },
  ],
  SUPERVISOR: [
    { path: '/supervisor/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/supervisor/projects', icon: Briefcase, label: 'Projects' },
    { path: '/supervisor/logs', icon: ClipboardCheck, label: 'Daily Logs' },
    { path: '/supervisor/settings', icon: Settings, label: 'Settings' },
  ],
  INSPECTOR: [
    { path: '/inspector/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/inspector/assignments', icon: ClipboardCheck, label: 'Assignments' },
    { path: '/inspector/settings', icon: Settings, label: 'Settings' },
  ],
  ADMIN: [
    { path: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/verifications', icon: ClipboardCheck, label: 'Verifications' },
    { path: '/admin/moderation', icon: Shield, label: 'Moderation' },
    { path: '/admin/audit-logs', icon: ScrollText, label: 'Audit Logs' },
    { path: '/admin/revenue', icon: TrendingUp, label: 'Revenue' },
    { path: '/admin/system-settings', icon: Sliders, label: 'System Settings' },
    { path: '/admin/cms-pages', icon: Newspaper, label: 'CMS Pages' },
    { path: '/admin/blog', icon: FileText, label: 'Blog' },
    { path: '/admin/email-templates', icon: Mail, label: 'Email Templates' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ],
  SUPER_ADMIN: [
    { path: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/verifications', icon: ClipboardCheck, label: 'Verifications' },
    { path: '/admin/moderation', icon: Shield, label: 'Moderation' },
    { path: '/admin/audit-logs', icon: ScrollText, label: 'Audit Logs' },
    { path: '/admin/revenue', icon: TrendingUp, label: 'Revenue' },
    { path: '/admin/system-settings', icon: Sliders, label: 'System Settings' },
    { path: '/admin/cms-pages', icon: Newspaper, label: 'CMS Pages' },
    { path: '/admin/blog', icon: FileText, label: 'Blog' },
    { path: '/admin/email-templates', icon: Mail, label: 'Email Templates' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ],
  SUPPORT_AGENT: [
    { path: '/support/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/support/tickets', icon: MessageSquare, label: 'Tickets' },
    { path: '/support/settings', icon: Settings, label: 'Settings' },
  ],
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // GSAP Page Transition Fade
    if (mainRef.current) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      )
    }
  }, [location.pathname])

  const currentMenuItems = user?.role
    ? menuItems[user.role as keyof typeof menuItems] || []
    : []

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between h-16 px-6 shadow-sm">
          <Link to="/" className="flex items-center gap-2">
            <Hammer className="h-8 w-8 text-white-600" />
            <span className="font-bold text-xl tracking-tight">
              BuilderConnect
            </span>
          </Link>
          <button
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {currentMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <button
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationDropdown />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>

              <div className="w-10 h-10 bg-blue600 text-white rounded-full flex items-center justify-center font-semibold shadow-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main ref={mainRef} className="p-6 min-h-screen will-change-[opacity,transform]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}



// import { ReactNode, useState } from 'react'
// import { Link, useLocation } from 'react-router-dom'
// import { useAuth } from '@/contexts/AuthContext'
// import NotificationDropdown from './NotificationDropdown'
// import ThemeToggle from '../ui/ThemeToggle'
// import {
//   Home,
//   Briefcase,
//   FileText,
//   MessageSquare,
//   Settings,
//   LogOut,
//   Menu,
//   X,
//   Users,
//   BarChart3,
//   ShoppingBag,
//   ClipboardCheck,
//   Hammer,
//   DollarSign,
//   Coins,
//   Crown,
//   ScrollText,
//   Shield,
//   TrendingUp,
//   Sliders,
//   Newspaper,
//   Mail,
// } from 'lucide-react'

// interface DashboardLayoutProps {
//   children: ReactNode
// }

// const menuItems = {
//   CLIENT: [
//     { path: '/client/dashboard', icon: Home, label: 'Dashboard' },
//     { path: '/client/projects', icon: Briefcase, label: 'My Projects' },
//     { path: '/client/projects/new', icon: FileText, label: 'New Project' },
//     { path: '/client/payments', icon: DollarSign, label: 'Payments' },
//     { path: '/client/invoices', icon: FileText, label: 'Invoices' },
//     { path: '/client/messages', icon: MessageSquare, label: 'Messages' },
//     { path: '/client/settings', icon: Settings, label: 'Settings' },
//   ],
//   BUILDER: [
//     { path: '/builder/dashboard', icon: Home, label: 'Dashboard' },
//     { path: '/builder/marketplace', icon: ShoppingBag, label: 'Marketplace' },
//     { path: '/builder/bids', icon: FileText, label: 'My Bids' },
//     { path: '/builder/projects', icon: Briefcase, label: 'Active Projects' },
//     { path: '/builder/analytics', icon: BarChart3, label: 'Analytics' },
//     { path: '/builder/leads', icon: Coins, label: 'Lead Credits' },
//     { path: '/builder/subscription', icon: Crown, label: 'Subscription' },
//     { path: '/builder/messages', icon: MessageSquare, label: 'Messages' },
//     { path: '/builder/settings', icon: Settings, label: 'Settings' },
//   ],
//   SUPPLIER: [
//     { path: '/supplier/dashboard', icon: Home, label: 'Dashboard' },
//     { path: '/supplier/catalog', icon: ShoppingBag, label: 'Catalog' },
//     { path: '/supplier/orders', icon: FileText, label: 'Orders' },
//     { path: '/supplier/settings', icon: Settings, label: 'Settings' },
//   ],
//   SUPERVISOR: [
//     { path: '/supervisor/dashboard', icon: Home, label: 'Dashboard' },
//     { path: '/supervisor/projects', icon: Briefcase, label: 'Projects' },
//     { path: '/supervisor/logs', icon: ClipboardCheck, label: 'Daily Logs' },
//     { path: '/supervisor/settings', icon: Settings, label: 'Settings' },
//   ],
//   INSPECTOR: [
//     { path: '/inspector/dashboard', icon: Home, label: 'Dashboard' },
//     { path: '/inspector/assignments', icon: ClipboardCheck, label: 'Assignments' },
//     { path: '/inspector/settings', icon: Settings, label: 'Settings' },
//   ],
//   ADMIN: [
//     { path: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
//     { path: '/admin/users', icon: Users, label: 'Users' },
//     { path: '/admin/verifications', icon: ClipboardCheck, label: 'Verifications' },
//     { path: '/admin/moderation', icon: Shield, label: 'Moderation' },
//     { path: '/admin/audit-logs', icon: ScrollText, label: 'Audit Logs' },
//     { path: '/admin/revenue', icon: TrendingUp, label: 'Revenue' },
//     { path: '/admin/system-settings', icon: Sliders, label: 'System Settings' },
//     { path: '/admin/cms-pages', icon: Newspaper, label: 'CMS Pages' },
//     { path: '/admin/blog', icon: FileText, label: 'Blog' },
//     { path: '/admin/email-templates', icon: Mail, label: 'Email Templates' },
//     { path: '/admin/settings', icon: Settings, label: 'Settings' },
//   ],
//   SUPER_ADMIN: [
//     { path: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
//     { path: '/admin/users', icon: Users, label: 'Users' },
//     { path: '/admin/verifications', icon: ClipboardCheck, label: 'Verifications' },
//     { path: '/admin/moderation', icon: Shield, label: 'Moderation' },
//     { path: '/admin/audit-logs', icon: ScrollText, label: 'Audit Logs' },
//     { path: '/admin/revenue', icon: TrendingUp, label: 'Revenue' },
//     { path: '/admin/system-settings', icon: Sliders, label: 'System Settings' },
//     { path: '/admin/cms-pages', icon: Newspaper, label: 'CMS Pages' },
//     { path: '/admin/blog', icon: FileText, label: 'Blog' },
//     { path: '/admin/email-templates', icon: Mail, label: 'Email Templates' },
//     { path: '/admin/settings', icon: Settings, label: 'Settings' },
//   ],
//   SUPPORT_AGENT: [
//     { path: '/support/dashboard', icon: Home, label: 'Dashboard' },
//     { path: '/support/tickets', icon: MessageSquare, label: 'Tickets' },
//     { path: '/support/settings', icon: Settings, label: 'Settings' },
//   ],
// }

// export default function DashboardLayout({ children }: DashboardLayoutProps) {
//   const { user, logout } = useAuth()
//   const location = useLocation()
//   const [sidebarOpen, setSidebarOpen] = useState(false)

//   const currentMenuItems = user?.role ? menuItems[user.role as keyof typeof menuItems] || [] : []

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//       {/* Mobile sidebar overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
//           sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//         }`}
//       >
//         <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
//           <Link to="/" className="flex items-center gap-2">
//             <Hammer className="h-8 w-8 text-primary" />
//             <span className="font-bold text-xl dark:text-white">BuilderConnect</span>
//           </Link>
//           <button
//             className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
//             onClick={() => setSidebarOpen(false)}
//           >
//             <X className="h-5 w-5 dark:text-gray-300" />
//           </button>
//         </div>

//         <nav className="p-4 space-y-1">
//           {currentMenuItems.map((item) => {
//             const Icon = item.icon
//             const isActive = location.pathname === item.path
//             return (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
//                   isActive
//                     ? 'bg-primary text-primary-foreground'
//                     : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//                 }`}
//               >
//                 <Icon className="h-5 w-5" />
//                 <span>{item.label}</span>
//               </Link>
//             )
//           })}
//         </nav>

//         <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700">
//           <button
//             onClick={logout}
//             className="flex items-center gap-3 px-3 py-2 w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
//           >
//             <LogOut className="h-5 w-5" />
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>

//       {/* Main content */}
//       <div className="lg:pl-64">
//         {/* Header */}
//         <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-4">
//           <button
//             className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
//             onClick={() => setSidebarOpen(true)}
//           >
//             <Menu className="h-5 w-5 dark:text-gray-300" />
//           </button>

//           <div className="flex-1" />

//           <div className="flex items-center gap-4">
//             <ThemeToggle />
//             <NotificationDropdown />

//             <div className="flex items-center gap-3">
//               <div className="text-right hidden sm:block">
//                 <p className="text-sm font-medium dark:text-white">{user?.name}</p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
//               </div>
//               <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium">
//                 {user?.name?.charAt(0).toUpperCase()}
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Page content */}
//         <main className="p-4 md:p-6">{children}</main>
//       </div>
//     </div>
//   )
// }
