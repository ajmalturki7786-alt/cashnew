'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Download,
  Plus,
  Minus,
  Calendar,
  FileText,
  Edit,
  Send,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { useBusinessStore } from '@/store';
import { partyService, Party, PartyLedger, PartyLedgerEntry } from '@/services/party.service';
import { formatInTimezone } from '@/lib/timezone';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function PartyLedgerPage() {
  const params = useParams();
  const partyId = params.partyId as string;
  const { currentBusiness } = useBusinessStore();
  const [ledger, setLedger] = useState<PartyLedger | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (currentBusiness && partyId) {
      fetchLedger();
    }
  }, [currentBusiness, partyId, dateRange]);

  const fetchLedger = async () => {
    if (!currentBusiness) return;

    try {
      setIsLoading(true);
      const data = await partyService.getPartyLedger(currentBusiness.id, partyId, {
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      });
      setLedger(data);
    } catch (error) {
      console.error('Failed to fetch ledger:', error);
      toast.error('Failed to load party ledger');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currentBusiness?.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(Math.abs(value));
  };

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Please select a business</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!ledger) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Party not found</p>
        <Link href="/dashboard/parties" className="mt-3 text-green-600 font-medium">
          ← Back to Parties
        </Link>
      </div>
    );
  }

  const party = ledger.party;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard/parties"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{party.name}</h1>
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
              {party.phone && (
                <a href={`tel:${party.phone}`} className="flex items-center gap-1 hover:text-green-600">
                  <Phone className="h-3 w-3" />
                  <span className="hidden xs:inline">{party.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs sm:text-sm font-medium">
            <Send className="h-4 w-4" />
            <span className="hidden xs:inline">Remind</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs sm:text-sm font-medium">
            <Download className="h-4 w-4" />
            <span className="hidden xs:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white rounded-lg border p-2 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500">Opening</p>
          <p className="text-sm sm:text-xl font-bold text-gray-900">{formatCurrency(party.openingBalance)}</p>
        </div>
        <div className="bg-white rounded-lg border p-2 sm:p-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            <p className="text-xs sm:text-sm text-gray-500">Jama</p>
          </div>
          <p className="text-sm sm:text-xl font-bold text-green-600">{formatCurrency(ledger.totalDebit)}</p>
        </div>
        <div className="bg-white rounded-lg border p-2 sm:p-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
            <p className="text-xs sm:text-sm text-gray-500">Naam</p>
          </div>
          <p className="text-sm sm:text-xl font-bold text-red-600">{formatCurrency(ledger.totalCredit)}</p>
        </div>
        <div className={`rounded-lg border p-2 sm:p-4 ${ledger.netBalance > 0 ? 'bg-green-50 border-green-200' : ledger.netBalance < 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
          <p className="text-xs sm:text-sm text-gray-500">Balance</p>
          <p className={`text-sm sm:text-xl font-bold ${ledger.netBalance > 0 ? 'text-green-600' : ledger.netBalance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {formatCurrency(ledger.netBalance)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
            {ledger.netBalance > 0 ? 'Aapko milega' : ledger.netBalance < 0 ? 'Aapko dena hai' : 'Settled'}
          </p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="flex-1 sm:flex-none px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <span className="text-gray-500 text-sm">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="flex-1 sm:flex-none px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        {(dateRange.startDate || dateRange.endDate) && (
          <button
            onClick={() => setDateRange({ startDate: '', endDate: '' })}
            className="text-sm text-green-600 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Mobile Ledger Cards */}
      <div className="block sm:hidden space-y-2">
        {/* Opening Balance */}
        <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Opening Balance</span>
          <span className="text-sm font-bold text-gray-900">{formatCurrency(party.openingBalance)}</span>
        </div>
        
        {ledger.entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No transactions found</div>
        ) : (
          ledger.entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-lg border p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-bold ${entry.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.type === 'Income' ? '+' : '-'}{formatCurrency(entry.amount)}
                    </span>
                    {entry.attachmentUrl && <FileText className="h-3.5 w-3.5 text-blue-600" />}
                  </div>
                  <p className="text-sm text-gray-700 mt-1 truncate">{entry.description || entry.categoryName || '-'}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>{formatInTimezone(entry.date, 'dd MMM, yyyy')}</span>
                    {entry.isModified && (
                      <span className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800">Edited</span>
                    )}
                  </div>
                </div>
                <div className="text-right ml-3">
                  <span className={`text-sm font-medium ${
                    entry.runningBalance > 0 ? 'text-green-600' : entry.runningBalance < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    Bal: {formatCurrency(entry.runningBalance)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Closing Balance */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Closing Balance</span>
            <span className={`text-sm font-bold ${ledger.netBalance > 0 ? 'text-green-600' : ledger.netBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {formatCurrency(ledger.netBalance)}
            </span>
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span className="text-green-600">Jama: {formatCurrency(ledger.totalDebit)}</span>
            <span className="text-red-600">Naam: {formatCurrency(ledger.totalCredit)}</span>
          </div>
        </div>
      </div>

      {/* Desktop Ledger Table */}
      <div className="hidden sm:block bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Jama (Credit)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Naam (Debit)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Balance
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Bill
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Opening Balance Row */}
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-500">-</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Opening Balance</td>
                <td className="px-4 py-3 text-sm text-gray-500">-</td>
                <td className="px-4 py-3 text-right text-sm text-gray-500">-</td>
                <td className="px-4 py-3 text-right text-sm text-gray-500">-</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {formatCurrency(party.openingBalance)}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-500">-</td>
              </tr>

              {ledger.entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                ledger.entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {formatInTimezone(entry.date, 'dd MMM, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatInTimezone(entry.date, 'hh:mm a')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{entry.description || '-'}</div>
                      {entry.reference && (
                        <div className="text-xs text-gray-500">Ref: {entry.reference}</div>
                      )}
                      {entry.isModified && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Edit className="h-2.5 w-2.5 mr-1" />
                          Edited
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {entry.categoryName || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {entry.type === 'Income' ? (
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(entry.amount)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {entry.type === 'Expense' ? (
                        <span className="text-sm font-medium text-red-600">
                          {formatCurrency(entry.amount)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-medium ${
                        entry.runningBalance > 0 ? 'text-green-600' : entry.runningBalance < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {formatCurrency(entry.runningBalance)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {entry.attachmentUrl ? (
                        <a
                          href={entry.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-green-600 hover:text-green-700"
                        >
                          <FileText className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}

              {/* Closing Balance Row */}
              <tr className="bg-gray-50 font-medium">
                <td className="px-4 py-3 text-sm text-gray-500">-</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Closing Balance</td>
                <td className="px-4 py-3 text-sm text-gray-500">-</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-green-600">
                  {formatCurrency(ledger.totalDebit)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-red-600">
                  {formatCurrency(ledger.totalCredit)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-sm font-bold ${
                    ledger.netBalance > 0 ? 'text-green-600' : ledger.netBalance < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {formatCurrency(ledger.netBalance)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-500">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 flex gap-2 sm:gap-3 safe-area-bottom">
        <Link
          href={`/dashboard/cashbook?partyId=${partyId}&type=Income`}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full shadow-lg transition-colors text-sm sm:text-base"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden xs:inline">Payment</span> Received
        </Link>
        <Link
          href={`/dashboard/cashbook?partyId=${partyId}&type=Expense`}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-full shadow-lg transition-colors text-sm sm:text-base"
        >
          <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden xs:inline">Payment</span> Given
        </Link>
      </div>
      
      {/* Bottom spacing for fixed buttons */}
      <div className="h-20 sm:h-0"></div>
    </div>
  );
}
