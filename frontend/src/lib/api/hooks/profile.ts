"use client";

import { useCallback } from "react";
import useSWR, { SWRConfiguration } from "swr";

import { getProfile } from "@/lib/api/auth";
import { useAuthorizedMutation } from "@/lib/api/swr";
import { updateProfile, UpdateProfilePayload } from "@/lib/api/users";
import { useAuth } from "@/lib/auth/hooks";

const PROFILE_KEY = "profile";

export function useProfile(config?: SWRConfiguration) {
  const { accessToken, refreshProfile } = useAuth();

  const swr = useSWR(
    accessToken ? PROFILE_KEY : null,
    () => getProfile(accessToken!),
    {
      ...config,
      revalidateOnFocus: false,
    },
  );

  const mutateRemote = useCallback(
    async () => {
      if (!accessToken) return;
      await swr.mutate();
      await refreshProfile();
    },
    [accessToken, refreshProfile, swr],
  );

  return { ...swr, mutateRemote };
}

export function useUpdateProfile() {
  const mutation = useAuthorizedMutation<[UpdateProfilePayload], Awaited<ReturnType<typeof updateProfile>>>(
    (accessToken, payload) => updateProfile(payload, accessToken),
  );

  return mutation;
}


