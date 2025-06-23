import { useState, useEffect, useCallback } from "react";
import {
  notificationsApi,
  Notification,
  NotificationFilters,
  NotificationsResponse,
} from "@/api/notifications";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface UseNotificationsReturn {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  meta: NotificationsResponse["meta"] | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  markAsRead: (id: number) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (id: number) => Promise<boolean>;
  clearAll: () => Promise<boolean>;
}

export function useNotifications(
  filters?: NotificationFilters,
): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [meta, setMeta] = useState<NotificationsResponse["meta"] | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const fetchNotifications = useCallback(
    async (loadMore = false) => {
      if (!isAuthenticated) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      try {
        setLoading(!loadMore);
        setError(null);

        const currentPage = loadMore ? (meta?.current_page || 0) + 1 : 1;
        const response = await notificationsApi.getAll({
          ...filters,
          page: currentPage,
        });

        if (response.status === 200 && response.data) {
          setNotifications((prev) =>
            loadMore ? [...prev, ...response.data.data] : response.data.data,
          );
          setMeta(response.data.meta);
          setUnreadCount(response.data.meta.unread_count);
        } else {
          throw new Error(response.message || "Failed to fetch notifications");
        }
      } catch (error: any) {
        // Graceful degradation - don't show errors for unsupported features
        console.log("Notifications not available:", error.message);
        setNotifications([]);
        setUnreadCount(0);
        setError(null); // Don't set error state
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, filters, meta],
  );

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await notificationsApi.getUnreadCount();
      if (response.status === 200 && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      // Silently fail - notifications not supported yet
      console.log("Unread count not available - feature not implemented yet");
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const response = await notificationsApi.markAsRead(id);

        if (response.status === 200) {
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.id === id
                ? { ...notification, is_read: true }
                : notification,
            ),
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
          return true;
        } else {
          throw new Error(response.message || "Failed to mark as read");
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to mark notification as read",
          variant: "destructive",
        });
        return false;
      }
    },
    [toast],
  );

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const response = await notificationsApi.markAllAsRead();

      if (response.status === 200) {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, is_read: true })),
        );
        setUnreadCount(0);
        toast({
          title: "Success",
          description: "All notifications marked as read",
        });
        return true;
      } else {
        throw new Error(response.message || "Failed to mark all as read");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to mark all notifications as read",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const deleteNotification = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const response = await notificationsApi.delete(id);

        if (response.status === 200) {
          const notification = notifications.find((n) => n.id === id);
          setNotifications((prev) => prev.filter((n) => n.id !== id));

          if (notification && !notification.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }

          toast({
            title: "Success",
            description: "Notification deleted",
          });
          return true;
        } else {
          throw new Error(response.message || "Failed to delete notification");
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete notification",
          variant: "destructive",
        });
        return false;
      }
    },
    [notifications, toast],
  );

  const clearAll = useCallback(async (): Promise<boolean> => {
    try {
      const response = await notificationsApi.deleteAll();

      if (response.status === 200) {
        setNotifications([]);
        setUnreadCount(0);
        toast({
          title: "Success",
          description: "All notifications cleared",
        });
        return true;
      } else {
        throw new Error(response.message || "Failed to clear notifications");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear notifications",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const refetch = useCallback(
    () => fetchNotifications(false),
    [fetchNotifications],
  );
  const loadMore = useCallback(
    () => fetchNotifications(true),
    [fetchNotifications],
  );

  const hasMore = meta ? meta.current_page < meta.last_page : false;

  useEffect(() => {
    fetchNotifications(false);
  }, [isAuthenticated, filters?.type, filters?.is_read]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      // Disable polling until backend supports notifications
      // const interval = setInterval(fetchUnreadCount, 30000);
      // return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchUnreadCount]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    meta,
    refetch,
    loadMore,
    hasMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}
