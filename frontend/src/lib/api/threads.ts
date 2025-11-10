import { apiFetch } from '@/lib/api/client';

export interface Thread {
  id: string;
  title: string;
  slug: string;
  authorId: string;
  tags: string[];
  status: 'open' | 'locked' | 'archived';
  summary?: string | null;
  summaryGeneratedAt?: string | null;
  lastActivityAt: string;
  postsCount: number;
  participantsCount: number;
  participantIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  threadId: string;
  authorId: string;
  body: string;
  mentions: string[];
  parentPostId?: string | null;
  moderationState: 'pending' | 'approved' | 'flagged' | 'rejected';
  moderationFeedback?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedThreads {
  data: Thread[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ThreadWithPosts {
  thread: Thread;
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CreateThreadPayload {
  title: string;
  body: string;
  tags?: string[];
}

export interface CreatePostPayload {
  body: string;
  parentPostId?: string;
}

export interface ListThreadsQuery {
  page?: number;
  limit?: number;
  status?: 'open' | 'locked' | 'archived';
  search?: string;
}

export async function listThreads(
  query: ListThreadsQuery = {},
  accessToken: string | null,
): Promise<PaginatedThreads> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.status) params.set('status', query.status);
  if (query.search) params.set('search', query.search);

  const queryString = params.toString();
  const path = `/threads${queryString ? `?${queryString}` : ''}`;

  return apiFetch<PaginatedThreads>(path, {
    method: 'GET',
    accessToken,
  });
}

export async function getThread(
  threadId: string,
  page = 1,
  limit = 20,
  accessToken: string | null,
): Promise<ThreadWithPosts> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));

  return apiFetch<ThreadWithPosts>(`/threads/${threadId}?${params.toString()}`, {
    method: 'GET',
    accessToken,
  });
}

export async function createThread(
  payload: CreateThreadPayload,
  accessToken: string,
): Promise<{ thread: Thread; firstPost: Post }> {
  return apiFetch<{ thread: Thread; firstPost: Post }, CreateThreadPayload>(
    '/threads',
    {
      method: 'POST',
      body: payload,
      accessToken,
    },
  );
}

export async function createPost(
  threadId: string,
  payload: CreatePostPayload,
  accessToken: string,
): Promise<{ post: Post }> {
  return apiFetch<{ post: Post }, CreatePostPayload>(`/threads/${threadId}/posts`, {
    method: 'POST',
    body: payload,
    accessToken,
  });
}

