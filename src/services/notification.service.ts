import api from '@/lib/api';
import {
  ApiResponse,
  Notification,
  NotificationSummary,
  PagedResponse,
  PaginationParams,
} from '@/types';

export const notificationService = {
  // Get all notifications for the current user
  getNotifications: async (
    params?: PaginationParams & { unreadOnly?: boolean }
  ): Promise<PagedResponse<Notification>> => {
    const response = await api.get<ApiResponse<PagedResponse<Notification>>>(
      '/notifications',
      { params }
    );
    return response.data.data!;
  },

  // Get notification summary (unread count)
  getNotificationSummary: async (
    businessId?: string
  ): Promise<NotificationSummary> => {
    const response = await api.get<ApiResponse<NotificationSummary>>(
      '/notifications/summary',
      { params: { businessId } }
    );
    return response.data.data!;
  },

  // Mark a notification as read
  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await api.post<ApiResponse<Notification>>(
      `/notifications/${notificationId}/read`
    );
    return response.data.data!;
  },

  // Mark all notifications as read
  markAllAsRead: async (businessId?: string): Promise<number> => {
    const response = await api.post<ApiResponse<number>>(
      '/notifications/read-all',
      null,
      { params: { businessId } }
    );
    return response.data.data!;
  },
};
