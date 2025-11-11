'use client';

import { useCallback } from 'react';
import { SWRConfiguration, useSWRConfig } from 'swr';

import {
  CreatePostPayload,
  CreateThreadPayload,
  ListThreadsQuery,
  PaginatedThreads,
  ThreadWithPosts,
  UpdatePostPayload,
  archiveThread,
  createPost,
  createThread,
  deletePost,
  deleteThread,
  getThread,
  listMyThreads,
  listThreads,
  listThreadsByAuthor,
  unarchiveThread,
  updatePost,
} from '@/lib/api/threads';
import { useAuthorizedMutation, useAuthorizedSWR } from '@/lib/api/swr';

const THREADS_KEY = 'threads';
const THREADS_USER_KEY = 'threads:user';
const THREADS_ME_KEY = 'threads:me';

export const threadsKeys = {
  list: (query: ListThreadsQuery = {}) => [THREADS_KEY, query] as const,
  user: (userId: string, query: ListThreadsQuery = {}) =>
    [THREADS_USER_KEY, userId, query] as const,
  me: (query: ListThreadsQuery = {}) => [THREADS_ME_KEY, query] as const,
  detail: (threadId: string, page: number, limit: number) =>
    [THREADS_KEY, threadId, { page, limit }] as const,
};

export function useThreads(
  query: ListThreadsQuery = {},
  config?: SWRConfiguration<PaginatedThreads>,
) {
  return useAuthorizedSWR<PaginatedThreads>(
    threadsKeys.list(query),
    (accessToken) => listThreads(query, accessToken),
    config,
  );
}

export function useThread(
  threadId: string | null,
  {
    page = 1,
    limit = 20,
    config,
  }: {
    page?: number;
    limit?: number;
    config?: SWRConfiguration<ThreadWithPosts>;
  } = {},
) {
  const key = threadId ? threadsKeys.detail(threadId, page, limit) : null;
  return useAuthorizedSWR<ThreadWithPosts>(
    key,
    (accessToken) => {
      if (!threadId) {
        throw new Error('Thread id is required');
      }
      return getThread(threadId, page, limit, accessToken);
    },
    config,
  );
}

export function useCreateThread() {
  const mutate = useAuthorizedMutation<[CreateThreadPayload], Awaited<ReturnType<typeof createThread>>>(
    (accessToken, payload) => createThread(payload, accessToken),
  );
  const { mutate: mutateCache } = useSWRConfig();
  const invalidateLists = useCallback(
    async () =>
      mutateCache(
        (key) =>
          Array.isArray(key) &&
          (key[0] === THREADS_KEY || key[0] === THREADS_USER_KEY || key[0] === THREADS_ME_KEY),
      ),
    [mutateCache],
  );

  return useCallback(
    async (payload: CreateThreadPayload) => {
      const result = await mutate(payload);
      await invalidateLists();
      return result;
    },
    [mutate, invalidateLists],
  );
}

export function useCreatePost(threadId: string | null) {
  const mutate = useAuthorizedMutation<[string, CreatePostPayload], Awaited<ReturnType<typeof createPost>>>(
    (accessToken, id, payload) => createPost(id, payload, accessToken),
  );
  const { mutate: mutateCache } = useSWRConfig();
  const invalidateLists = useCallback(
    async () =>
      mutateCache(
        (key) =>
          Array.isArray(key) &&
          (key[0] === THREADS_KEY || key[0] === THREADS_USER_KEY || key[0] === THREADS_ME_KEY),
      ),
    [mutateCache],
  );

  return useCallback(
    async (payload: CreatePostPayload) => {
      if (!threadId) {
        throw new Error('Thread id is required');
      }
      const result = await mutate(threadId, payload);
      await invalidateLists();
      return result;
    },
    [mutate, invalidateLists, threadId],
  );
}

export function useDeletePost(threadId: string | null) {
  const mutate = useAuthorizedMutation<[string, string], Awaited<ReturnType<typeof deletePost>>>(
    (accessToken, thread, post) => deletePost(thread, post, accessToken),
  );
  const { mutate: mutateCache } = useSWRConfig();
  const invalidateLists = useCallback(
    async () =>
      mutateCache(
        (key) =>
          Array.isArray(key) &&
          (key[0] === THREADS_KEY || key[0] === THREADS_USER_KEY || key[0] === THREADS_ME_KEY),
      ),
    [mutateCache],
  );

  return useCallback(
    async (postId: string) => {
      if (!threadId) {
        throw new Error('Thread id is required');
      }
      await mutate(threadId, postId);
      await invalidateLists();
    },
    [mutate, invalidateLists, threadId],
  );
}

export function useDeleteThread() {
  const mutate = useAuthorizedMutation<[string], Awaited<ReturnType<typeof deleteThread>>>(
    (accessToken, threadId) => deleteThread(threadId, accessToken),
  );
  const { mutate: mutateCache } = useSWRConfig();
  const invalidateLists = useCallback(
    async () =>
      mutateCache(
        (key) =>
          Array.isArray(key) &&
          (key[0] === THREADS_KEY || key[0] === THREADS_USER_KEY || key[0] === THREADS_ME_KEY),
      ),
    [mutateCache],
  );

  return useCallback(
    async (threadId: string) => {
      await mutate(threadId);
      await invalidateLists();
    },
    [mutate, invalidateLists],
  );
}

export function useUpdatePost(threadId: string | null) {
  const mutate = useAuthorizedMutation<
    [string, string, UpdatePostPayload],
    Awaited<ReturnType<typeof updatePost>>
  >((accessToken, thread, postId, payload) => updatePost(thread, postId, payload, accessToken));
  const { mutate: mutateCache } = useSWRConfig();
  const invalidateLists = useCallback(
    async () =>
      mutateCache(
        (key) =>
          Array.isArray(key) &&
          (key[0] === THREADS_KEY || key[0] === THREADS_USER_KEY || key[0] === THREADS_ME_KEY),
      ),
    [mutateCache],
  );

  return useCallback(
    async (postId: string, payload: UpdatePostPayload) => {
      if (!threadId) {
        throw new Error('Thread id is required');
      }
      await mutate(threadId, postId, payload);
      await invalidateLists();
    },
    [mutate, invalidateLists, threadId],
  );
}

export function useMyThreads(
  query: ListThreadsQuery = {},
  config?: SWRConfiguration<PaginatedThreads>,
) {
  return useAuthorizedSWR<PaginatedThreads>(
    threadsKeys.me(query),
    (accessToken) => listMyThreads(query, accessToken),
    config,
  );
}

export function useUserThreads(
  userId: string | null,
  query: ListThreadsQuery = {},
  config?: SWRConfiguration<PaginatedThreads>,
) {
  const key = userId ? threadsKeys.user(userId, query) : null;
  return useAuthorizedSWR<PaginatedThreads>(
    key,
    (accessToken) => {
      if (!userId) {
        throw new Error('User id is required');
      }
      return listThreadsByAuthor(userId, query, accessToken);
    },
    config,
  );
}

export function useArchiveThread() {
  const mutate = useAuthorizedMutation<[string], void>((accessToken, threadId) =>
    archiveThread(threadId, accessToken),
  );
  const { mutate: mutateCache } = useSWRConfig();
  return useCallback(
    async (threadId: string) => {
      await mutate(threadId);
      await mutateCache((key) =>
        Array.isArray(key) &&
        (key[0] === THREADS_KEY || key[0] === THREADS_USER_KEY || key[0] === THREADS_ME_KEY),
      );
    },
    [mutate, mutateCache],
  );
}

export function useUnarchiveThread() {
  const mutate = useAuthorizedMutation<[string], void>((accessToken, threadId) =>
    unarchiveThread(threadId, accessToken),
  );
  const { mutate: mutateCache } = useSWRConfig();
  return useCallback(
    async (threadId: string) => {
      await mutate(threadId);
      await mutateCache((key) =>
        Array.isArray(key) &&
        (key[0] === THREADS_KEY || key[0] === THREADS_USER_KEY || key[0] === THREADS_ME_KEY),
      );
    },
    [mutate, mutateCache],
  );
}

