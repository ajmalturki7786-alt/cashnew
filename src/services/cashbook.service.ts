import api from '@/lib/api';
import { 
  ApiResponse, 
  CashEntry, 
  CreateCashEntryRequest, 
  PagedResponse, 
  PaginationParams,
  CashbookSummary 
} from '@/types';

export const cashbookService = {
  getEntries: async (
    businessId: string, 
    params?: PaginationParams & { 
      startDate?: string; 
      endDate?: string; 
      categoryId?: string;
      entryType?: string;
      partyId?: string;
    }
  ): Promise<PagedResponse<CashEntry>> => {
    const response = await api.get<ApiResponse<PagedResponse<CashEntry>>>(
      `/business/${businessId}/cashbook`,
      { params }
    );
    return response.data.data!;
  },

  getEntry: async (businessId: string, entryId: string): Promise<CashEntry> => {
    const response = await api.get<ApiResponse<CashEntry>>(
      `/business/${businessId}/cashbook/${entryId}`
    );
    return response.data.data!;
  },

  createEntry: async (businessId: string, data: CreateCashEntryRequest): Promise<CashEntry> => {
    const response = await api.post<ApiResponse<CashEntry>>(
      `/business/${businessId}/cashbook`,
      data
    );
    return response.data.data!;
  },

  updateEntry: async (
    businessId: string, 
    entryId: string, 
    data: CreateCashEntryRequest & { modificationReason?: string }
  ): Promise<CashEntry> => {
    const response = await api.put<ApiResponse<CashEntry>>(
      `/business/${businessId}/cashbook/${entryId}`,
      data
    );
    return response.data.data!;
  },

  deleteEntry: async (businessId: string, entryId: string, reason?: string): Promise<{ message?: string }> => {
    const response = await api.delete<ApiResponse<boolean>>(
      `/business/${businessId}/cashbook/${entryId}`,
      { data: reason ? { reason } : undefined }
    );
    return { message: response.data.message };
  },

  getSummary: async (businessId: string): Promise<CashbookSummary> => {
    const response = await api.get<ApiResponse<CashbookSummary>>(
      `/business/${businessId}/cashbook/summary`
    );
    return response.data.data!;
  },

  exportEntries: async (
    businessId: string, 
    params: { 
      format: 'pdf' | 'excel'; 
      startDate?: string; 
      endDate?: string; 
    }
  ): Promise<Blob> => {
    const response = await api.get(
      `/business/${businessId}/reports/cashbook/export/${params.format}`,
      { 
        params: { startDate: params.startDate, endDate: params.endDate },
        responseType: 'blob' 
      }
    );
    return response.data;
  },

  uploadAttachment: async (businessId: string, entryId: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<ApiResponse<string>>(
      `/business/${businessId}/cashbook/${entryId}/attachment`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!;
  },

  deleteAttachment: async (businessId: string, entryId: string): Promise<void> => {
    await api.delete(`/business/${businessId}/cashbook/${entryId}/attachment`);
  },

  getDueReminders: async (businessId: string): Promise<CashEntry[]> => {
    const response = await api.get<ApiResponse<CashEntry[]>>(
      `/business/${businessId}/cashbook/due-reminders`
    );
    return response.data.data!;
  },
};
