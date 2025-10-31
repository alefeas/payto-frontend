import apiClient from '@/lib/api-client';

export interface Notification {
  id: string;
  userId: string;
  companyId: string;
  companyName: string;
  type: string;
  title: string;
  message: string;
  data: {
    entityType?: string;
    entityId?: string;
    amount?: number;
    fromCompany?: string;
  };
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  async getNotifications(companyId: string, unreadOnly = false): Promise<Notification[]> {
    const params = unreadOnly ? '?unread_only=true' : '';
    const response = await apiClient.get(`/companies/${companyId}/notifications${params}`);
    return response.data.data;
  },

  async getUnreadCount(companyId: string): Promise<number> {
    const response = await apiClient.get(`/companies/${companyId}/notifications/unread`);
    return response.data.data.count;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead(companyId: string): Promise<void> {
    await apiClient.post(`/companies/${companyId}/notifications/read-all`);
  },
};
