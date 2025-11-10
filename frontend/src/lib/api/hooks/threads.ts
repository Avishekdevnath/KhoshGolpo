'use client';

import { useCallback } from 'react';
import { SWRConfiguration, useSWRConfig } from 'swr';

import {
  CreatePostPayload,
  CreateThreadPayload,
  ListThreadsQuery,
  PaginatedThreads,
  ThreadWithPosts,
  createPost,
  createThread,
  getThread,
  listThreads,
} from '@/lib/api/threads';
import { useAuthorizedMutation, useAuthorizedSWR } from '@/lib/api/swr';

const THREADS_KEY = 'threads';

export const threadsKeys = {
  list: (query: ListThreadsQuery = {}) => [THREADS_KEY, query] as const,
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

  return useCallback(
    async (payload: CreateThreadPayload) => {
      const result = await mutate(payload);
      await mutateCache((key) => Array.isArray(key) && key[0] === THREADS_KEY);
      return result;
    },
    [mutate, mutateCache],
  );
}

export function useCreatePost(threadId: string | null) {
  const mutate = useAuthorizedMutation<[string, CreatePostPayload], Awaited<ReturnType<typeof createPost>>>(
    (accessToken, id, payload) => createPost(id, payload, accessToken),
  );
  const { mutate: mutateCache } = useSWRConfig();

  return useCallback(
    async (payload: CreatePostPayload) => {
      if (!threadId) {
        throw new Error('Thread id is required');
      }
      const result = await mutate(threadId, payload);
      await mutateCache((key) => Array.isArray(key) && key[0] === THREADS_KEY);
      return result;
    },
    [mutate, mutateCache, threadId],
  );
}


