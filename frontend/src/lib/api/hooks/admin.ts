"use client";

import { useMemo } from "react";
import { SWRConfiguration, useSWRConfig } from "swr";

import {
  listModerationPosts,
  listModerationThreads,
  updatePostModeration,
  updateThreadStatus,
  type ModerationPostQuery,
  type ModerationThreadQuery,
  type UpdatePostModerationPayload,
  type UpdateThreadStatusPayload,
} from "@/lib/api/admin/moderation";
import {
  listAdminUsers,
  updateUserRoles,
  updateUserStatus,
  forceLogoutUser,
  type AdminUsersQuery,
  type UpdateUserRolesPayload,
  type UpdateUserStatusPayload,
} from "@/lib/api/admin/users";
import {
  listSecurityEvents,
  getRateLimitSummary,
  type SecurityEventsQuery,
  type RateLimitQuery,
} from "@/lib/api/admin/security";
import { useAuthorizedMutation, useAuthorizedSWR } from "@/lib/api/swr";

const ADMIN_MODERATION_POSTS_KEY = "admin-moderation-posts";
const ADMIN_MODERATION_THREADS_KEY = "admin-moderation-threads";
const ADMIN_USERS_KEY = "admin-users";
const ADMIN_SECURITY_EVENTS_KEY = "admin-security-events";
const ADMIN_SECURITY_RATE_LIMIT_KEY = "admin-security-rate-limit";

export function useModerationPosts(query: ModerationPostQuery, config?: SWRConfiguration) {
  const serializedQuery = useMemo(
    () => ({
      page: query.page,
      limit: query.limit,
      state: query.state,
    }),
    [query.limit, query.page, query.state],
  );

  return useAuthorizedSWR(
    [ADMIN_MODERATION_POSTS_KEY, serializedQuery],
    (accessToken) => listModerationPosts(serializedQuery, accessToken),
    config,
  );
}

export function useModerationThreads(query: ModerationThreadQuery, config?: SWRConfiguration) {
  const serializedQuery = useMemo(
    () => ({
      page: query.page,
      limit: query.limit,
      status: query.status,
      search: query.search,
    }),
    [query.limit, query.page, query.search, query.status],
  );

  return useAuthorizedSWR(
    [ADMIN_MODERATION_THREADS_KEY, serializedQuery],
    (accessToken) => listModerationThreads(serializedQuery, accessToken),
    config,
  );
}

export function useModerationMutations() {
  const postMutation = useAuthorizedMutation<
    [string, UpdatePostModerationPayload],
    Awaited<ReturnType<typeof updatePostModeration>>
  >((accessToken, postId, payload) => updatePostModeration(postId, payload, accessToken));

  const threadMutation = useAuthorizedMutation<
    [string, UpdateThreadStatusPayload],
    Awaited<ReturnType<typeof updateThreadStatus>>
  >((accessToken, threadId, payload) => updateThreadStatus(threadId, payload, accessToken));

  const { mutate } = useSWRConfig();

  const invalidate = async () => {
    await mutate((key) => Array.isArray(key) && typeof key[0] === "string" && key[0].startsWith("admin-moderation"));
  };

  return {
    updatePost: async (postId: string, payload: UpdatePostModerationPayload) => {
      const result = await postMutation(postId, payload);
      await invalidate();
      return result;
    },
    updateThread: async (threadId: string, payload: UpdateThreadStatusPayload) => {
      const result = await threadMutation(threadId, payload);
      await invalidate();
      return result;
    },
  };
}

export function useAdminUsers(query: AdminUsersQuery, config?: SWRConfiguration) {
  const serializedQuery = useMemo(
    () => ({
      page: query.page,
      limit: query.limit,
      query: query.query,
      roles: query.roles,
      status: query.status,
      sortBy: query.sortBy,
    }),
    [query.limit, query.page, query.query, query.roles, query.sortBy, query.status],
  );

  return useAuthorizedSWR(
    [ADMIN_USERS_KEY, serializedQuery],
    (accessToken) => listAdminUsers(serializedQuery, accessToken),
    config,
  );
}

export function useAdminUserMutations() {
  const updateRolesMutation = useAuthorizedMutation<
    [string, UpdateUserRolesPayload],
    Awaited<ReturnType<typeof updateUserRoles>>
  >((accessToken, userId, payload) => updateUserRoles(userId, payload, accessToken));

  const updateStatusMutation = useAuthorizedMutation<
    [string, UpdateUserStatusPayload],
    Awaited<ReturnType<typeof updateUserStatus>>
  >((accessToken, userId, payload) => updateUserStatus(userId, payload, accessToken));

  const logoutMutation = useAuthorizedMutation<[string], Awaited<ReturnType<typeof forceLogoutUser>>>(
    (accessToken, userId) => forceLogoutUser(userId, accessToken),
  );

  const { mutate } = useSWRConfig();

  const invalidate = async () => {
    await mutate((key) => Array.isArray(key) && key[0] === ADMIN_USERS_KEY);
  };

  return {
    updateRoles: async (userId: string, payload: UpdateUserRolesPayload) => {
      const result = await updateRolesMutation(userId, payload);
      await invalidate();
      return result;
    },
    updateStatus: async (userId: string, payload: UpdateUserStatusPayload) => {
      const result = await updateStatusMutation(userId, payload);
      await invalidate();
      return result;
    },
    forceLogout: async (userId: string) => {
      const result = await logoutMutation(userId);
      await invalidate();
      return result;
    },
  };
}

export function useSecurityEvents(query: SecurityEventsQuery, config?: SWRConfiguration) {
  const serializedQuery = useMemo(
    () => ({
      page: query.page,
      limit: query.limit,
      type: query.type,
      severity: query.severity,
      status: query.status,
      userId: query.userId,
      ip: query.ip,
      endpoint: query.endpoint,
      start: query.start,
      end: query.end,
    }),
    [
      query.endpoint,
      query.end,
      query.ip,
      query.limit,
      query.page,
      query.severity,
      query.start,
      query.status,
      query.type,
      query.userId,
    ],
  );

  return useAuthorizedSWR(
    [ADMIN_SECURITY_EVENTS_KEY, serializedQuery],
    (accessToken) => listSecurityEvents(serializedQuery, accessToken),
    config,
  );
}

export function useRateLimitSummary(query: RateLimitQuery, config?: SWRConfiguration) {
  const serializedQuery = useMemo(
    () => ({
      windowMinutes: query.windowMinutes,
      groupBy: query.groupBy,
      filter: query.filter,
    }),
    [query.filter, query.groupBy, query.windowMinutes],
  );

  return useAuthorizedSWR(
    [ADMIN_SECURITY_RATE_LIMIT_KEY, serializedQuery],
    (accessToken) => getRateLimitSummary(serializedQuery, accessToken),
    config,
  );
}


