'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Edit,
  Trash2,
  X,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { useBusinessStore } from '@/store';
import { bankService } from '@/services/bank';
import { BankAccount, BankTransaction } from '@/types';
import { formatInTimezone, getDateStringInTimezone } from '@/lib/timezone';
import toast from 'react-hot-toast';

export default function BankPage() {
  const { currentBusiness } = useBusinessStore();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);

  // Account form
  const [accountForm, setAccountForm] = useState({
    bankName: '',
    accountNumber: '',
    accountType: 'Savings',
    ifscCode: '',
    openingBalance: '',
  });

  // Transaction form
  const [transactionForm, setTransactionForm] = useState({
    type: 'Deposit' as 'Deposit' | 'Withdrawal' | 'Transfer',
    amount: '',
    description: '',
    date: getDateStringInTimezone(),
    reference: '',
  });

  useEffect(() => {
    if (currentBusiness) {
      fetchAccounts();
    }
  }, [currentBusiness]);

  useEffect(() => {
    if (selectedAccount && currentBusiness) {
      fetchTransactions(selectedAccount.id);
    }
  }, [selectedAccount, currentBusiness]);

  const fetchAccounts = async () => {
    if (!currentBusiness) return;

    try {
      setIsLoading(true);
      const data = await bankService.getAccounts(currentBusiness.id);
      setAccounts(data);
      if (data.length > 0 && !selectedAccount) {
        setSelectedAccount(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      toast.error('Failed to load bank accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async (accountId: string) => {
    if (!currentBusiness) return;

    try {
      const data = await bankService.getTransactions(currentBusiness.id, { bankAccountId: accountId });
      setTransactions(data.items || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBusiness) return;

    if (!accountForm.bankName.trim()) {
      toast.error('Bank name is required');
      return;
    }

    if (!accountForm.accountNumber.trim()) {
      toast.error('Account number is required');
      return;
    }

    try {
      const payload = {
        ...accountForm,
        openingBalance: parseFloat(accountForm.openingBalance) || 0,
      };

      if (editingAccount) {
        await bankService.updateAccount(currentBusiness.id, editingAccount.id, payload);
        toast.success('Account updated successfully');
      } else {
        await bankService.createAccount(currentBusiness.id, payload);
        toast.success('Account created successfully');
      }

      setAccountModalOpen(false);
      setEditingAccount(null);
      resetAccountForm();
      fetchAccounts();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save account';
      toast.error(message);
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBusiness || !selectedAccount) return;

    if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const payload = {
        bankAccountId: selectedAccount.id,
        type: transactionForm.type as 'Deposit' | 'Withdrawal' | 'CashToBank' | 'BankToCash' | 'BankTransfer',
        amount: parseFloat(transactionForm.amount),
        transactionDate: transactionForm.date,
        description: transactionForm.description || undefined,
        reference: transactionForm.reference || undefined,
      };

      await bankService.createTransaction(currentBusiness.id, payload);
      toast.success('Transaction recorded successfully');
      setTransactionModalOpen(false);
      resetTransactionForm();
      fetchTransactions(selectedAccount.id);
      fetchAccounts(); // Refresh balances
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to record transaction';
      toast.error(message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentBusiness || !accountToDelete) return;

    try {
      await bankService.deleteAccount(currentBusiness.id, accountToDelete.id);
      toast.success('Account deleted successfully');
      setDeleteModalOpen(false);
      setAccountToDelete(null);
      if (selectedAccount?.id === accountToDelete.id) {
        setSelectedAccount(null);
        setTransactions([]);
      }
      fetchAccounts();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete account';
      toast.error(message);
    }
  };

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account);
    setAccountForm({
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountType: account.accountType || 'Savings',
      ifscCode: account.ifscCode || '',
      openingBalance: (account.openingBalance || 0).toString(),
    });
    setAccountModalOpen(true);
  };

  const resetAccountForm = () => {
    setAccountForm({
      bankName: '',
      accountNumber: '',
      accountType: 'Savings',
      ifscCode: '',
      openingBalance: '',
    });
  };

  const resetTransactionForm = () => {
    setTransactionForm({
      type: 'Deposit',
      amount: '',
      description: '',
      date: getDateStringInTimezone(),
      reference: '',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currentBusiness?.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Please select a business to view bank accounts</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Passbook</h1>
          <p className="text-gray-500">Manage your bank accounts and transactions</p>
        </div>
        <button
          onClick={() => {
            resetAccountForm();
            setEditingAccount(null);
            setAccountModalOpen(true);
          }}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Bank Account
        </button>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <p className="text-sm opacity-80">Total Bank Balance</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
        <p className="text-sm opacity-80 mt-2">{accounts.length} account(s)</p>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            onClick={() => setSelectedAccount(account)}
            className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
              selectedAccount?.id === account.id
                ? 'ring-2 ring-primary-500'
                : 'hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Landmark className="h-5 w-5 text-primary-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900">{account.bankName}</h3>
                  <p className="text-sm text-gray-500">
                    ****{account.accountNumber.slice(-4)}
                  </p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle menu
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Current Balance</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(account.currentBalance)}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-400">{account.accountType}</span>
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditAccount(account);
                  }}
                  className="p-1 text-gray-400 hover:text-primary-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAccountToDelete(account);
                    setDeleteModalOpen(true);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {accounts.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <Landmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bank accounts yet</h3>
            <p className="text-gray-500 mb-4">Add your first bank account to get started</p>
            <button
              onClick={() => {
                resetAccountForm();
                setAccountModalOpen(true);
              }}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Bank Account
            </button>
          </div>
        )}
      </div>

      {/* Transactions Section */}
      {selectedAccount && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedAccount.bankName} Transactions
              </h3>
              <p className="text-sm text-gray-500">
                Account: ****{selectedAccount.accountNumber.slice(-4)}
              </p>
            </div>
            <button
              onClick={() => {
                resetTransactionForm();
                setTransactionModalOpen(true);
              }}
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatInTimezone(txn.transactionDate || txn.date || txn.createdAt, 'dd MMM, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            txn.type === 'Deposit'
                              ? 'bg-green-100 text-green-800'
                              : txn.type === 'Withdrawal'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {txn.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {txn.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        <span
                          className={
                            txn.type === 'Deposit' ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          {txn.type === 'Deposit' ? '+' : '-'}
                          {formatCurrency(txn.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(txn.balanceAfter)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Account Modal */}
      {accountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingAccount ? 'Edit Bank Account' : 'Add Bank Account'}
              </h3>
              <button
                onClick={() => {
                  setAccountModalOpen(false);
                  setEditingAccount(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAccountSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountForm.bankName}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, bankName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., State Bank of India"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountForm.accountNumber}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, accountNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  value={accountForm.accountType}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, accountType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                  <option value="Fixed Deposit">Fixed Deposit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={accountForm.ifscCode}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, ifscCode: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., SBIN0001234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opening Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={accountForm.openingBalance}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, openingBalance: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setAccountModalOpen(false);
                    setEditingAccount(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingAccount ? 'Update' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {transactionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add Transaction</h3>
              <button
                onClick={() => setTransactionModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleTransactionSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(['Deposit', 'Withdrawal', 'Transfer'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTransactionForm({ ...transactionForm, type })}
                    className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      transactionForm.type === type
                        ? type === 'Deposit'
                          ? 'bg-green-600 text-white'
                          : type === 'Withdrawal'
                          ? 'bg-red-600 text-white'
                          : 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={transactionForm.amount}
                  onChange={(e) =>
                    setTransactionForm({ ...transactionForm, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={transactionForm.date}
                  onChange={(e) =>
                    setTransactionForm({ ...transactionForm, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(e) =>
                    setTransactionForm({ ...transactionForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference / Cheque No.
                </label>
                <input
                  type="text"
                  value={transactionForm.reference}
                  onChange={(e) =>
                    setTransactionForm({ ...transactionForm, reference: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., CHQ-001"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setTransactionModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete <strong>{accountToDelete?.bankName}</strong>? 
              This will also delete all associated transactions.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setAccountToDelete(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleDeleteAccount} className="btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
