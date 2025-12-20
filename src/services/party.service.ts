import api from '@/lib/api';

export interface Party {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  type: 'Customer' | 'Supplier' | 'Both';
  openingBalance: number;
  currentBalance: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  totalTransactions: number;
}

export interface CreatePartyRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  type: 'Customer' | 'Supplier' | 'Both';
  openingBalance: number;
  notes?: string;
}

export interface PartyLedgerEntry {
  id: string;
  date: string;
  type: 'Income' | 'Expense';
  description?: string;
  reference?: string;
  amount: number;
  runningBalance: number;
  categoryName?: string;
  attachmentUrl?: string;
  isModified: boolean;
}

export interface PartyLedger {
  party: Party;
  totalDebit: number;
  totalCredit: number;
  netBalance: number;
  entries: PartyLedgerEntry[];
}

export interface PartySearchResult {
  id: string;
  name: string;
  phone?: string;
  currentBalance: number;
  type: string;
}

export const partyService = {
  async getParties(businessId: string, params?: {
    page?: number;
    pageSize?: number;
    type?: string;
    search?: string;
  }) {
    const response = await api.get(`/business/${businessId}/parties`, { params });
    return response.data;
  },

  async getParty(businessId: string, partyId: string) {
    const response = await api.get(`/business/${businessId}/parties/${partyId}`);
    return response.data;
  },

  async createParty(businessId: string, data: CreatePartyRequest) {
    const response = await api.post(`/business/${businessId}/parties`, data);
    return response.data;
  },

  async updateParty(businessId: string, partyId: string, data: CreatePartyRequest & { isActive?: boolean }) {
    const response = await api.put(`/business/${businessId}/parties/${partyId}`, data);
    return response.data;
  },

  async deleteParty(businessId: string, partyId: string) {
    const response = await api.delete(`/business/${businessId}/parties/${partyId}`);
    return response.data;
  },

  async searchParties(businessId: string, query: string): Promise<PartySearchResult[]> {
    const response = await api.get(`/business/${businessId}/parties/search`, {
      params: { q: query }
    });
    return response.data;
  },

  async getPartyLedger(businessId: string, partyId: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<PartyLedger> {
    const response = await api.get(`/business/${businessId}/parties/${partyId}/ledger`, { params });
    return response.data;
  }
};
