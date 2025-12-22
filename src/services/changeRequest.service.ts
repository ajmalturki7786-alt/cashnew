import api from '@/lib/api';
import {
  ApiResponse,
  ChangeRequest,
  CreateChangeRequest,
  ReviewChangeRequest,
  ChangeRequestSummary,
  PagedResponse,
  PaginationParams,
} from '@/types';

export const changeRequestService = {
  // Get all change requests for a business
  getChangeRequests: async (
    businessId: string,
    params?: PaginationParams & { status?: string }
  ): Promise<PagedResponse<ChangeRequest>> => {
    const response = await api.get<ApiResponse<PagedResponse<ChangeRequest>>>(
      `/business/${businessId}/changerequests`,
      { params }
    );
    return response.data.data!;
  },

  // Get a specific change request
  getChangeRequest: async (
    businessId: string,
    requestId: string
  ): Promise<ChangeRequest> => {
    const response = await api.get<ApiResponse<ChangeRequest>>(
      `/business/${businessId}/changerequests/${requestId}`
    );
    return response.data.data!;
  },

  // Create a new change request (for accountants)
  createChangeRequest: async (
    businessId: string,
    data: CreateChangeRequest
  ): Promise<ChangeRequest> => {
    const response = await api.post<ApiResponse<ChangeRequest>>(
      `/business/${businessId}/changerequests`,
      data
    );
    return response.data.data!;
  },

  // Review (approve/reject) a change request (for owners)
  reviewChangeRequest: async (
    businessId: string,
    requestId: string,
    data: ReviewChangeRequest
  ): Promise<ChangeRequest> => {
    const response = await api.post<ApiResponse<ChangeRequest>>(
      `/business/${businessId}/changerequests/${requestId}/review`,
      data
    );
    return response.data.data!;
  },

  // Get change request summary
  getChangeRequestSummary: async (
    businessId: string
  ): Promise<ChangeRequestSummary> => {
    const response = await api.get<ApiResponse<ChangeRequestSummary>>(
      `/business/${businessId}/changerequests/summary`
    );
    return response.data.data!;
  },

  // Check if an entry has a pending change request
  getPendingRequestForEntry: async (
    businessId: string,
    entryId: string
  ): Promise<ChangeRequest | null> => {
    const response = await api.get<ApiResponse<ChangeRequest | null>>(
      `/business/${businessId}/changerequests/entry/${entryId}/pending`
    );
    return response.data.data || null;
  },
};
