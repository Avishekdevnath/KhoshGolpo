import { apiFetch } from "@/lib/api/client";

export type NotificationEvent = string;

export interface Notification {
  id: string;
  event: NotificationEvent;
  payload: Record<string, unknown>;
  read: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedNotifications {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ListNotificationsQuery {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export async function listNotifications(
  query: ListNotificationsQuery = {},
  accessToken: string | null,
): Promise<PaginatedNotifications> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.unreadOnly) params.set("unreadOnly", "true");

  const path = `/notifications${params.toString() ? `?${params.toString()}` : ""}`;

  return apiFetch<PaginatedNotifications>(path, {
    method: "GET",
    accessToken,
  });
}

export async function markNotificationRead(notificationId: string, accessToken: string): Promise<Notification> {
  return apiFetch<Notification>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
    accessToken,
  });
}

export async function markAllNotificationsRead(accessToken: string): Promise<{ updatedCount: number }> {
  return apiFetch<{ updatedCount: number }>(`/notifications/read-all`, {
    method: "PATCH",
    accessToken,
  });
}


