import api from '@/lib/api';
import { ApiResponse, Staff, InviteStaffRequest, PagedResponse, PaginationParams } from '@/types';

export const staffService = {
  getStaff: async (businessId: string, params?: PaginationParams): Promise<PagedResponse<Staff>> => {
    const response = await api.get<ApiResponse<PagedResponse<Staff>>>(
      `/business/${businessId}/staff`,
      { params }
    );
    return response.data.data!;
  },

  getStaffMember: async (businessId: string, staffId: string): Promise<Staff> => {
    const response = await api.get<ApiResponse<Staff>>(
      `/business/${businessId}/staff/${staffId}`
    );
    return response.data.data!;
  },

  inviteStaff: async (businessId: string, data: InviteStaffRequest): Promise<Staff> => {
    const response = await api.post<ApiResponse<Staff>>(
      `/business/${businessId}/staff`,
      data
    );
    return response.data.data!;
  },

  updateStaffRole: async (
    businessId: string, 
    staffId: string, 
    role: 'Accountant' | 'Viewer',
    canDeleteEntries?: boolean,
    requiresApproval?: boolean
  ): Promise<Staff> => {
    const response = await api.put<ApiResponse<Staff>>(
      `/business/${businessId}/staff/${staffId}/role`,
      { 
        role, 
        canDeleteEntries: canDeleteEntries ?? false,
        requiresApproval: requiresApproval ?? true
      }
    );
    return response.data.data!;
  },

  toggleStaffStatus: async (businessId: string, staffId: string): Promise<void> => {
    await api.patch(`/business/${businessId}/staff/${staffId}/toggle`);
  },

  removeStaff: async (businessId: string, staffId: string): Promise<void> => {
    await api.delete(`/business/${businessId}/staff/${staffId}`);
  },
};
