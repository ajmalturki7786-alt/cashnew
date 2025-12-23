import api from '@/lib/api';

// Types
export interface AdminDashboard {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalBusinesses: number;
  totalCashEntries: number;
  totalBankTransactions: number;
  totalCashIn: number;
  totalCashOut: number;
  todayNewUsers: number;
  todayNewBusinesses: number;
  userGrowth: { date: string; count: number }[];
  businessGrowth: { date: string; count: number }[];
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  isAdmin: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  businessCount: number;
  businesses: AdminBusinessSummary[];
}

export interface AdminBusinessSummary {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminBusiness {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
  staffCount: number;
  cashEntryCount: number;
  bankAccountCount: number;
  totalCashIn: number;
  totalCashOut: number;
  currentBalance: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// API Functions
export const adminService = {
  // Check if current user is admin
  checkAdminStatus: async (): Promise<boolean> => {
    const response = await api.get('/admin/check');
    return response.data.data;
  },

  // Dashboard
  getDashboard: async (): Promise<AdminDashboard> => {
    const response = await api.get('/admin/dashboard');
    return response.data.data;
  },

  // Users
  getUsers: async (
    page = 1,
    pageSize = 20,
    search?: string,
    isActive?: boolean
  ): Promise<PaginatedResponse<AdminUser>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (search) params.append('search', search);
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    
    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data.data;
  },

  getUser: async (userId: string): Promise<AdminUser> => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data.data;
  },

  blockUser: async (userId: string, reason?: string): Promise<boolean> => {
    const response = await api.post(`/admin/users/${userId}/block`, { userId, reason });
    return response.data.data;
  },

  unblockUser: async (userId: string): Promise<boolean> => {
    const response = await api.post(`/admin/users/${userId}/unblock`);
    return response.data.data;
  },

  deleteUser: async (userId: string): Promise<boolean> => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data.data;
  },

  makeAdmin: async (userId: string): Promise<boolean> => {
    const response = await api.post(`/admin/users/${userId}/make-admin`);
    return response.data.data;
  },

  removeAdmin: async (userId: string): Promise<boolean> => {
    const response = await api.post(`/admin/users/${userId}/remove-admin`);
    return response.data.data;
  },

  // Businesses
  getBusinesses: async (
    page = 1,
    pageSize = 20,
    search?: string,
    isActive?: boolean
  ): Promise<PaginatedResponse<AdminBusiness>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (search) params.append('search', search);
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    
    const response = await api.get(`/admin/businesses?${params.toString()}`);
    return response.data.data;
  },

  getBusiness: async (businessId: string): Promise<AdminBusiness> => {
    const response = await api.get(`/admin/businesses/${businessId}`);
    return response.data.data;
  },

  activateBusiness: async (businessId: string): Promise<boolean> => {
    const response = await api.post(`/admin/businesses/${businessId}/activate`);
    return response.data.data;
  },

  deactivateBusiness: async (businessId: string): Promise<boolean> => {
    const response = await api.post(`/admin/businesses/${businessId}/deactivate`);
    return response.data.data;
  },

  deleteBusiness: async (businessId: string): Promise<boolean> => {
    const response = await api.delete(`/admin/businesses/${businessId}`);
    return response.data.data;
  },
};
