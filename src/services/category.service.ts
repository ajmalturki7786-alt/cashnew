import api from '@/lib/api';
import { ApiResponse, Category } from '@/types';

export const categoryService = {
  getCategories: async (
    businessId: string, 
    type?: 'Income' | 'Expense',
    includeInactive?: boolean
  ): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>(
      `/business/${businessId}/categories`,
      { params: { type, includeInactive } }
    );
    return response.data.data!;
  },

  createCategory: async (
    businessId: string, 
    data: { name: string; description?: string; type: 'Income' | 'Expense'; icon?: string; color?: string }
  ): Promise<Category> => {
    const response = await api.post<ApiResponse<Category>>(
      `/business/${businessId}/categories`,
      data
    );
    return response.data.data!;
  },

  updateCategory: async (
    businessId: string, 
    categoryId: string,
    data: { name: string; description?: string; icon?: string; color?: string; isActive?: boolean }
  ): Promise<Category> => {
    const response = await api.put<ApiResponse<Category>>(
      `/business/${businessId}/categories/${categoryId}`,
      data
    );
    return response.data.data!;
  },

  deleteCategory: async (businessId: string, categoryId: string): Promise<void> => {
    await api.delete(`/business/${businessId}/categories/${categoryId}`);
  },
};
