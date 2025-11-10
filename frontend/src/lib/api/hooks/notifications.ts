"use client";

import { SWRConfiguration, useSWRConfig } from "swr";
import { useMemo } from "react";

import {
  ListNotificationsQuery,
  PaginatedNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
import { useAuthorizedMutation, useAuthorizedSWR } from "@/lib/api/swr";

const NOTIFICATIONS_KEY = "notifications";

const notificationsKey = (query: ListNotificationsQuery) => [NOTIFICATIONS_KEY, query] as const;

export function useNotifications(query: ListNotificationsQuery, config?: SWRConfiguration<PaginatedNotifications>) {
  const serializedQuery = useMemo(
    () => ({
      page: query.page,
      limit: query.limit,
      unreadOnly: query.unreadOnly,
    }),
    [query.limit, query.page, query.unreadOnly],
  );
  return useAuthorizedSWR<PaginatedNotifications>(
    notificationsKey(serializedQuery),
    (accessToken) => listNotifications(serializedQuery, accessToken),
    config,
  );
}

export function useMarkNotificationRead() {
  const mutate = useAuthorizedMutation<[string], Awaited<ReturnType<typeof markNotificationRead>>>(
    (accessToken, notificationId) => markNotificationRead(notificationId, accessToken),
  );
  const { mutate: mutateCache } = useSWRConfig();

  return async (notificationId: string) => {
    const result = await mutate(notificationId);
    await mutateCache((key) => Array.isArray(key) && key[0] === NOTIFICATIONS_KEY);
    return result;
  };
}

export function useMarkAllNotificationsRead() {
  const mutate = useAuthorizedMutation<[], Awaited<ReturnType<typeof markAllNotificationsRead>>>((accessToken) =>
    markAllNotificationsRead(accessToken),
  );
  const { mutate: mutateCache } = useSWRConfig();

  return async () => {
    const result = await mutate();
    await mutateCache((key) => Array.isArray(key) && key[0] === NOTIFICATIONS_KEY);
    return result;
  };
}


