import { apiFetch } from "@/lib/api/client";
import type { Profile } from "@/lib/api/auth";

export interface AuditEntry {
  id: string;
  actorId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AdminUser extends Profile {
  status: "active" | "suspended" | "banned";
  threadsCount: number;
  postsCount: number;
  lastActiveAt?: string;
  auditLogs?: AuditEntry[];
}

export interface AdminUsersResponse {
  data: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  query?: string;
  roles?: string;
  status?: "active" | "suspended" | "banned";
  sortBy?: string;
}

export interface UpdateUserRolesPayload {
  roles: string[];
}

export interface UpdateUserStatusPayload {
  status: "active" | "suspended" | "banned";
  reason?: string;
}

export async function listAdminUsers(query: AdminUsersQuery = {}, accessToken: string | null): Promise<AdminUsersResponse> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.query) params.set("q", query.query);
  if (query.roles) params.set("roles", query.roles);
  if (query.status) params.set("status", query.status);
  if (query.sortBy) params.set("sortBy", query.sortBy);

  const queryString = params.toString();

  return apiFetch<AdminUsersResponse>(`/admin/users${queryString ? `?${queryString}` : ""}`, {
    method: "GET",
    accessToken,
  });
}

export async function updateUserRoles(
  userId: string,
  payload: UpdateUserRolesPayload,
  accessToken: string,
): Promise<AdminUser> {
  return apiFetch<AdminUser, UpdateUserRolesPayload>(`/admin/users/${userId}/roles`, {
    method: "PATCH",
    body: payload,
    accessToken,
  });
}

export async function updateUserStatus(
  userId: string,
  payload: UpdateUserStatusPayload,
  accessToken: string,
): Promise<AdminUser> {
  return apiFetch<AdminUser, UpdateUserStatusPayload>(`/admin/users/${userId}/status`, {
    method: "PATCH",
    body: payload,
    accessToken,
  });
}

export async function forceLogoutUser(userId: string, accessToken: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/admin/users/${userId}/logout`, {
    method: "POST",
    accessToken,
  });
}


