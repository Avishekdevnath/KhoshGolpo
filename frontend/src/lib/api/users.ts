import { apiFetch } from "@/lib/api/client";
import type { Profile } from "@/lib/api/auth";

export interface UpdateProfilePayload {
  displayName?: string;
  handle?: string;
}

export async function updateProfile(payload: UpdateProfilePayload, accessToken: string): Promise<Profile> {
  return apiFetch<Profile, UpdateProfilePayload>("/users/me", {
    method: "PATCH",
    body: payload,
    accessToken,
  });
}


