import { api } from '@/lib/axios';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export class NotificationService {
  /**
   * 🔔 Fetch all alerts/notifications for the user
   */
  static async getNotifications(): Promise<NotificationItem[]> {
    const response = await api.get('/api/notifications');
    return response.data?.notifications || [];
  }

  /**
   * 👁️ Mark a specific notification as read
   */
  static async markAsRead(id: string): Promise<NotificationItem> {
    const response = await api.patch(`/api/notifications/${id}/read`);
    return response.data?.notification;
  }

  /**
   * 👁️ Mark all notifications as read
   */
  static async markAllAsRead(): Promise<void> {
    await api.post('/api/notifications/read-all');
  }

  /**
   * 📲 Register client push token on the server
   */
  static async registerPushToken(token: string): Promise<void> {
    await api.post('/api/notifications/register-token', { token });
  }
}
