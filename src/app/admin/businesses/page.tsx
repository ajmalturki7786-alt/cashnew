'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService, AdminBusiness } from '@/services/admin.service';
import { 
  Building2, 
  Search, 
  MoreVertical,
  Power,
  PowerOff,
  Trash2,
  ArrowLeft,
  User,
  ChevronLeft,
  ChevronRight,
  IndianRupee
} from 'lucide-react';
import Link from 'next/link';

export default function AdminBusinessesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'activate' | 'deactivate' | 'delete';
    business: AdminBusiness | null;
  }>({ open: false, type: 'activate', business: null });

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadBusinesses();
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
      await loadBusinesses();
    } catch (error) {
      console.error('Error:', error);
      router.push('/xadmin2024');
    } finally {
      setLoading(false);
    }
  };

  const loadBusinesses = async () => {
    try {
      const isActive = filter === 'all' ? undefined : filter === 'active';
      const response = await adminService.getBusinesses(page, 20, search || undefined, isActive);
      setBusinesses(response.data);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadBusinesses();
  };

  const handleAction = async () => {
    if (!confirmDialog.business) return;

    try {
      switch (confirmDialog.type) {
        case 'activate':
          await adminService.activateBusiness(confirmDialog.business.id);
          break;
        case 'deactivate':
          await adminService.deactivateBusiness(confirmDialog.business.id);
          break;
        case 'delete':
          await adminService.deleteBusiness(confirmDialog.business.id);
          break;
      }
      setConfirmDialog({ open: false, type: 'activate', business: null });
      loadBusinesses();
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Error performing action');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
              <h1 className="text-2xl font-bold text-gray-900">Businesses Management</h1>
              <p className="text-sm text-gray-500">{totalCount} total businesses</p>
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
                  placeholder="Search by business name or email..."
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
                onClick={() => setFilter('inactive')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'inactive'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        {/* Businesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <div key={business.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{business.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        business.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {business.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setActionMenuOpen(actionMenuOpen === business.id ? null : business.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                    {actionMenuOpen === business.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                        {business.isActive ? (
                          <button
                            onClick={() => {
                              setConfirmDialog({ open: true, type: 'deactivate', business });
                              setActionMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                          >
                            <PowerOff className="w-4 h-4" /> Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setConfirmDialog({ open: true, type: 'activate', business });
                              setActionMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                          >
                            <Power className="w-4 h-4" /> Activate
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setConfirmDialog({ open: true, type: 'delete', business });
                            setActionMenuOpen(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Business
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {business.description && (
                  <p className="text-sm text-gray-500 mt-3 line-clamp-2">{business.description}</p>
                )}

                {/* Owner Info */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">{business.owner.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">{business.owner.email}</p>
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Entries</p>
                    <p className="font-semibold text-gray-900">{business.cashEntryCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Staff</p>
                    <p className="font-semibold text-gray-900">{business.staffCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Banks</p>
                    <p className="font-semibold text-gray-900">{business.bankAccountCount}</p>
                  </div>
                </div>

                {/* Balance */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Balance</span>
                    <span className={`font-semibold ${
                      business.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(business.currentBalance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">Created {formatDate(business.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {businesses.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No businesses found</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>

      {/* Confirmation Dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {confirmDialog.type === 'activate' && 'Activate Business?'}
              {confirmDialog.type === 'deactivate' && 'Deactivate Business?'}
              {confirmDialog.type === 'delete' && 'Delete Business?'}
            </h3>
            <p className="text-gray-500 mb-6">
              {confirmDialog.type === 'activate' && `This will activate "${confirmDialog.business?.name}".`}
              {confirmDialog.type === 'deactivate' && `This will deactivate "${confirmDialog.business?.name}". Users won't be able to access it.`}
              {confirmDialog.type === 'delete' && `This will permanently delete "${confirmDialog.business?.name}" and all its data. This action cannot be undone.`}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDialog({ open: false, type: 'activate', business: null })}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className={`px-4 py-2 rounded-lg text-white ${
                  confirmDialog.type === 'delete' || confirmDialog.type === 'deactivate'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
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
