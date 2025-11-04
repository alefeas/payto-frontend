import apiClient from '@/lib/api-client';

export interface Notification {
  id: string;
  userId: string;
  companyId: string;
  companyName: string;
  type: NotificationType;
  title: string;
  message: string;
  data: {
    entityType?: string;
    entityId?: string;
    newStatus?: string;
    oldStatus?: string;
    amount?: number;
    dueDate?: string;
    daysOverdue?: number;
    fromCompany?: string;
    [key: string]: any;
  };
  read: boolean;
  createdAt: string;
}

export type NotificationType = 
  | 'invoice_received'
  | 'invoice_pending_approval'
  | 'invoice_status_changed'
  | 'invoice_due_soon'
  | 'invoice_overdue'
  | 'invoice_due_reminder'
  | 'invoice_needs_review'
  | 'payment_received'
  | 'payment_status_changed'
  | 'payment_reminder'
  | 'connection_request'
  | 'connection_accepted'
  | 'connection_rejected'
  | 'system_alert';

export const notificationService = {
  async getNotifications(companyId: string, unreadOnly = false): Promise<Notification[]> {
    try {
      const params = unreadOnly ? '?unread_only=true' : '';
      const response = await apiClient.get(`/companies/${companyId}/notifications${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  async getUnreadCount(companyId: string): Promise<number> {
    try {
      const response = await apiClient.get(`/companies/${companyId}/notifications/unread`);
      return response.data.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  async markAllAsRead(companyId: string): Promise<boolean> {
    try {
      await apiClient.post(`/companies/${companyId}/notifications/read-all`);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  },
};
