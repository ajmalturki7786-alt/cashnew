import api from '@/lib/api';
import { ApiResponse, Business, BusinessSummary, CreateBusinessRequest } from '@/types';

export const businessService = {
  getBusinesses: async (): Promise<BusinessSummary[]> => {
    const response = await api.get<ApiResponse<BusinessSummary[]>>('/business');
    return response.data.data!;
  },

  getBusiness: async (businessId: string): Promise<Business> => {
    const response = await api.get<ApiResponse<Business>>(`/business/${businessId}`);
    return response.data.data!;
  },

  createBusiness: async (data: CreateBusinessRequest): Promise<Business> => {
    const response = await api.post<ApiResponse<Business>>('/business', data);
    return response.data.data!;
  },

  updateBusiness: async (businessId: string, data: CreateBusinessRequest): Promise<Business> => {
    const response = await api.put<ApiResponse<Business>>(`/business/${businessId}`, data);
    return response.data.data!;
  },

  deleteBusiness: async (businessId: string): Promise<void> => {
    await api.delete(`/business/${businessId}`);
  },
};
