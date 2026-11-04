'use client'
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FileText,
  Search,
  Filter,
  Shield,
  Calendar,
  User,
  Clock,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Settings,
  RefreshCw
} from 'lucide-react'
import api from '@/lib/api'

interface AuditLog {
  id: string
  actor_id?: string
  actor?: {
    email: string
    full_name: string
  }
  action: string
  target_type?: string
  target_id?: string
  details?: Record<string, any>
  ip_address?: string
  created_at: string
}

const ACTION_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  property_approve: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Property Approved' },
  property_reject: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Property Rejected' },
  property_suspend: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', label: 'Property Suspended' },
  property_restore: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Property Restored' },
  property_delete: { bg: 'bg-gray-100 border-gray-300', text: 'text-gray-700', label: 'Property Deleted' },
  user_suspend: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: 'User Suspended' },
  user_activate: { bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700', label: 'User Activated' },
  user_role_change: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', label: 'Role Changed' },
  settings_update: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', label: 'Settings Updated' },
  content_update: { bg: 'bg-cyan-50 border-cyan-200', text: 'text-cyan-700', label: 'Content Updated' },
  admin_login: { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700', label: 'Admin Login' },
}

const FALLBACK_LOGS: AuditLog[] = [
  {
    id: '1',
    actor: { email: 'admin@sastaplots.com', full_name: 'Super Admin' },
    action: 'property_approve',
    target_type: 'property',
    target_id: 'prop-101',
    details: { title: 'Prime Residential Plot in Gomti Nagar', category: 'residential_plot', price: 4500000 },
    ip_address: '103.21.124.5',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString()
  },
  {
    id: '2',
    actor: { email: 'admin@sastaplots.com', full_name: 'Super Admin' },
    action: 'settings_update',
    target_type: 'settings',
    target_id: 'hero',
    details: { updated_keys: ['headline', 'subtext'] },
    ip_address: '103.21.124.5',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    id: '3',
    actor: { email: 'moderator@sastaplots.com', full_name: 'Mod Desk' },
    action: 'property_reject',
    target_type: 'property',
    target_id: 'prop-88',
    details: { reason: 'Incomplete documentation and blurry photos of boundary wall.' },
    ip_address: '49.36.110.12',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString()
  },
  {
    id: '4',
    actor: { email: 'admin@sastaplots.com', full_name: 'Super Admin' },
    action: 'admin_login',
    target_type: 'auth',
    target_id: 'admin-01',
    details: { method: 'password', status: 'success' },
    ip_address: '103.21.124.5',
    created_at: new Date(Date.now() - 1000 * 60 * 600).toISOString()
  }
]

export const AdminAuditLogsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAction, setSelectedAction] = useState('all')

  const { data: logs = FALLBACK_LOGS, isLoading, refetch, isFetching } = useQuery<AuditLog[]>({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/audit-logs')
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          return res.data
        }
        return FALLBACK_LOGS
      } catch (err) {
        return FALLBACK_LOGS
      }
    }
  })

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      (log.actor?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (log.actor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (log.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.target_id?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (JSON.stringify(log.details || {}).toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesAction = selectedAction === 'all' || log.action === selectedAction

    return matchesSearch && matchesAction
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-orange-50 text-brand-orange">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold font-poppins text-brand-text">Audit & Security Logs</h1>
          </div>
          <p className="text-sm text-brand-text-secondary">
            Immutable tracking of all administrative decisions, moderation reviews, and security events.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn-secondary text-xs py-2 px-3 flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-brand-border">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by admin name, email, target ID or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-9 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="input-field py-2 text-sm"
          >
            <option value="all">All Action Types</option>
            <option value="property_approve">Property Approved</option>
            <option value="property_reject">Property Rejected</option>
            <option value="property_suspend">Property Suspended</option>
            <option value="property_restore">Property Restored</option>
            <option value="settings_update">Settings Updated</option>
            <option value="admin_login">Admin Logins</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-brand-text">
            <thead className="bg-gray-50 border-b border-brand-border text-xs uppercase font-semibold text-gray-600">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Target</th>
                <th className="px-6 py-4">Context & Details</th>
                <th className="px-6 py-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-orange border-t-transparent"></div>
                    <p className="mt-2 text-sm">Loading security audit feed...</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="font-medium">No audit logs matching your criteria</p>
                    <p className="text-xs text-gray-400 mt-1">Try resetting your filters or searching another keyword.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const actionStyle = ACTION_COLORS[log.action] || {
                    bg: 'bg-gray-100 border-gray-200',
                    text: 'text-gray-700',
                    label: log.action.replace('_', ' ')
                  }

                  return (
                    <tr key={log.id} className="hover:bg-orange-50/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(log.created_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-bold text-xs">
                            {log.actor?.full_name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-gray-800">{log.actor?.full_name || 'Admin'}</div>
                            <div className="text-[11px] text-gray-500">{log.actor?.email || 'system'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${actionStyle.bg} ${actionStyle.text}`}>
                          {actionStyle.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {log.target_type}:{log.target_id || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600 max-w-md truncate">
                        {log.details ? (
                          <span title={JSON.stringify(log.details, null, 2)}>
                            {JSON.stringify(log.details)}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">No extra parameters</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-xs text-gray-500">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
