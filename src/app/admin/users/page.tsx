'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService, AdminUser } from '@/services/admin.service';
import { 
  Users, 
  Search, 
  MoreVertical,
  UserCheck,
  UserX,
  Shield,
  ShieldOff,
  Trash2,
  ArrowLeft,
  Building2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'block' | 'unblock' | 'delete' | 'makeAdmin' | 'removeAdmin';
    user: AdminUser | null;
  }>({ open: false, type: 'block', user: null });

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadUsers();
    }
  }, [page, filter]);

  const checkAdminAndLoadData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/xadmin2024');
        return;
      }

      const adminStatus = await adminService.checkAdminStatus();
      if (!adminStatus) {
        router.push('/xadmin2024');
        return;
      }
      await loadUsers();
    } catch (error) {
      console.error('Error:', error);
      router.push('/xadmin2024');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const isActive = filter === 'all' ? undefined : filter === 'active';
      const response = await adminService.getUsers(page, 20, search || undefined, isActive);
      setUsers(response.data);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleAction = async () => {
    if (!confirmDialog.user) return;

    try {
      switch (confirmDialog.type) {
        case 'block':
          await adminService.blockUser(confirmDialog.user.id);
          break;
        case 'unblock':
          await adminService.unblockUser(confirmDialog.user.id);
          break;
        case 'delete':
          await adminService.deleteUser(confirmDialog.user.id);
          break;
        case 'makeAdmin':
          await adminService.makeAdmin(confirmDialog.user.id);
          break;
        case 'removeAdmin':
          await adminService.removeAdmin(confirmDialog.user.id);
          break;
      }
      setConfirmDialog({ open: false, type: 'block', user: null });
      loadUsers();
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Error performing action');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
              <p className="text-sm text-gray-500">{totalCount} total users</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('blocked')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'blocked'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Blocked
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Businesses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </span>
                            {user.isAdmin && (
                              <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phoneNumber || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <UserCheck className="w-3 h-3 mr-1" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <UserX className="w-3 h-3 mr-1" /> Blocked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Building2 className="w-4 h-4" />
                        {user.businessCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                        {actionMenuOpen === user.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                            {user.isActive ? (
                              <button
                                onClick={() => {
                                  setConfirmDialog({ open: true, type: 'block', user });
                                  setActionMenuOpen(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <UserX className="w-4 h-4" /> Block User
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setConfirmDialog({ open: true, type: 'unblock', user });
                                  setActionMenuOpen(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                              >
                                <UserCheck className="w-4 h-4" /> Unblock User
                              </button>
                            )}
                            {user.isAdmin ? (
                              <button
                                onClick={() => {
                                  setConfirmDialog({ open: true, type: 'removeAdmin', user });
                                  setActionMenuOpen(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                              >
                                <ShieldOff className="w-4 h-4" /> Remove Admin
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setConfirmDialog({ open: true, type: 'makeAdmin', user });
                                  setActionMenuOpen(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-purple-600 hover:bg-purple-50 flex items-center gap-2"
                              >
                                <Shield className="w-4 h-4" /> Make Admin
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setConfirmDialog({ open: true, type: 'delete', user });
                                setActionMenuOpen(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t"
                            >
                              <Trash2 className="w-4 h-4" /> Delete User
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {confirmDialog.type === 'block' && 'Block User?'}
              {confirmDialog.type === 'unblock' && 'Unblock User?'}
              {confirmDialog.type === 'delete' && 'Delete User?'}
              {confirmDialog.type === 'makeAdmin' && 'Make Admin?'}
              {confirmDialog.type === 'removeAdmin' && 'Remove Admin?'}
            </h3>
            <p className="text-gray-500 mb-6">
              {confirmDialog.type === 'block' && `This will prevent ${confirmDialog.user?.firstName} from logging in.`}
              {confirmDialog.type === 'unblock' && `This will allow ${confirmDialog.user?.firstName} to log in again.`}
              {confirmDialog.type === 'delete' && `This will permanently delete ${confirmDialog.user?.firstName} and all their data. This action cannot be undone.`}
              {confirmDialog.type === 'makeAdmin' && `This will give ${confirmDialog.user?.firstName} admin access to manage all users and businesses.`}
              {confirmDialog.type === 'removeAdmin' && `This will remove admin access from ${confirmDialog.user?.firstName}.`}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDialog({ open: false, type: 'block', user: null })}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className={`px-4 py-2 rounded-lg text-white ${
                  confirmDialog.type === 'delete' || confirmDialog.type === 'block'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
