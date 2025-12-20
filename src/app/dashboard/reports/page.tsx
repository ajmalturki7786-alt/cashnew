'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Filter,
  Loader2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useBusinessStore } from '@/store';
import { reportService } from '@/services/report';
import { categoryService } from '@/services/category';
import { CashbookReport, CategorySummary, Category, CashEntryReportItem } from '@/types';
import { formatInTimezone, getDateStringInTimezone } from '@/lib/timezone';
import toast from 'react-hot-toast';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const dateRangePresets = [
  { label: 'Today', getValue: () => ({ start: new Date(), end: new Date() }) },
  { label: 'Last 7 Days', getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: 'This Month', getValue: () => ({ start: startOfMonth(new Date()), end: new Date() }) },
  { label: 'Last Month', getValue: () => ({ 
    start: startOfMonth(subMonths(new Date(), 1)), 
    end: endOfMonth(subMonths(new Date(), 1)) 
  })},
  { label: 'Last 3 Months', getValue: () => ({ start: subMonths(new Date(), 3), end: new Date() }) },
];

export default function ReportsPage() {
  const { currentBusiness } = useBusinessStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [cashbookReport, setCashbookReport] = useState<CashbookReport | null>(null);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: getDateStringInTimezone(),
  });
  const [selectedPreset, setSelectedPreset] = useState('This Month');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedEntryType, setSelectedEntryType] = useState<string>('');
  
  // Sorting and pagination state
  const [sortField, setSortField] = useState<keyof CashEntryReportItem>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 25;

  useEffect(() => {
    if (currentBusiness) {
      loadCategories();
    }
  }, [currentBusiness]);

  useEffect(() => {
    if (currentBusiness) {
      generateReport();
    }
  }, [currentBusiness, dateRange, selectedCategory, selectedEntryType]);

  const loadCategories = async () => {
    if (!currentBusiness) return;
    try {
      const cats = await categoryService.getCategories(currentBusiness.id);
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  useEffect(() => {
    if (currentBusiness) {
      generateReport();
    }
  }, [currentBusiness, dateRange]);

  const handlePresetChange = (preset: typeof dateRangePresets[0]) => {
    setSelectedPreset(preset.label);
    const range = preset.getValue();
    if (range) {
      setDateRange({
        startDate: format(range.start, 'yyyy-MM-dd'),
        endDate: format(range.end, 'yyyy-MM-dd'),
      });
    }
  };

  const generateReport = async () => {
    if (!currentBusiness) return;

    try {
      setIsLoading(true);
      const [report, categories] = await Promise.all([
        reportService.getCashbookReport(
          currentBusiness.id,
          dateRange.startDate,
          dateRange.endDate,
          selectedCategory || undefined,
          selectedEntryType || undefined
        ),
        reportService.getCategorySummary(
          currentBusiness.id,
          dateRange.startDate,
          dateRange.endDate
        ),
      ]);

      setCashbookReport(report);
      setCategorySummary(categories);
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (exportFormat: 'pdf' | 'excel') => {
    if (!currentBusiness) return;

    try {
      setIsExporting(true);
      toast.loading(`Generating ${exportFormat.toUpperCase()}...`, { id: 'export' });
      
      if (exportFormat === 'pdf') {
        await reportService.exportCashbookPdf(
          currentBusiness.id,
          dateRange.startDate,
          dateRange.endDate,
          selectedCategory || undefined,
          selectedEntryType || undefined
        );
      } else {
        await reportService.exportCashbookExcel(
          currentBusiness.id,
          dateRange.startDate,
          dateRange.endDate,
          selectedCategory || undefined,
          selectedEntryType || undefined
        );
      }
      
      toast.success(`${exportFormat.toUpperCase()} downloaded successfully!`, { id: 'export' });
    } catch (error) {
      console.error('Failed to export report:', error);
      toast.error(`Failed to export ${exportFormat.toUpperCase()}`, { id: 'export' });
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currentBusiness?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Sorted and paginated entries
  const sortedEntries = useMemo(() => {
    if (!cashbookReport?.entries) return [];
    
    const entries = [...cashbookReport.entries];
    entries.sort((a, b) => {
      let aVal: string | number = a[sortField] ?? '';
      let bVal: string | number = b[sortField] ?? '';
      
      // Handle date comparison
      if (sortField === 'date') {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      }
      
      // Handle numeric fields
      if (sortField === 'amount' || sortField === 'balance') {
        aVal = a[sortField];
        bVal = b[sortField];
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return entries;
  }, [cashbookReport?.entries, sortField, sortDirection]);

  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return sortedEntries.slice(start, start + entriesPerPage);
  }, [sortedEntries, currentPage]);

  const totalPages = Math.ceil(sortedEntries.length / entriesPerPage);

  const handleSort = (field: keyof CashEntryReportItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: keyof CashEntryReportItem }) => {
    if (sortField !== field) return <ChevronUp className="h-4 w-4 text-gray-300" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-primary-600" />
      : <ChevronDown className="h-4 w-4 text-primary-600" />;
  };

  const incomeCategories = categorySummary.filter(c => c.type === 'Income');
  const expenseCategories = categorySummary.filter(c => c.type === 'Expense');

  if (!currentBusiness) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-semibold text-gray-900">No Business Selected</h3>
          <p className="mt-1 text-gray-500">Please select a business to view reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Financial reports and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportReport('pdf')}
            disabled={isExporting || isLoading}
            className="flex items-center px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export PDF
          </button>
          <button
            onClick={() => exportReport('excel')}
            disabled={isExporting || isLoading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export Excel
          </button>
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {dateRangePresets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetChange(preset)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  selectedPreset === preset.label
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => {
                setDateRange({ ...dateRange, startDate: e.target.value });
                setSelectedPreset('');
              }}
              className="px-3 py-1.5 text-sm border rounded-lg"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => {
                setDateRange({ ...dateRange, endDate: e.target.value });
                setSelectedPreset('');
              }}
              className="px-3 py-1.5 text-sm border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <select
            value={selectedEntryType}
            onChange={(e) => setSelectedEntryType(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded-lg bg-white"
          >
            <option value="">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded-lg bg-white min-w-[150px]"
          >
            <option value="">All Categories</option>
            {categories
              .filter(c => !selectedEntryType || c.type === selectedEntryType)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.type})
                </option>
              ))}
          </select>
          {(selectedCategory || selectedEntryType) && (
            <button
              onClick={() => {
                setSelectedCategory('');
                setSelectedEntryType('');
              }}
              className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(cashbookReport?.totalIncome || 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Total Expense</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {formatCurrency(cashbookReport?.totalExpense || 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Net Cash Flow</p>
              <p className={`text-2xl font-bold mt-2 ${
                (cashbookReport?.totalIncome || 0) - (cashbookReport?.totalExpense || 0) >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {formatCurrency((cashbookReport?.totalIncome || 0) - (cashbookReport?.totalExpense || 0))}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Closing Balance</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(cashbookReport?.closingBalance || 0)}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income by Category */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Income by Category</h3>
              <div className="h-80">
                {incomeCategories.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeCategories}
                        dataKey="totalAmount"
                        nameKey="categoryName"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ categoryName, percentage }) => `${categoryName} (${percentage?.toFixed(0)}%)`}
                      >
                        {incomeCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No income data available
                  </div>
                )}
              </div>
            </div>

            {/* Expense by Category */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense by Category</h3>
              <div className="h-80">
                {expenseCategories.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseCategories} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                      <YAxis dataKey="categoryName" type="category" width={100} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="totalAmount" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No expense data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category Summary Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Category Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entries
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categorySummary.map((category) => (
                    <tr key={category.categoryId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.categoryName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            category.type === 'Income'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {category.type === 'Income' ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {category.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {category.entryCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <span className={category.type === 'Income' ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(category.totalAmount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {category.percentage?.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                  {categorySummary.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No data available for the selected date range
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Entries Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                All Entries ({sortedEntries.length})
              </h3>
              {totalPages > 1 && (
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        <SortIcon field="date" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center gap-1">
                        Type
                        <SortIcon field="type" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('categoryName')}
                    >
                      <div className="flex items-center gap-1">
                        Category
                        <SortIcon field="categoryName" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Party
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Amount
                        <SortIcon field="amount" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('balance')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Balance
                        <SortIcon field="balance" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedEntries.map((entry, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatInTimezone(entry.date, 'dd MMM, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            entry.type === 'Income'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {entry.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.categoryName || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {entry.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.partyName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <span className={entry.type === 'Income' ? 'text-green-600' : 'text-red-600'}>
                          {entry.type === 'Income' ? '+' : '-'}{formatCurrency(entry.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(entry.balance)}
                      </td>
                    </tr>
                  ))}
                  {sortedEntries.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No entries found for the selected date range
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between bg-gray-50">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, sortedEntries.length)} of {sortedEntries.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="px-3 py-1 text-sm">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
