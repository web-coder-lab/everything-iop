// Notifications API Layer. No local success fallbacks are permitted in production flows.
import { apiClient } from './client';
import type { Notification, ApiResponse } from '../../types';

export const NotificationApi = {
  getNotifications(category?: string): Promise<ApiResponse<Notification[]>> {
    const url = category && category !== 'all' ? `/notifications?category=${encodeURIComponent(category)}` : '/notifications';
    return apiClient.request<Notification[]>(url);
  },
  markAsRead(notificationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.request(`/notifications/${encodeURIComponent(notificationId)}/read`, { method: 'POST' });
  },
  markAllAsRead(): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.request('/notifications/read-all', { method: 'POST' });
  },
  deleteNotification(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return apiClient.request(`/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
  addNotification(notification: Omit<Notification, 'id' | 'time'>): Promise<Notification> {
    return apiClient.request<Notification>('/notifications', { method: 'POST', body: JSON.stringify(notification) }).then((r) => {
      if (!r.data) throw new Error('Notification was not returned by the server.');
      return r.data;
    });
  },
  async getUnreadCount(): Promise<number> {
    const res = await apiClient.request<{ count: number }>('/notifications/unread-count');
    return Number(res.data?.count || 0);
  },
};
