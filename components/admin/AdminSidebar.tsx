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
  X,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/auth'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

interface AdminSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  mobileOpen = false,
  onMobileClose,
  collapsed = false,
  onToggleCollapse,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

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

  /* ── Nav Item ───────────────────────────────────────────────── */
  const NavItem = ({
    to,
    icon: Icon,
    label,
    badge,
    iconColor,
    endMatch,
    searchMatch,
  }: {
    to: string
    icon: React.ElementType
    label: string
    badge?: number
    iconColor?: string
    endMatch?: boolean
    searchMatch?: string
  }) => {
    let active = false
    if (endMatch) {
      active = location.pathname === to && location.search === ''
    } else if (searchMatch) {
      active = location.search.includes(searchMatch)
    } else {
      active = location.pathname.startsWith(to)
    }

    const handleClick = () => onMobileClose?.()

    return (
      <NavLink
        to={to}
        onClick={handleClick}
        className={[
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
          collapsed ? 'justify-center' : '',
          active
            ? 'text-white bg-gradient-to-r from-orange-500/20 to-orange-400/10 border border-orange-500/30 shadow-sm shadow-orange-500/10'
            : 'text-slate-400 hover:text-white hover:bg-white/10',
        ].join(' ')}
      >
        <Icon
          className={[
            'shrink-0 transition-colors',
            iconColor
              ? iconColor
              : active
              ? 'text-orange-400'
              : 'text-slate-400 group-hover:text-white',
          ].join(' ')}
          style={{ width: '1.1rem', height: '1.1rem' }}
        />
        {!collapsed && <span className="flex-1 truncate leading-none">{label}</span>}
        {!collapsed && badge !== undefined && badge > 0 && (
          <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center leading-none">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
        {/* Tooltip when collapsed */}
        {collapsed && (
          <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap bg-[#1e293b] text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
            {label}
            {badge && badge > 0 ? ` (${badge})` : ''}
          </span>
        )}
      </NavLink>
    )
  }

  /* ── Section Label ──────────────────────────────────────────── */
  const SectionLabel = ({ label }: { label: string }) =>
    collapsed ? (
      <div className="mx-auto w-8 border-t border-white/10 my-2" />
    ) : (
      <div className="px-3 pt-5 pb-1 text-[10px] font-bold tracking-widest text-slate-600 uppercase select-none first:pt-2">
        {label}
      </div>
    )

  /* ── Sidebar Body ───────────────────────────────────────────── */
  const sidebarContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0f172a] to-[#1a1a2e] select-none overflow-hidden">

      {/* Brand */}
      <div
        className={[
          'flex items-center border-b border-white/10 shrink-0',
          collapsed ? 'justify-center p-4' : 'justify-between px-5 py-4',
        ].join(' ')}
      >
        <NavLink to="/admin" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-orange-500/30 shrink-0">
            S
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-poppins font-bold text-base text-white leading-none">
                  Sasta <span className="text-orange-400">Plots</span>
                </span>
                <span className="bg-orange-500/20 text-orange-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-orange-500/30">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Control Center</p>
            </div>
          )}
        </NavLink>
        {onMobileClose && !collapsed && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">

        <SectionLabel label="Main" />
        <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard Overview" endMatch />

        <SectionLabel label="Properties" />
        <NavItem to="/admin/properties" icon={Building2} label="All Properties" endMatch />
        <NavItem
          to="/admin/properties?status=pending_review"
          icon={Clock}
          label="Pending Review"
          badge={dashboardCounts?.pendingCount}
          iconColor={location.search.includes('status=pending_review') ? 'text-amber-400' : 'text-amber-500/60 group-hover:text-amber-400'}
          searchMatch="status=pending_review"
        />
        <NavItem
          to="/admin/properties?status=approved"
          icon={CheckCircle2}
          label="Approved"
          iconColor={location.search.includes('status=approved') ? 'text-emerald-400' : 'text-emerald-500/60 group-hover:text-emerald-400'}
          searchMatch="status=approved"
        />
        <NavItem
          to="/admin/properties?status=rejected"
          icon={XCircle}
          label="Rejected"
          iconColor={location.search.includes('status=rejected') ? 'text-rose-400' : 'text-rose-500/60 group-hover:text-rose-400'}
          searchMatch="status=rejected"
        />
        <NavItem
          to="/admin/properties?status=suspended"
          icon={AlertOctagon}
          label="Suspended"
          searchMatch="status=suspended"
        />
        <NavItem
          to="/admin/properties/new"
          icon={PlusCircle}
          label="Add Property"
          iconColor="text-orange-400"
        />

        <SectionLabel label="Operations" />
        <NavItem to="/admin/users" icon={Users} label="Users Management" />
        <NavItem
          to="/admin/enquiries"
          icon={MessageSquareText}
          label="Enquiries"
          badge={dashboardCounts?.newEnquiries}
        />

        <SectionLabel label="System" />
        <NavItem to="/admin/faqs" icon={HelpCircle} label="FAQs" />
        <NavItem to="/admin/analytics" icon={BarChart3} label="Analytics" />
        <NavItem to="/admin/audit-logs" icon={History} label="Audit Logs" />
        <NavItem to="/admin/settings" icon={Settings} label="Settings" />
      </div>

      {/* Footer */}
      <div className={[collapsed ? 'p-2' : 'p-3', 'border-t border-white/10 space-y-1.5 shrink-0'].join(' ')}>
        {!collapsed && (
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs text-slate-400 hover:text-orange-400 hover:bg-white/10 rounded-xl transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              View Live Site
            </span>
          </a>
        )}

        <div
          className={[
            'flex items-center pt-2 border-t border-white/10',
            collapsed ? 'flex-col gap-2' : 'justify-between',
          ].join(' ')}
        >
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow shadow-orange-500/30">
                {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.full_name || 'Administrator'}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  <p className="text-[10px] text-slate-500 truncate">
                    {user?.email || 'admin@sastaplots.com'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-xs flex items-center justify-center shadow shadow-orange-500/30">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex items-center justify-center w-full p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition text-xs gap-1.5 mt-1"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden md:block shrink-0 h-screen sticky top-0 overflow-hidden z-20"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onMobileClose}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AdminSidebar
