'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  X,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  IndianRupee,
} from 'lucide-react';
import { format } from 'date-fns';
import { useBusinessStore } from '@/store';
import { partyService, Party, CreatePartyRequest } from '@/services/party.service';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function PartiesPage() {
  const { currentBusiness } = useBusinessStore();
  const [parties, setParties] = useState<Party[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Customer' | 'Supplier'>('all');

  const [formData, setFormData] = useState<CreatePartyRequest>({
    name: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
    type: 'Both',
    openingBalance: 0,
    notes: '',
  });

  useEffect(() => {
    if (currentBusiness) {
      fetchParties();
    }
  }, [currentBusiness, filterType]);

  const fetchParties = async () => {
    if (!currentBusiness) return;

    try {
      setIsLoading(true);
      const params = {
        pageSize: 100,
        type: filterType !== 'all' ? filterType : undefined,
      };
      const response = await partyService.getParties(currentBusiness.id, params);
      setParties(response?.items || []);
    } catch (error) {
      console.error('Failed to fetch parties:', error);
      toast.error('Failed to load parties');
      setParties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBusiness) return;

    if (!formData.name.trim()) {
      toast.error('Please enter party name');
      return;
    }

    try {
      if (editingParty) {
        await partyService.updateParty(currentBusiness.id, editingParty.id, formData);
        toast.success('Party updated successfully');
      } else {
        await partyService.createParty(currentBusiness.id, formData);
        toast.success('Party created successfully');
      }

      setSlideOverOpen(false);
      setEditingParty(null);
      resetForm();
      fetchParties();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save party';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!currentBusiness || !selectedParty) return;

    try {
      await partyService.deleteParty(currentBusiness.id, selectedParty.id);
      toast.success('Party deleted successfully');
      setDeleteModalOpen(false);
      setSelectedParty(null);
      fetchParties();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete party';
      toast.error(message);
    }
  };

  const handleEdit = (party: Party) => {
    setEditingParty(party);
    setFormData({
      name: party.name,
      phone: party.phone || '',
      email: party.email || '',
      address: party.address || '',
      gstNumber: party.gstNumber || '',
      type: party.type,
      openingBalance: party.openingBalance,
      notes: party.notes || '',
    });
    setSlideOverOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      gstNumber: '',
      type: 'Both',
      openingBalance: 0,
      notes: '',
    });
  };

  const openSlideOver = () => {
    setEditingParty(null);
    resetForm();
    setSlideOverOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currentBusiness?.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(Math.abs(value));
  };

  const filteredParties = parties.filter((party) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      party.name.toLowerCase().includes(search) ||
      party.phone?.toLowerCase().includes(search) ||
      party.email?.toLowerCase().includes(search)
    );
  });

  // Calculate totals
  const totals = filteredParties.reduce(
    (acc, party) => {
      if (party.currentBalance > 0) {
        acc.receivable += party.currentBalance;
      } else {
        acc.payable += Math.abs(party.currentBalance);
      }
      return acc;
    },
    { receivable: 0, payable: 0 }
  );

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Please select a business to view parties</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Parties (Khata)</h1>
        </div>
        <button
          onClick={openSlideOver}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Party
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white rounded-lg border p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm text-gray-500">Milega</p>
              <p className="text-sm sm:text-xl font-bold text-green-600">{formatCurrency(totals.receivable)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm text-gray-500">Dena Hai</p>
              <p className="text-sm sm:text-xl font-bold text-red-600">{formatCurrency(totals.payable)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm text-gray-500">Parties</p>
              <p className="text-sm sm:text-xl font-bold text-gray-900">{filteredParties.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
        >
          <option value="all">All Parties</option>
          <option value="Customer">Customers</option>
          <option value="Supplier">Suppliers</option>
        </select>
      </div>

      {/* Parties List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : filteredParties.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No parties found</p>
            <button onClick={openSlideOver} className="mt-3 text-green-600 font-medium">
              + Add your first party
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {filteredParties.map((party) => (
              <Link
                key={party.id}
                href={`/dashboard/parties/${party.id}`}
                className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-base sm:text-lg font-semibold text-gray-600">
                      {party.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{party.name}</h3>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-500">
                      {party.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span className="hidden xs:inline">{party.phone}</span>
                        </span>
                      )}
                      <span className="text-xs bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded">
                        {party.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="text-right">
                    <p
                      className={`text-sm sm:text-lg font-semibold ${
                        party.currentBalance > 0
                          ? 'text-green-600'
                          : party.currentBalance < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {formatCurrency(party.currentBalance)}
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      {party.currentBalance > 0
                        ? 'Aapko milega'
                        : party.currentBalance < 0
                        ? 'Aapko dena hai'
                        : 'Settled'}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleEdit(party);
                      }}
                      className="p-2 hover:bg-gray-200 rounded text-gray-500"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedParty(party);
                        setDeleteModalOpen(true);
                      }}
                      className="p-2 hover:bg-red-100 rounded text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
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
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    {editingParty ? 'Edit Party' : 'Add New Party'}
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
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Party Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter party name"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter phone number"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter email"
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Party Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="Both">Both (Customer & Supplier)</option>
                        <option value="Customer">Customer (Grahak)</option>
                        <option value="Supplier">Supplier (Vikreta)</option>
                      </select>
                    </div>

                    {/* Opening Balance */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opening Balance (Purana Hisab)
                      </label>
                      <input
                        type="number"
                        value={formData.openingBalance}
                        onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Positive = Party owes you | Negative = You owe party
                      </p>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter address"
                      />
                    </div>

                    {/* GST Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GST Number
                      </label>
                      <input
                        type="text"
                        value={formData.gstNumber}
                        onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter GST number"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Any additional notes"
                      />
                    </div>
                  </form>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 px-4 py-4 border-t bg-white">
                  <button
                    type="button"
                    onClick={() => setSlideOverOpen(false)}
                    className="flex-1 py-2.5 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    {editingParty ? 'Update' : 'Save'}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Party</h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete "{selectedParty?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedParty(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
