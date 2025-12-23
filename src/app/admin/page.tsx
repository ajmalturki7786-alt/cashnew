'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService, AdminDashboard } from '@/services/admin.service';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  UserCheck, 
  UserX,
  ArrowRight,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      // Check if logged in
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
      setIsAdmin(true);
      
      const data = await adminService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
      router.push('/xadmin2024');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin || !dashboard) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">Manage users and businesses</p>
            </div>
            <Link 
              href="/dashboard" 
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Back to App <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{dashboard.totalUsers}</p>
                <p className="text-xs text-green-600 mt-1">+{dashboard.todayNewUsers} today</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-3xl font-bold text-green-600">{dashboard.activeUsers}</p>
                <p className="text-xs text-gray-500 mt-1">{dashboard.blockedUsers} blocked</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Businesses */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Businesses</p>
                <p className="text-3xl font-bold text-gray-900">{dashboard.totalBusinesses}</p>
                <p className="text-xs text-green-600 mt-1">+{dashboard.todayNewBusinesses} today</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Cash Entries */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Entries</p>
                <p className="text-3xl font-bold text-gray-900">{dashboard.totalCashEntries}</p>
                <p className="text-xs text-gray-500 mt-1">{dashboard.totalBankTransactions} bank txns</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Cash Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Cash In</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(dashboard.totalCashIn)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Cash Out</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(dashboard.totalCashOut)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/admin/users" 
            className="bg-white rounded-xl shadow-sm p-6 border hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
                  <p className="text-sm text-gray-500">View, block, or delete users</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>

          <Link 
            href="/admin/businesses" 
            className="bg-white rounded-xl shadow-sm p-6 border hover:border-purple-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Manage Businesses</h3>
                  <p className="text-sm text-gray-500">View and manage all businesses</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
