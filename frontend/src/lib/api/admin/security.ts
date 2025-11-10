import { apiFetch } from "@/lib/api/client";

export interface SecurityEvent {
  id: string;
  type: string;
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  endpoint?: string | null;
  details?: Record<string, unknown> | null;
  severity: "info" | "warning" | "critical";
  status: "open" | "escalated" | "resolved";
  createdAt: string;
}

export interface RateLimitSummary {
  key: string;
  count: number;
  lastOccurrence: string;
  sampleEndpoint?: string;
  sampleIp?: string;
  sampleUserId?: string;
}

export interface SecurityEventsResponse {
  data: SecurityEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface RateLimitResponse {
  data: RateLimitSummary[];
  windowMinutes: number;
  groupBy: string;
  totalActors: number;
}

export interface SecurityEventsQuery {
  page?: number;
  limit?: number;
  type?: string;
  severity?: "info" | "warning" | "critical";
  status?: "open" | "escalated" | "resolved";
  userId?: string;
  ip?: string;
  endpoint?: string;
  start?: string;
  end?: string;
}

export interface RateLimitQuery {
  windowMinutes?: number;
  groupBy?: "endpoint" | "ip" | "user";
  filter?: string;
}

export async function listSecurityEvents(
  query: SecurityEventsQuery = {},
  accessToken: string | null,
): Promise<SecurityEventsResponse> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.type) params.set("type", query.type);
  if (query.severity) params.set("severity", query.severity);
  if (query.status) params.set("status", query.status);
  if (query.userId) params.set("userId", query.userId);
  if (query.ip) params.set("ip", query.ip);
  if (query.endpoint) params.set("endpoint", query.endpoint);
  if (query.start) params.set("start", query.start);
  if (query.end) params.set("end", query.end);

  const queryString = params.toString();

  return apiFetch<SecurityEventsResponse>(`/admin/security/events${queryString ? `?${queryString}` : ""}`, {
    method: "GET",
    accessToken,
  });
}

export async function getRateLimitSummary(
  query: RateLimitQuery = {},
  accessToken: string | null,
): Promise<RateLimitResponse> {
  const params = new URLSearchParams();
  if (query.windowMinutes) params.set("windowMinutes", String(query.windowMinutes));
  if (query.groupBy) params.set("groupBy", query.groupBy);
  if (query.filter) params.set("filter", query.filter);

  const queryString = params.toString();

  return apiFetch<RateLimitResponse>(`/admin/security/rate-limit${queryString ? `?${queryString}` : ""}`, {
    method: "GET",
    accessToken,
  });
}


