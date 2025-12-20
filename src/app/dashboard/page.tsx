'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useBusinessStore } from '@/store';
import { reportService } from '@/services/report';
import { Dashboard } from '@/types';
import toast from 'react-hot-toast';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const { currentBusiness } = useBusinessStore();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<Dashboard | null>(null);

  const fetchDashboard = async () => {
    if (!currentBusiness) return;
    
    try {
      setIsLoading(true);
      const data = await reportService.getDashboard(currentBusiness.id);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [currentBusiness]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Business Selected</h2>
          <p className="text-gray-500 mb-4">Please create or select a business to view the dashboard</p>
          <a
            href="/dashboard/businesses/new"
            className="btn-primary inline-block"
          >
            Create Business
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const stats = [
    {
      name: 'Cash Balance',
      value: formatCurrency(dashboardData?.cashBalance || 0),
      icon: Wallet,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      name: 'Today Income',
      value: formatCurrency(dashboardData?.todayIncome || 0),
      icon: ArrowUpRight,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      name: 'Today Expense',
      value: formatCurrency(dashboardData?.todayExpense || 0),
      icon: ArrowDownRight,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
    },
    {
      name: 'Bank Balance',
      value: formatCurrency(dashboardData?.totalBankBalance || 0),
      icon: Landmark,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">{currentBusiness.name}</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="btn-secondary flex items-center justify-center sm:justify-start w-full sm:w-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow p-3 sm:p-6 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-0"
          >
            <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 sm:h-6 sm:w-6 ${stat.textColor}`} />
            </div>
            <div className="sm:ml-4 text-center sm:text-left">
              <p className="text-xs sm:text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-sm sm:text-xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Cash Flow Trend */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Last 7 Days</h3>
          <div className="h-48 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData?.last7DaysTransactions || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Expense"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Top Expense Categories</h3>
          <div className="h-48 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData?.topExpenseCategories || []}
                  dataKey="totalAmount"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 100}
                  label={({ categoryName, percentage }) => `${categoryName} (${percentage?.toFixed(0) || 0}%)`}
                  labelLine={false}
                >
                  {(dashboardData?.topExpenseCategories || []).map((entry: { categoryName: string }, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions and Monthly Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Income Categories */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Top Income Categories</h3>
          <div className="h-48 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.topIncomeCategories || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoryName" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="totalAmount" fill="#10b981" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Entries</h3>
            <a href="/dashboard/cashbook" className="text-xs sm:text-sm text-primary-600 hover:text-primary-700">
              View all
            </a>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {(dashboardData?.recentCashEntries || []).slice(0, 5).map((entry: { id: string; type: string; description?: string; categoryName?: string; date: string; amount: number }) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center min-w-0">
                  <div
                    className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                      entry.type === 'Income'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {entry.type === 'Income' ? (
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </div>
                  <div className="ml-2 sm:ml-3 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      {entry.description || entry.categoryName || 'No description'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs sm:text-sm font-semibold ml-2 flex-shrink-0 ${
                    entry.type === 'Income' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {entry.type === 'Income' ? '+' : '-'}
                  {formatCurrency(entry.amount)}
                </span>
              </div>
            ))}
            {(!dashboardData?.recentCashEntries || dashboardData.recentCashEntries.length === 0) && (
              <p className="text-center text-gray-500 py-8">No recent entries</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
