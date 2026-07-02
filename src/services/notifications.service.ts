import { apiClient } from "@/api/client";

export interface AppNotification {
  id: string;
  type:
    | "ORDER_PAID"
    | "ORDER_CANCELED"
    | "REFUND_COMPLETED"
    | "REFUND_FAILED"
    | "TICKET_TRANSFERRED_IN"
    | "TICKET_TRANSFERRED_OUT"
    | "EVENT_UPDATE";
  title: string;
  body: string;
  read: boolean;
  readAt: string | null;
  metadata: Record<string, string>;
  createdAt: string;
}

export interface NotificationsPage {
  notifications: AppNotification[];
  total: number;
  skip: number;
  take: number;
  unreadCount: number;
}

export const notificationsService = {
  getNotifications: async (skip = 0, take = 50, unreadOnly = false): Promise<NotificationsPage> => {
    const { data } = await apiClient.get("/public/customer/notifications", {
      params: { skip, take, unreadOnly },
    });
    return data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get("/public/customer/notifications/unread-count");
    return data.data.unreadCount as number;
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/public/customer/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<{ updated: number }> => {
    const { data } = await apiClient.post("/public/customer/notifications/read-all");
    return data.data;
  },
};
