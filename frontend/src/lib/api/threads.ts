import { apiFetch } from '@/lib/api/client';

export interface ThreadPreviewPost {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadAuthor {
  id: string;
  handle?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface Thread {
  id: string;
  title: string;
  slug: string;
  authorId: string;
  author?: ThreadAuthor | null;
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
  firstPostPreview?: ThreadPreviewPost | null;
}

export interface PostAuthor {
  id: string;
  handle?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface Post {
  id: string;
  threadId: string;
  authorId: string;
  author?: PostAuthor | null;
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

export interface UpdatePostPayload {
  body: string;
}

export interface ListThreadsQuery {
  page?: number;
  limit?: number;
  status?: 'open' | 'locked' | 'archived';
  search?: string;
  tag?: string;
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
  if (query.tag) params.set('tag', query.tag);

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

export async function updatePost(
  threadId: string,
  postId: string,
  payload: UpdatePostPayload,
  accessToken: string,
): Promise<{ post: Post }> {
  return apiFetch<{ post: Post }, UpdatePostPayload>(`/threads/${threadId}/posts/${postId}`, {
    method: 'PATCH',
    body: payload,
    accessToken,
  });
}

export async function deletePost(
  threadId: string,
  postId: string,
  accessToken: string,
): Promise<void> {
  await apiFetch<void>(`/threads/${threadId}/posts/${postId}`, {
    method: 'DELETE',
    accessToken,
  });
}

export async function deleteThread(threadId: string, accessToken: string): Promise<void> {
  await apiFetch<void>(`/threads/${threadId}`, {
    method: 'DELETE',
    accessToken,
  });
}

export async function archiveThread(threadId: string, accessToken: string): Promise<void> {
  await apiFetch<void>(`/threads/${threadId}/archive`, {
    method: 'PATCH',
    accessToken,
  });
}

export async function unarchiveThread(threadId: string, accessToken: string): Promise<void> {
  await apiFetch<void>(`/threads/${threadId}/unarchive`, {
    method: 'PATCH',
    accessToken,
  });
}

export async function listThreadsByAuthor(
  userId: string,
  query: ListThreadsQuery = {},
  accessToken: string | null,
): Promise<PaginatedThreads> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.status) params.set('status', query.status);

  const queryString = params.toString();
  const path = `/users/${userId}/threads${queryString ? `?${queryString}` : ''}`;

  return apiFetch<PaginatedThreads>(path, {
    method: 'GET',
    accessToken,
  });
}

export async function listMyThreads(
  query: ListThreadsQuery = {},
  accessToken: string,
): Promise<PaginatedThreads> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.status) params.set('status', query.status);

  const queryString = params.toString();

  return apiFetch<PaginatedThreads>(`/users/me/threads${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
    accessToken,
  });
}

