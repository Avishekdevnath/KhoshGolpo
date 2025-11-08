import { apiFetch } from '@/lib/api/client';

export interface Profile {
  id: string;
  email: string;
  handle: string;
  displayName: string;
  roles: string[];
  lastActiveAt?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: Profile;
}

export interface RegisterPayload {
  email: string;
  password: string;
  handle: string;
  displayName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse, RegisterPayload>('/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse, LoginPayload>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export async function refresh(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/refresh', {
    method: 'POST',
  });
}

export async function logout(): Promise<void> {
  await apiFetch('/auth/logout', {
    method: 'POST',
  });
}

export async function getProfile(accessToken: string): Promise<Profile> {
  return apiFetch<Profile>('/auth/me', {
    method: 'GET',
    accessToken,
  });
}

