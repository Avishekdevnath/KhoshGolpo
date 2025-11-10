import { apiFetch } from "@/lib/api/client";
import type { Thread, Post } from "@/lib/api/threads";

export interface ModerationAuthor {
  id: string;
  email: string;
  handle: string;
  displayName?: string;
  roles?: string[];
}

export interface ModerationPostItem {
  post: Post & {
    author?: ModerationAuthor;
  };
  thread: Thread;
  author: ModerationAuthor;
}

export interface ModerationThreadItem {
  thread: Thread;
  author: ModerationAuthor;
}

export interface ModerationPagination {
  page: number;
  limit: number;
  total: number;
}

export interface ModerationPostResponse {
  data: ModerationPostItem[];
  pagination: ModerationPagination;
}

export interface ModerationThreadResponse {
  data: ModerationThreadItem[];
  pagination: ModerationPagination;
}

export interface ModerationPostQuery {
  page?: number;
  limit?: number;
  state?: "pending" | "flagged" | "approved" | "rejected";
}

export interface ModerationThreadQuery {
  page?: number;
  limit?: number;
  status?: "open" | "locked" | "archived";
  search?: string;
}

export interface UpdatePostModerationPayload {
  moderationState: "pending" | "approved" | "flagged" | "rejected";
  moderationFeedback?: string;
  lockThread?: boolean;
}

export interface UpdateThreadStatusPayload {
  status: "open" | "locked" | "archived";
}

export async function listModerationPosts(
  query: ModerationPostQuery = {},
  accessToken: string | null,
): Promise<ModerationPostResponse> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.state) params.set("state", query.state);

  const queryString = params.toString();
  return apiFetch<ModerationPostResponse>(`/admin/moderation/posts${queryString ? `?${queryString}` : ""}`, {
    method: "GET",
    accessToken,
  });
}

export async function listModerationThreads(
  query: ModerationThreadQuery = {},
  accessToken: string | null,
): Promise<ModerationThreadResponse> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.status) params.set("status", query.status);
  if (query.search) params.set("search", query.search);

  const queryString = params.toString();
  return apiFetch<ModerationThreadResponse>(`/admin/moderation/threads${queryString ? `?${queryString}` : ""}`, {
    method: "GET",
    accessToken,
  });
}

export async function updatePostModeration(
  postId: string,
  payload: UpdatePostModerationPayload,
  accessToken: string,
): Promise<Post> {
  return apiFetch<Post, UpdatePostModerationPayload>(`/admin/posts/${postId}/moderation`, {
    method: "PATCH",
    body: payload,
    accessToken,
  });
}

export async function updateThreadStatus(
  threadId: string,
  payload: UpdateThreadStatusPayload,
  accessToken: string,
): Promise<Thread> {
  return apiFetch<Thread, UpdateThreadStatusPayload>(`/admin/threads/${threadId}/status`, {
    method: "PATCH",
    body: payload,
    accessToken,
  });
}


