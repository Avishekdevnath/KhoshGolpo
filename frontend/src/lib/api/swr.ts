'use client';

import { useCallback } from 'react';
import useSWR, { Key, SWRConfiguration } from 'swr';

import { ApiError } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/hooks';

export function useAuthorizedSWR<Data>(
  key: Key | null,
  fetcher: (accessToken: string) => Promise<Data>,
  config?: SWRConfiguration<Data>,
) {
  const { status, accessToken, refreshProfile } = useAuth();

  const shouldFetch = status === 'authenticated' && accessToken ? key : null;

  return useSWR<Data>(
    shouldFetch,
    async () => {
      if (!accessToken) {
        throw new Error('Missing session');
      }

      try {
        return await fetcher(accessToken);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await refreshProfile();
        }
        throw error;
      }
    },
    config,
  );
}

export function useAuthorizedMutation<Args extends unknown[], Result>(
  mutation: (accessToken: string, ...args: Args) => Promise<Result>,
) {
  const { status, accessToken, refreshProfile } = useAuth();

  return useCallback(
    async (...args: Args) => {
      if (status !== 'authenticated' || !accessToken) {
        throw new Error('Not authenticated');
      }

      try {
        return await mutation(accessToken, ...args);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await refreshProfile();
        }
        throw error;
      }
    },
    [accessToken, mutation, refreshProfile, status],
  );
}


