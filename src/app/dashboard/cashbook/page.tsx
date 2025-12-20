'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  X,
  ArrowLeft,
  Settings,
  UserPlus,
  Upload,
  FileText,
  Calendar,
  Clock,
  Users,
  Tag,
  CreditCard,
  FileCheck,
  Info,
  Paperclip,
  Bell,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useBusinessStore } from '@/store';
import { cashbookService } from '@/services/cashbook';
import { categoryService } from '@/services/category';
import { partyService, PartySearchResult } from '@/services/party.service';
import { CashEntry, Category } from '@/types';
import { formatInTimezone, getDateStringInTimezone, getTimeStringInTimezone } from '@/lib/timezone';
import toast from 'react-hot-toast';

export default function CashbookPage() {
  const { currentBusiness } = useBusinessStore();
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [slideOverType, setSlideOverType] = useState<'Income' | 'Expense'>('Income');
  const [editingEntry, setEditingEntry] = useState<CashEntry | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<CashEntry | null>(null);
  const [modificationReason, setModificationReason] = useState('');
  const [showModificationReasonModal, setShowModificationReasonModal] = useState(false);
  
  // Check if user can delete entries (owner or has permission)
  const canDeleteEntries = currentBusiness?.userRole === 'Owner' || currentBusiness?.canDeleteEntries === true;
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Income' | 'Expense'>('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPaymentMode, setFilterPaymentMode] = useState('');
  const [filterParty, setFilterParty] = useState('');
  const [filterDuration, setFilterDuration] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDescending, setSortDescending] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  // Party search
  const [partySearchResults, setPartySearchResults] = useState<PartySearchResult[]>([]);
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);

  // File attachment
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value);
      setPage(1);
    }, 500);
  };

  // Form state
  const [formData, setFormData] = useState({
    type: 'Income' as 'Income' | 'Expense',
    amount: '',
    partyName: '',
    partyId: '' as string | undefined,
    categoryId: '',
    description: '',
    date: getDateStringInTimezone(),
    time: getTimeStringInTimezone(),
    paymentMode: 'Cash',
    reference: '',
    dueDate: '',
  });

  useEffect(() => {
    if (currentBusiness) {
      fetchEntries();
      fetchCategories();
    }
  }, [currentBusiness, page, filterType, filterCategory, dateRange, debouncedSearchTerm, sortBy, sortDescending]);

  const fetchEntries = async () => {
    if (!currentBusiness) return;
    
    try {
      setIsLoading(true);
      const params = {
        page,
        pageSize,
        entryType: filterType !== 'all' ? filterType : undefined,
        categoryId: filterCategory ? filterCategory : undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        searchTerm: debouncedSearchTerm.trim() || undefined,
        sortBy: sortBy === 'date' ? 'entryDate' : sortBy,
        sortDescending,
      };
      console.log('Fetching entries for business:', currentBusiness.id, 'params:', params);
      const response = await cashbookService.getEntries(currentBusiness.id, params);
      console.log('Entries response:', response);
      setEntries(response?.items || []);
      setTotalPages(response?.totalPages || 1);
      setTotalCount(response?.totalCount || 0);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
      toast.error('Failed to load cash entries');
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!currentBusiness) return;
    
    try {
      const data = await categoryService.getCategories(currentBusiness.id);
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentBusiness) return;
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // If editing, show modification reason modal
    if (editingEntry && !modificationReason) {
      setShowModificationReasonModal(true);
      return;
    }

    try {
      // Combine date and time into ISO datetime string
      const entryDateTime = new Date(`${formData.date}T${formData.time || '00:00'}`).toISOString();
      
      if (editingEntry) {
        const payload = {
          type: formData.type,
          amount: parseFloat(formData.amount),
          entryDate: entryDateTime,
          categoryId: formData.categoryId || undefined,
          description: formData.description || undefined,
          reference: formData.reference || undefined,
          partyName: formData.partyName || undefined,
          modificationReason: modificationReason,
          partyId: formData.partyId || undefined,
          dueDate: formData.dueDate || undefined,
        };
        await cashbookService.updateEntry(currentBusiness.id, editingEntry.id, payload);
        
        // Upload attachment if selected
        if (selectedFile) {
          await cashbookService.uploadAttachment(currentBusiness.id, editingEntry.id, selectedFile);
        }
        
        toast.success('Entry updated successfully');
      } else {
        const payload = {
          type: formData.type,
          amount: parseFloat(formData.amount),
          entryDate: entryDateTime,
          categoryId: formData.categoryId || undefined,
          description: formData.description || undefined,
          reference: formData.reference || undefined,
          partyName: formData.partyName || undefined,
          partyId: formData.partyId || undefined,
          dueDate: formData.dueDate || undefined,
        };
        const newEntry = await cashbookService.createEntry(currentBusiness.id, payload);
        
        // Upload attachment if selected
        if (selectedFile) {
          await cashbookService.uploadAttachment(currentBusiness.id, newEntry.id, selectedFile);
        }
        
        toast.success('Entry created successfully');
      }

      setSlideOverOpen(false);
      setEditingEntry(null);
      setModificationReason('');
      setSelectedFile(null);
      resetForm();
      fetchEntries();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save entry';
      toast.error(message);
    }
  };

  const handleSaveAndAddNew = async () => {
    if (!currentBusiness) return;
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const payload = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        entryDate: formData.date,
        categoryId: formData.categoryId || undefined,
        description: formData.description || undefined,
        reference: formData.reference || undefined,
        partyName: formData.partyName || undefined,
        partyId: formData.partyId || undefined,
        dueDate: formData.dueDate || undefined,
      };

      await cashbookService.createEntry(currentBusiness.id, payload);
      toast.success('Entry created successfully');
      resetForm();
      fetchEntries();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save entry';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!currentBusiness || !selectedEntry) return;

    try {
      await cashbookService.deleteEntry(currentBusiness.id, selectedEntry.id);
      toast.success('Entry deleted successfully');
      setDeleteModalOpen(false);
      setSelectedEntry(null);
      fetchEntries();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete entry';
      toast.error(message);
    }
  };

  const handleEdit = (entry: CashEntry) => {
    setEditingEntry(entry);
    setModificationReason('');
    setSelectedFile(null);
    const entryType = entry.type === 'Income' ? 'Income' : 'Expense' as 'Income' | 'Expense';
    setFormData({
      type: entryType,
      amount: entry.amount.toString(),
      partyName: entry.partyName || '',
      partyId: entry.partyId || undefined,
      categoryId: entry.categoryId?.toString() || '',
      description: entry.description || '',
      date: formatInTimezone(entry.entryDate || entry.date || entry.createdAt, 'yyyy-MM-dd'),
      time: formatInTimezone(entry.entryDate || entry.date || entry.createdAt, 'HH:mm'),
      paymentMode: entry.paymentMode || 'Cash',
      reference: entry.reference || '',
      dueDate: entry.dueDate ? formatInTimezone(entry.dueDate, 'yyyy-MM-dd') : '',
    });
    setSlideOverType(entryType);
    setSlideOverOpen(true);
  };

  const resetForm = () => {
    setFormData({
      type: slideOverType,
      amount: '',
      partyName: '',
      partyId: undefined,
      categoryId: '',
      description: '',
      date: getDateStringInTimezone(),
      time: getTimeStringInTimezone(),
      paymentMode: 'Cash',
      reference: '',
      dueDate: '',
    });
    setSelectedFile(null);
    setPartySearchResults([]);
  };

  const searchParties = async (query: string) => {
    if (!currentBusiness) {
      setPartySearchResults([]);
      return;
    }
    try {
      const results = await partyService.searchParties(currentBusiness.id, query || '');
      setPartySearchResults(results);
      setShowPartyDropdown(true);
    } catch (error) {
      console.error('Failed to search parties:', error);
    }
  };

  const loadAllParties = async () => {
    if (!currentBusiness) return;
    try {
      const results = await partyService.searchParties(currentBusiness.id, '');
      setPartySearchResults(results);
      setShowPartyDropdown(true);
    } catch (error) {
      console.error('Failed to load parties:', error);
    }
  };

  const selectParty = (party: PartySearchResult) => {
    setFormData({
      ...formData,
      partyName: party.name,
      partyId: party.id,
    });
    setShowPartyDropdown(false);
    setPartySearchResults([]);
  };

  const openSlideOver = (type: 'Income' | 'Expense') => {
    setSlideOverType(type);
    setEditingEntry(null);
    // Reset form with the new type
    setFormData({
      type: type,
      amount: '',
      partyName: '',
      partyId: undefined,
      categoryId: '',
      description: '',
      date: getDateStringInTimezone(),
      time: getTimeStringInTimezone(),
      paymentMode: 'Cash',
      reference: '',
      dueDate: '',
    });
    setSelectedFile(null);
    setPartySearchResults([]);
    setShowPartyDropdown(false);
    setSlideOverOpen(true);
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!currentBusiness) return;

    try {
      toast.loading('Generating export...');
      const blob = await cashbookService.exportEntries(currentBusiness.id, {
        format,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cashbook-${format === 'pdf' ? 'report.pdf' : 'report.xlsx'}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('Export downloaded successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currentBusiness?.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Use entries directly - server handles filtering
  const filteredEntries = entries || [];

  // Calculate totals
  const totals = filteredEntries.reduce(
    (acc, entry) => {
      if (entry.type === 'Income') {
        acc.cashIn += entry.amount;
      } else {
        acc.cashOut += entry.amount;
      }
      return acc;
    },
    { cashIn: 0, cashOut: 0 }
  );

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Please select a business to view the cashbook</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with back button and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
            {currentBusiness?.name || 'Cashbook'}
          </h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg hidden sm:block">
            <Settings className="h-4 w-4 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg hidden sm:block">
            <UserPlus className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => {}}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg border border-green-200"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden xs:inline">Bulk</span>
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg border border-green-200"
          >
            <Download className="h-4 w-4" />
            <span className="hidden xs:inline">Reports</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
        <select 
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          value={filterDuration}
          onChange={(e) => {
            const value = e.target.value;
            setFilterDuration(value);
            const today = new Date();
            switch (value) {
              case 'today':
                setDateRange({ 
                  startDate: format(today, 'yyyy-MM-dd'), 
                  endDate: format(today, 'yyyy-MM-dd') 
                });
                break;
              case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                setDateRange({ 
                  startDate: format(yesterday, 'yyyy-MM-dd'), 
                  endDate: format(yesterday, 'yyyy-MM-dd') 
                });
                break;
              case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(weekStart.getDate() - 7);
                setDateRange({ 
                  startDate: format(weekStart, 'yyyy-MM-dd'), 
                  endDate: format(today, 'yyyy-MM-dd') 
                });
                break;
              case 'month':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                setDateRange({ 
                  startDate: format(monthStart, 'yyyy-MM-dd'), 
                  endDate: format(today, 'yyyy-MM-dd') 
                });
                break;
              case 'lastMonth':
                const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                setDateRange({ 
                  startDate: format(lastMonthStart, 'yyyy-MM-dd'), 
                  endDate: format(lastMonthEnd, 'yyyy-MM-dd') 
                });
                break;
              case 'year':
                const yearStart = new Date(today.getFullYear(), 0, 1);
                setDateRange({ 
                  startDate: format(yearStart, 'yyyy-MM-dd'), 
                  endDate: format(today, 'yyyy-MM-dd') 
                });
                break;
              default:
                setDateRange({ startDate: '', endDate: '' });
            }
            setPage(1);
          }}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">Last 7 Days</option>
          <option value="month">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="year">This Year</option>
        </select>

        <select 
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value as 'all' | 'Income' | 'Expense'); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="all">All Types</option>
          <option value="Income">Cash In</option>
          <option value="Expense">Cash Out</option>
        </select>

        <select 
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select 
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="date">Sort: Date</option>
          <option value="amount">Sort: Amount</option>
        </select>

        <button
          onClick={() => setSortDescending(!sortDescending)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white hover:bg-gray-50"
        >
          {sortDescending ? '↓ Newest' : '↑ Oldest'}
        </button>

        {(filterType !== 'all' || filterCategory || filterDuration !== 'all' || searchTerm) && (
          <button
            onClick={() => {
              setFilterType('all');
              setFilterCategory('');
              setFilterDuration('all');
              setDateRange({ startDate: '', endDate: '' });
              setSearchTerm('');
              setPage(1);
            }}
            className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Search and Add Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by description, party, reference..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); setDebouncedSearchTerm(''); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => openSlideOver('Income')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Cash In</span>
          </button>
          <button
            onClick={() => openSlideOver('Expense')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
          >
            <Minus className="h-4 w-4" />
            <span>Cash Out</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white rounded-lg border p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm text-gray-500">Cash In</p>
              <p className="text-sm sm:text-xl font-bold text-gray-900">{formatCurrency(totals.cashIn)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Minus className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm text-gray-500">Cash Out</p>
              <p className="text-sm sm:text-xl font-bold text-gray-900">{formatCurrency(totals.cashOut)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              totals.cashIn - totals.cashOut >= 0 ? 'bg-blue-100' : 'bg-red-100'
            }`}>
              <span className={`text-sm sm:text-lg font-bold ${
                totals.cashIn - totals.cashOut >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>=</span>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm text-gray-500">Net</p>
              <p className={`text-sm sm:text-xl font-bold ${
                totals.cashIn - totals.cashOut >= 0 ? 'text-gray-900' : 'text-red-600'
              }`}>
                {formatCurrency(totals.cashIn - totals.cashOut)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Entries count and pagination info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-500">
        <span className="hidden sm:inline">Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, totalCount)} of {totalCount} entries</span>
        <span className="sm:hidden">{totalCount} entries</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50 border"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50 border"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No entries found</div>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-lg border p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${entry.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.type === 'Income' ? '+' : '-'}{formatCurrency(entry.amount)}
                    </span>
                    {entry.isModified && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Edit className="h-2.5 w-2.5 mr-0.5" />
                        Modified
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate mt-1">
                    {entry.partyName || entry.description || '-'}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>{formatInTimezone(entry.entryDate || entry.date, 'dd MMM, hh:mm a')}</span>
                    {entry.categoryName && (
                      <>
                        <span>•</span>
                        <span>{entry.categoryName}</span>
                      </>
                    )}
                  </div>
                  {/* Creator/Modifier Info */}
                  <div className="mt-1.5 text-xs text-gray-500">
                    <span className="text-blue-600">By: {entry.createdByUserName || 'Unknown'}</span>
                    {entry.isModified && entry.updatedByUserName && (
                      <span className="text-yellow-600 ml-2">
                        • Edited: {entry.updatedByUserName}
                      </span>
                    )}
                  </div>
                  {entry.isDue && entry.dueDate && (
                    <div className="mt-1">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                        <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                        Due {formatInTimezone(entry.dueDate, 'dd MMM, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {entry.attachmentUrl && (
                    <span className="p-1 text-blue-600">
                      <Paperclip className="h-4 w-4" />
                    </span>
                  )}
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {canDeleteEntries && (
                    <button
                      onClick={() => {
                        setSelectedEntry(entry);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 hover:bg-red-50 rounded text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Party Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mode
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bill
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    No entries found
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 group">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {formatInTimezone(entry.entryDate || entry.date, 'dd MMM, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatInTimezone(entry.entryDate || entry.date, 'hh:mm a')}
                      </div>
                      {/* Creator Info */}
                      <div className="text-xs text-blue-600 mt-1">
                        By: {entry.createdByUserName || 'Unknown'}
                      </div>
                      {entry.isModified && (
                        <div className="mt-1 flex flex-col gap-0.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 w-fit">
                            <Edit className="h-3 w-3 mr-1" />
                            Modified
                          </span>
                          <div className="text-xs text-yellow-600">
                            By: {entry.updatedByUserName}
                          </div>
                          <div className="text-xs text-gray-400">
                            {entry.updatedAt && formatInTimezone(entry.updatedAt, 'dd MMM, hh:mm a')}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.partyName || '-'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {entry.attachmentUrl && (
                          <span className="inline-flex items-center text-blue-600" title="Has attachment">
                            <Paperclip className="h-3 w-3" />
                          </span>
                        )}
                        {entry.isDue && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Due {entry.dueDate && formatInTimezone(entry.dueDate, 'dd MMM, yyyy')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {entry.description || '-'}
                      </div>
                      {entry.isModified && entry.modificationReason && (
                        <div className="text-xs text-yellow-600 mt-1" title={entry.modificationReason}>
                          <span className="font-medium">Reason:</span> {entry.modificationReason.length > 30 ? entry.modificationReason.substring(0, 30) + '...' : entry.modificationReason}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {entry.categoryName || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {entry.paymentMode || 'Cash'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {entry.reference ? (
                        <FileCheck className="h-4 w-4 text-gray-400" />
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-medium ${
                        entry.type === 'Income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {entry.type === 'Income' ? '+' : '-'}{formatCurrency(entry.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-gray-900">
                        {formatCurrency(entry.runningBalance || 0)}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1 mt-1">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-1 hover:bg-gray-200 rounded text-gray-500"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        {canDeleteEntries && (
                          <button
                            onClick={() => {
                              setSelectedEntry(entry);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1 hover:bg-red-100 rounded text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Panel for Add/Edit */}
      {slideOverOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-50" onClick={() => setSlideOverOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex max-w-full">
            <div className="w-screen sm:max-w-md transform transition-transform duration-300 ease-in-out">
              <div className="flex h-full flex-col bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 sm:py-4 border-b bg-white safe-area-top">
                  <h2 className={`text-base sm:text-lg font-semibold ${
                    formData.type === 'Income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {editingEntry ? 'Edit Entry' : `Add ${formData.type === 'Income' ? 'Cash In' : 'Cash Out'} Entry`}
                  </h2>
                  <button
                    onClick={() => setSlideOverOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto p-4">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Type Toggle */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'Income' })}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                          formData.type === 'Income'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Cash In
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'Expense' })}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                          formData.type === 'Expense'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Cash Out
                      </button>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                          <Clock className="h-4 w-4 text-gray-400" />
                          Time
                        </label>
                        <input
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                        Amount <span className="text-red-500">*</span>
                        <Info className="h-4 w-4 text-gray-400" />
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                        placeholder="eg. 890 or 100 + 200*3"
                      />
                    </div>

                    {/* Party Name (Contact) */}
                    <div>
                      <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1.5">
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          Party Name (Contact)
                        </span>
                        <Settings className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.partyName}
                          onChange={(e) => {
                            setFormData({ ...formData, partyName: e.target.value, partyId: '' });
                            searchParties(e.target.value);
                          }}
                          onFocus={() => loadAllParties()}
                          onBlur={() => setTimeout(() => setShowPartyDropdown(false), 300)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Search or Select Party"
                        />
                        {formData.partyName && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, partyName: '', partyId: undefined });
                              setShowPartyDropdown(false);
                            }}
                            className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer" onClick={() => loadAllParties()} />
                        
                        {/* Party Search Dropdown */}
                        {showPartyDropdown && partySearchResults.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {partySearchResults.map((party) => (
                              <div
                                key={party.id}
                                onClick={() => selectParty(party)}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{party.name}</span>
                                  <span className="text-xs text-gray-500">{party.type}</span>
                                </div>
                                <span className={`text-sm font-medium ${party.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  ₹{Math.abs(party.currentBalance).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Empty state when no parties */}
                        {showPartyDropdown && partySearchResults.length === 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-center">
                            <p className="text-gray-500 text-sm">No parties found</p>
                            <a href="/dashboard/parties" className="text-green-600 text-sm font-medium hover:underline">
                              + Add New Party
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Remarks */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Remarks
                      </label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g. Enter Details (Name, Bill No, Item Name, Quantity etc)"
                      />
                    </div>

                    {/* Category & Payment Mode */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1.5">
                          <span className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-gray-400" />
                            Category
                          </span>
                          <Settings className="h-4 w-4 text-gray-400 cursor-pointer" />
                        </label>
                        <div className="relative">
                          <select
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                          >
                            <option value="">Search or Select</option>
                            {categories
                              .filter((cat) => cat.type === formData.type || cat.type === 'Both')
                              .map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1.5">
                          <span className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            Payment Mode
                          </span>
                          <Settings className="h-4 w-4 text-gray-400 cursor-pointer" />
                        </label>
                        <div className="relative">
                          <select
                            value={formData.paymentMode}
                            onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                          >
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="Card">Card</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cheque">Cheque</option>
                          </select>
                          <div className="absolute right-8 top-1/2 -translate-y-1/2">
                            <button 
                              type="button"
                              onClick={() => setFormData({ ...formData, paymentMode: '' })}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Due Date & Attachment */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                          <Bell className="h-4 w-4 text-gray-400" />
                          Due Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                          <Paperclip className="h-4 w-4 text-gray-400" />
                          Attachment
                        </label>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-left flex items-center gap-2"
                        >
                          {selectedFile ? (
                            <span className="text-green-600 truncate">{selectedFile.name}</span>
                          ) : (
                            <span className="text-gray-500">Choose File</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center gap-3 px-4 py-4 border-t bg-white">
                  <button
                    type="button"
                    onClick={handleSaveAndAddNew}
                    className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Save & Add New
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 py-2.5 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Entry</h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete this entry? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedEntry(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modification Reason Modal */}
      {showModificationReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Modification Reason</h3>
            <p className="text-gray-500 mb-4">
              Please provide a reason for modifying this entry. This will be recorded for audit purposes.
            </p>
            <textarea
              value={modificationReason}
              onChange={(e) => setModificationReason(e.target.value)}
              placeholder="Enter reason for modification..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
              rows={3}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModificationReasonModal(false);
                  setModificationReason('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={(e) => {
                  if (!modificationReason.trim()) {
                    toast.error('Please enter a reason for modification');
                    return;
                  }
                  setShowModificationReasonModal(false);
                  handleSubmit(e as any);
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
