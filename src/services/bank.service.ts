import api from '@/lib/api';
import { 
  ApiResponse, 
  BankAccount, 
  CreateBankAccountRequest, 
  BankTransaction, 
  CreateBankTransactionRequest,
  PagedResponse,
  PaginationParams,
  CashBankTransferRequest,
  CashEntry
} from '@/types';

export const bankService = {
  // Bank Accounts
  getAccounts: async (businessId: string): Promise<BankAccount[]> => {
    const response = await api.get<ApiResponse<BankAccount[]>>(
      `/business/${businessId}/bank/accounts`
    );
    return response.data.data!;
  },

  getAccount: async (businessId: string, accountId: string): Promise<BankAccount> => {
    const response = await api.get<ApiResponse<BankAccount>>(
      `/business/${businessId}/bank/accounts/${accountId}`
    );
    return response.data.data!;
  },

  createAccount: async (businessId: string, data: CreateBankAccountRequest): Promise<BankAccount> => {
    const response = await api.post<ApiResponse<BankAccount>>(
      `/business/${businessId}/bank/accounts`,
      data
    );
    return response.data.data!;
  },

  updateAccount: async (
    businessId: string, 
    accountId: string, 
    data: Partial<CreateBankAccountRequest>
  ): Promise<BankAccount> => {
    const response = await api.put<ApiResponse<BankAccount>>(
      `/business/${businessId}/bank/accounts/${accountId}`,
      data
    );
    return response.data.data!;
  },

  toggleAccountStatus: async (businessId: string, accountId: string): Promise<void> => {
    await api.patch(`/business/${businessId}/bank/accounts/${accountId}/toggle`);
  },

  deleteAccount: async (businessId: string, accountId: string): Promise<void> => {
    await api.delete(`/business/${businessId}/bank/accounts/${accountId}`);
  },

  // Bank Transactions
  getTransactions: async (
    businessId: string,
    params?: PaginationParams & {
      bankAccountId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<PagedResponse<BankTransaction>> => {
    const response = await api.get<ApiResponse<PagedResponse<BankTransaction>>>(
      `/business/${businessId}/bank/transactions`,
      { params }
    );
    return response.data.data!;
  },

  createTransaction: async (
    businessId: string, 
    data: CreateBankTransactionRequest
  ): Promise<BankTransaction> => {
    const response = await api.post<ApiResponse<BankTransaction>>(
      `/business/${businessId}/bank/transactions`,
      data
    );
    return response.data.data!;
  },

  deleteTransaction: async (businessId: string, transactionId: string): Promise<void> => {
    await api.delete(`/business/${businessId}/bank/transactions/${transactionId}`);
  },

  // Cash <-> Bank Transfer
  transfer: async (
    businessId: string, 
    data: CashBankTransferRequest
  ): Promise<{ cashEntry: CashEntry; bankTransaction: BankTransaction }> => {
    const response = await api.post<ApiResponse<{ cashEntry: CashEntry; bankTransaction: BankTransaction }>>(
      `/business/${businessId}/bank/transfer`,
      data
    );
    return response.data.data!;
  },
};
