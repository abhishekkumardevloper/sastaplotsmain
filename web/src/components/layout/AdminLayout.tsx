import React, { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertOctagon,
  PlusCircle,
  Users,
  MessageSquare,
  Bot,
  Star,
  MapPin,
  FileText,
  HelpCircle,
  BarChart3,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/auth'
import NotificationBell from '@/components/ui/NotificationBell'

interface NavGroup {
  title: string
  items: {
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string
    end?: boolean
  }[]
}

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navGroups: NavGroup[] = [
    {
      title: 'Main',
      items: [
        { label: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard, end: true },
        { label: 'Analytics & Reports', href: '/admin/analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'Property Moderation',
      items: [
        { label: 'All Properties', href: '/admin/properties', icon: Building2, end: true },
        { label: 'Pending Review', href: '/admin/properties/pending', icon: Clock },
        { label: 'Approved Properties', href: '/admin/properties/approved', icon: CheckCircle },
        { label: 'Rejected Properties', href: '/admin/properties/rejected', icon: XCircle },
        { label: 'Suspended Properties', href: '/admin/properties/suspended', icon: AlertOctagon },
        { label: 'Add New Property', href: '/admin/properties/add', icon: PlusCircle },
        { label: 'Featured Promos', href: '/admin/featured', icon: Star },
      ],
    },
    {
      title: 'Users & Inquiries',
      items: [
        { label: 'Users Management', href: '/admin/users', icon: Users },
        { label: 'Enquiries & Leads', href: '/admin/enquiries', icon: MessageSquare },
      ],
    },
    {
      title: 'Platform Management',
      items: [
        { label: 'Chatbot Knowledge', href: '/admin/chatbot', icon: Bot },
        { label: 'Locations & Cities', href: '/admin/locations', icon: MapPin },
        { label: 'Content & CMS', href: '/admin/content', icon: FileText },
        { label: 'FAQs Management', href: '/admin/faqs', icon: HelpCircle },
        { label: 'Audit Logs', href: '/admin/audit-logs', icon: History },
        { label: 'Site Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getInitials = (name?: string) => {
    if (!name) return 'AD'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1b1c1e] text-gray-300 border-r border-gray-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F47B20] flex items-center justify-center text-white shadow-xs">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline">
              <span className="font-extrabold text-base text-white font-poppins">SASTA</span>
              <span className="font-extrabold text-base text-[#F47B20] ml-1 font-poppins">PLOTS</span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Control Panel
            </p>
          </div>
        </Link>
      </div>

      {/* Admin User Short Info */}
      <div className="p-3 mx-3 my-2 rounded-xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-2.5">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-8 h-8 rounded-lg object-cover border border-white/10"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#F47B20] text-white font-bold text-xs flex items-center justify-center">
              {getInitials(user?.full_name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">
              {user?.full_name || 'Admin'}
            </p>
            <p className="text-[10px] text-emerald-400 font-semibold tracking-wide">
              {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              {group.title}
            </div>
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#F47B20] text-white font-semibold shadow-xs'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white/20 text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-gray-800 space-y-1">
        <Link
          to="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-gray-500" />
            <span>Public Site</span>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 lg:w-72 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100"
              aria-label="Open admin sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400">
                Administration
              </span>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 font-sans capitalize">
                {location.pathname.replace('/admin', '').replace(/^\//, '').replace(/\//g, ' > ') || 'Dashboard Overview'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/properties/add"
              className="hidden sm:inline-flex items-center gap-1.5 btn-primary text-xs py-2 px-3"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Listing</span>
            </Link>

            <NotificationBell />

            <Link
              to="/"
              className="text-xs font-semibold text-gray-600 hover:text-[#F47B20] hidden sm:flex items-center gap-1"
            >
              <span>View Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Mobile Sidebar Drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-50 w-72 bg-[#1b1c1e] shadow-2xl md:hidden"
              >
                <div className="absolute top-4 right-4 z-10">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {sidebarContent}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
