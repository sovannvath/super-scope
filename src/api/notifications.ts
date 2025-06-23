import { apiClient, makeApiCall, ApiResponse } from "@/lib/api";

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "order"
    | "product"
    | "system";
  is_read: boolean;
  data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NotificationFilters {
  type?: string;
  is_read?: boolean;
  page?: number;
  per_page?: number;
}

export interface NotificationsResponse {
  data: Notification[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
    unread_count: number;
  };
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type: string;
  user_id?: number;
  data?: Record<string, any>;
}

export const notificationsApi = {
  getAll: async (
    filters?: NotificationFilters,
  ): Promise<ApiResponse<NotificationsResponse>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    const url = queryString
      ? `/notifications?${queryString}`
      : "/notifications";
    return makeApiCall(() => apiClient.get(url));
  },

  getUnread: async (): Promise<ApiResponse<Notification[]>> =>
    makeApiCall(() => apiClient.get("/notifications/unread")),

  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> =>
    makeApiCall(() => apiClient.get("/notifications/unread-count")),

  markAsRead: async (id: number): Promise<ApiResponse<Notification>> =>
    makeApiCall(() => apiClient.put(`/notifications/${id}/read`)),

  markAllAsRead: async (): Promise<ApiResponse<void>> =>
    makeApiCall(() => apiClient.put("/notifications/read-all")),

  delete: async (id: number): Promise<ApiResponse<void>> =>
    makeApiCall(() => apiClient.delete(`/notifications/${id}`)),

  deleteAll: async (): Promise<ApiResponse<void>> =>
    makeApiCall(() => apiClient.delete("/notifications/clear")),

  create: async (
    data: CreateNotificationData,
  ): Promise<ApiResponse<Notification>> =>
    makeApiCall(() => apiClient.post("/notifications", data)),

  getSettings: async (): Promise<
    ApiResponse<{
      email_notifications: boolean;
      push_notifications: boolean;
      order_updates: boolean;
      product_updates: boolean;
      marketing: boolean;
    }>
  > => makeApiCall(() => apiClient.get("/notifications/settings")),

  updateSettings: async (
    settings: Record<string, boolean>,
  ): Promise<ApiResponse<void>> =>
    makeApiCall(() => apiClient.put("/notifications/settings", settings)),
};
