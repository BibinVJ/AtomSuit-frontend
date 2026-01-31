import { useState, useCallback } from 'react';
import api from '../services/api';
import { Notification, NotificationApiResponse, UnreadNotificationApiResponse } from '../types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<NotificationApiResponse>('/notifications');
      setNotifications(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get<UnreadNotificationApiResponse>('/notifications/unread');

      if (res.data.data) {
        setUnreadCount(res.data.data.unread_count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.post(`/notifications/read/${id}`);
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.post('/notifications/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  };
};
