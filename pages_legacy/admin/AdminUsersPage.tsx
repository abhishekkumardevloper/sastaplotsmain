'use client'
import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  ExternalLink,
  Building,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  MoreVertical,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable'
import type { Profile, UserRole, PaginatedResponse } from '@/types'

export interface ExtendedProfile extends Profile {
  properties_count?: number
}

const roleColors: Record<UserRole, { bg: string; text: string; border: string }> = {
  super_admin: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  admin: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  agent: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  owner: { bg: 'bg-orange-50', text: 'text-[#F47B20]', border: 'border-orange-200' },
  buyer: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  guest: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' },
}

export const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'all')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const limit = 10

  // Profile Detail Modal
  const [viewUser, setViewUser] = useState<ExtendedProfile | null>(null)

  // Role change modal
  const [roleChangeModal, setRoleChangeModal] = useState<{
    open: boolean
    user: ExtendedProfile | null
    newRole: UserRole
  }>({ open: false, user: null, newRole: 'buyer' })

  // Suspend/Activate confirmation
  const [statusModal, setStatusModal] = useState<{
    open: boolean
    user: ExtendedProfile | null
  }>({ open: false, user: null })

  // Query users
  const { data, isLoading, isRefetching, refetch } = useQuery<PaginatedResponse<ExtendedProfile>>({
    queryKey: ['admin', 'users', { q: searchQuery, role: roleFilter, status: statusFilter, page }],
    queryFn: async () => {
      try {
        const params: Record<string, any> = { page, limit }
        if (searchQuery) params.q = searchQuery
        if (roleFilter !== 'all') params.role = roleFilter
        if (statusFilter !== 'all') params.is_active = statusFilter === 'active'

        const res = await api.get('/admin/users', { params })
        return res.data
      } catch (err) {
        console.error('Failed to load admin users:', err)
        return {
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      }
    },
    staleTime: 30 * 1000,
  })

  // Role Change Mutation
  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const res = await api.put(`/admin/users/${userId}/role`, { role })
      return res.data
    },
    onSuccess: () => {
      toast.success('User role updated successfully')
      setRoleChangeModal({ open: false, user: null, newRole: 'buyer' })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update user role')
    },
  })

  // Suspend/Activate Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const res = await api.put(`/admin/users/${userId}/status`, { is_active: isActive })
      return res.data
    },
    onSuccess: (_, variables) => {
      toast.success(`User ${variables.isActive ? 'activated' : 'suspended'} successfully`)
      setStatusModal({ open: false, user: null })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update user status')
    },
  })

  const users = data?.data || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1

  const columns: Column<ExtendedProfile>[] = [
    {
      key: 'name',
      header: 'User',
      width: '260px',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FFF0E0] text-[#F47B20] font-bold text-sm flex items-center justify-center shrink-0 border border-[#FFE4CC]">
            {u.avatar_url ? (
              <img src={u.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              u.full_name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>
          <div className="min-w-0">
            <button
              onClick={() => setViewUser(u)}
              className="font-medium text-[#202124] hover:text-[#F47B20] truncate text-sm block text-left"
            >
              {u.full_name}
            </button>
            <div className="flex items-center gap-1.5 text-xs text-[#727272]">
              {u.verification_status === 'verified' && (
                <span className="text-emerald-600 font-semibold text-[10px] flex items-center gap-0.5">
                  ✓ Verified
                </span>
              )}
              {u.company_name && <span className="truncate">{u.company_name}</span>}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email & Contact',
      render: (u) => (
        <div>
          <span className="text-xs font-medium text-[#202124]">{u.email}</span>
          <p className="text-xs text-[#727272]">{u.phone || 'No phone recorded'}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => {
        const style = roleColors[u.role] || roleColors.buyer
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${style.bg} ${style.text} ${style.border}`}
          >
            {u.role.replace('_', ' ')}
          </span>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) =>
        u.is_active ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Suspended
          </span>
        ),
    },
    {
      key: 'properties_count',
      header: 'Listings',
      className: 'text-center',
      headerClassName: 'text-center',
      render: (u) => (
        <Link
          to={`/admin/properties?q=${encodeURIComponent(u.email)}`}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gray-100 hover:bg-[#FFF0E0] hover:text-[#F47B20] text-xs font-bold transition"
        >
          <Building className="w-3 h-3" />
          <span>{u.properties_count ?? 0}</span>
        </Link>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (u) => {
        const d = new Date(u.created_at)
        return (
          <span className="text-xs text-[#727272] whitespace-nowrap">
            {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setViewUser(u)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() =>
              setRoleChangeModal({
                open: true,
                user: u,
                newRole: u.role,
              })
            }
            className="p-1.5 rounded-lg text-gray-500 hover:text-[#F47B20] hover:bg-orange-50 transition text-xs font-semibold"
            title="Change User Role"
          >
            Role
          </button>

          <button
            onClick={() => setStatusModal({ open: true, user: u })}
            className={`p-1.5 rounded-lg transition ${
              u.is_active
                ? 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                : 'text-rose-600 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            title={u.is_active ? 'Suspend Account' : 'Activate Account'}
          >
            {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </button>

          <Link
            to={`/admin/properties?q=${encodeURIComponent(u.email)}`}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#202124] hover:bg-gray-100 transition"
            title="View Properties by User"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ]

  return (
    <AdminLayout
      title="User Management"
      subtitle="View, verify, update roles, and manage marketplace user accounts"
      actions={
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="btn-secondary btn-sm flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Filters and search card */}
        <div className="card p-4 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2 relative">
              <input
                type="text"
                placeholder="Search user by name or email address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 text-xs"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setPage(1)
                }}
                className="input-field text-xs"
              >
                <option value="all">All Roles</option>
                <option value="buyer">Buyers</option>
                <option value="owner">Property Owners</option>
                <option value="agent">Brokers / Agents</option>
                <option value="admin">Administrators</option>
                <option value="super_admin">Super Admins</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="input-field text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <AdminDataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          emptyTitle="No users found"
          emptyDescription="Try adjusting your search query or role filter."
          emptyIcon={Users}
          pagination={{
            page,
            totalPages,
            total,
            limit,
            onPageChange: (p) => setPage(p),
          }}
        />
      </div>

      {/* User Details Modal */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-start justify-between pb-4 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FFF0E0] text-[#F47B20] font-bold text-lg flex items-center justify-center border border-[#FFE4CC]">
                  {viewUser.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-base text-[#202124]">
                    {viewUser.full_name}
                  </h3>
                  <p className="text-xs text-[#727272]">{viewUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setViewUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[#727272] block">Role</span>
                <strong className="text-[#202124] capitalize">{viewUser.role.replace('_', ' ')}</strong>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[#727272] block">Account Status</span>
                <strong className={viewUser.is_active ? 'text-emerald-700' : 'text-rose-700'}>
                  {viewUser.is_active ? 'Active' : 'Suspended'}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[#727272] block">Phone Number</span>
                <strong className="text-[#202124]">{viewUser.phone || 'Not provided'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[#727272] block">Verification Status</span>
                <strong className="text-[#202124] capitalize">
                  {viewUser.verification_status || 'Unverified'}
                </strong>
              </div>
            </div>

            {viewUser.rera_number && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs">
                <span className="text-blue-700 block font-semibold">RERA Registration</span>
                <span className="font-mono text-[#202124]">{viewUser.rera_number}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#F0F0F0]">
              <Link
                to={`/admin/properties?q=${encodeURIComponent(viewUser.email)}`}
                className="text-xs font-semibold text-[#F47B20] hover:underline"
              >
                View user listings ({viewUser.properties_count ?? 0}) &rarr;
              </Link>
              <button
                type="button"
                onClick={() => setViewUser(null)}
                className="btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {roleChangeModal.open && roleChangeModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-poppins font-bold text-base text-[#202124]">
              Change User Role
            </h3>
            <p className="text-xs text-[#727272] mt-1 mb-4">
              Select new access permissions for <strong>{roleChangeModal.user.full_name}</strong>
            </p>

            <div className="space-y-3 mb-6">
              {(['buyer', 'owner', 'agent', 'admin', 'super_admin'] as UserRole[]).map((r) => (
                <label
                  key={r}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                    roleChangeModal.newRole === r
                      ? 'border-[#F47B20] bg-orange-50/50'
                      : 'border-[#EAEAEA] hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xs font-semibold text-[#202124] capitalize">
                    {r.replace('_', ' ')}
                  </span>
                  <input
                    type="radio"
                    name="userRole"
                    checked={roleChangeModal.newRole === r}
                    onChange={() => setRoleChangeModal({ ...roleChangeModal, newRole: r })}
                    className="text-[#F47B20] focus:ring-[#F47B20]"
                  />
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRoleChangeModal({ open: false, user: null, newRole: 'buyer' })}
                className="btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  roleMutation.mutate({
                    userId: roleChangeModal.user!.id,
                    role: roleChangeModal.newRole,
                  })
                }
                disabled={roleMutation.isPending}
                className="btn-primary btn-sm"
              >
                {roleMutation.isPending ? 'Updating...' : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend / Activate Modal */}
      {statusModal.open && statusModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-poppins font-bold text-base text-[#202124]">
              {statusModal.user.is_active ? 'Suspend User Account' : 'Activate User Account'}
            </h3>
            <p className="text-xs text-[#727272] mt-2 mb-6">
              Are you sure you want to {statusModal.user.is_active ? 'suspend' : 'activate'}{' '}
              <strong>{statusModal.user.full_name}</strong> ({statusModal.user.email})?
              {statusModal.user.is_active &&
                ' Suspended users cannot post properties or send enquiries.'}
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setStatusModal({ open: false, user: null })}
                className="btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  toggleStatusMutation.mutate({
                    userId: statusModal.user!.id,
                    isActive: !statusModal.user!.is_active,
                  })
                }
                disabled={toggleStatusMutation.isPending}
                className={`btn-primary btn-sm text-white ${
                  statusModal.user.is_active
                    ? '!bg-rose-600 hover:!bg-rose-700'
                    : '!bg-emerald-600 hover:!bg-emerald-700'
                }`}
              >
                {toggleStatusMutation.isPending
                  ? 'Saving...'
                  : statusModal.user.is_active
                  ? 'Yes, Suspend Account'
                  : 'Yes, Activate Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminUsersPage
