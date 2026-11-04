'use client'
import React, { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  PlusCircle,
  Users,
  MessageSquareText,
  HelpCircle,
  Settings,
  BarChart3,
  History,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

interface AdminSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  mobileOpen = false,
  onMobileClose,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  // Properties accordion toggle
  const isPropertiesActive = location.pathname.startsWith('/admin/properties')
  const [propertiesExpanded, setPropertiesExpanded] = useState<boolean>(true)

  // Fetch pending badge counts
  const { data: dashboardCounts } = useQuery({
    queryKey: ['admin', 'sidebar-counts'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/dashboard')
        return {
          pendingCount: res.data?.stats?.pending_approvals ?? res.data?.pending_approvals ?? 0,
          newEnquiries: res.data?.stats?.new_enquiries ?? res.data?.new_enquiries ?? 0,
        }
      } catch {
        return { pendingCount: 0, newEnquiries: 0 }
      }
    },
    staleTime: 60 * 1000,
    refetchInterval: 120 * 1000,
  })

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isLinkActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path && location.search === ''
    }
    return location.pathname === path || (location.pathname + location.search) === path
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#EAEAEA] select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#EAEAEA] flex items-center justify-between">
        <NavLink to="/admin" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#F47B20] text-white flex items-center justify-center font-black text-xl shadow-sm shadow-[#F47B20]/30">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-poppins font-bold text-base text-[#202124]">
                Sasta <span className="text-[#F47B20]">Plots</span>
              </span>
              <span className="bg-[#FFF0E0] text-[#F47B20] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-[#727272]">Control Center</p>
          </div>
        </NavLink>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin">
        {/* Main Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-[#727272] uppercase">
            Dashboard
          </div>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `admin-sidebar-link ${isActive ? 'active' : ''}`
            }
            onClick={onMobileClose}
          >
            <LayoutDashboard className="w-4 h-4 text-[#F47B20]" />
            <span>Overview</span>
          </NavLink>
        </div>

        {/* Properties Management Accordion */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-bold tracking-wider text-[#727272] uppercase">
              Properties
            </span>
            <button
              onClick={() => setPropertiesExpanded(!propertiesExpanded)}
              className="text-gray-400 hover:text-gray-600 p-0.5"
            >
              {propertiesExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="space-y-1">
            <NavLink
              to="/admin/properties"
              end
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive && !location.search ? 'active' : ''}`
              }
              onClick={onMobileClose}
            >
              <Building2 className="w-4 h-4" />
              <span>All Properties</span>
            </NavLink>

            {propertiesExpanded && (
              <>
                <NavLink
                  to="/admin/properties?status=pending_review"
                  className={() =>
                    `admin-sidebar-link justify-between ${
                      location.search.includes('status=pending_review') ? 'active' : ''
                    }`
                  }
                  onClick={onMobileClose}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Pending</span>
                  </div>
                  {dashboardCounts?.pendingCount ? (
                    <span className="bg-[#F47B20] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {dashboardCounts.pendingCount}
                    </span>
                  ) : null}
                </NavLink>

                <NavLink
                  to="/admin/properties?status=approved"
                  className={() =>
                    `admin-sidebar-link ${
                      location.search.includes('status=approved') ? 'active' : ''
                    }`
                  }
                  onClick={onMobileClose}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Approved</span>
                </NavLink>

                <NavLink
                  to="/admin/properties?status=rejected"
                  className={() =>
                    `admin-sidebar-link ${
                      location.search.includes('status=rejected') ? 'active' : ''
                    }`
                  }
                  onClick={onMobileClose}
                >
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>Rejected</span>
                </NavLink>

                <NavLink
                  to="/admin/properties?status=suspended"
                  className={() =>
                    `admin-sidebar-link ${
                      location.search.includes('status=suspended') ? 'active' : ''
                    }`
                  }
                  onClick={onMobileClose}
                >
                  <AlertOctagon className="w-4 h-4 text-gray-500" />
                  <span>Suspended</span>
                </NavLink>
              </>
            )}

            <NavLink
              to="/admin/properties/new"
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={onMobileClose}
            >
              <PlusCircle className="w-4 h-4 text-[#F47B20]" />
              <span className="font-medium text-[#F47B20]">Add Property</span>
            </NavLink>
          </div>
        </div>

        {/* Users & Inquiries */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-[#727272] uppercase">
            Operations
          </div>
          <div className="space-y-1">
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={onMobileClose}
            >
              <Users className="w-4 h-4" />
              <span>Users</span>
            </NavLink>

            <NavLink
              to="/admin/enquiries"
              className={({ isActive }) =>
                `admin-sidebar-link justify-between ${isActive ? 'active' : ''}`
              }
              onClick={onMobileClose}
            >
              <div className="flex items-center gap-3">
                <MessageSquareText className="w-4 h-4" />
                <span>Enquiries</span>
              </div>
              {dashboardCounts?.newEnquiries ? (
                <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {dashboardCounts.newEnquiries}
                </span>
              ) : null}
            </NavLink>
          </div>
        </div>

        {/* Content & System */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-[#727272] uppercase">
            Site & Analytics
          </div>
          <div className="space-y-1">
            <NavLink
              to="/admin/faqs"
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={onMobileClose}
            >
              <HelpCircle className="w-4 h-4" />
              <span>FAQs</span>
            </NavLink>

            <NavLink
              to="/admin/analytics"
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={onMobileClose}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </NavLink>

            <NavLink
              to="/admin/audit-logs"
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={onMobileClose}
            >
              <History className="w-4 h-4" />
              <span>Audit Logs</span>
            </NavLink>

            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={onMobileClose}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Footer Profile & Live Link */}
      <div className="p-3.5 border-t border-[#EAEAEA] bg-[#FAF8F5]/50 space-y-2">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 text-xs text-[#727272] hover:text-[#F47B20] hover:bg-white rounded-lg transition"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            View Live Site
          </span>
        </a>

        <div className="flex items-center justify-between pt-2 border-t border-[#EAEAEA]/80">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#FFE4CC] text-[#F47B20] font-bold text-xs flex items-center justify-center shrink-0">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-[#202124] truncate">
                {user?.full_name || 'Administrator'}
              </p>
              <p className="text-[11px] text-[#727272] truncate">{user?.email || 'admin@sastaplots.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}

export default AdminSidebar
