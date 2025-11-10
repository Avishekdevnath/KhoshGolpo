"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  AuthResponse,
  LoginPayload,
  Profile,
  RegisterPayload,
} from '@/lib/api/auth';
import {
  getProfile,
  login as loginRequest,
  logout as logoutRequest,
  refresh as refreshRequest,
  register as registerRequest,
} from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/utils/error';
import { toast } from 'sonner';
import { appConfig } from '@/lib/config/env';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: Profile | null;
  accessToken: string | null;
  isActionPending: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const REFRESH_FALLBACK_MS = 14 * 60 * 1000;
const REFRESH_SKEW_MS = 30 * 1000;

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const base64 = parts[1]!.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    if (typeof globalThis.atob !== 'function') {
      return null;
    }
    const decoded = globalThis.atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const getTokenExpiry = (token: string): number | null => {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }
  const exp = payload.exp;
  return typeof exp === 'number' ? exp * 1000 : null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<Profile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const setSessionState = useCallback((session: AuthResponse | null) => {
    if (!session) {
      setAccessToken(null);
      setUser(null);
      setStatus('unauthenticated');
      return;
    }

    setAccessToken(session.accessToken);
    setUser(session.user);
    setStatus('authenticated');
  }, []);

  const scheduleRefresh = useCallback(
    (token: string) => {
      clearRefreshTimer();
      const expiresAt = getTokenExpiry(token);
      const now = Date.now();
      const delay = expiresAt ? Math.max(expiresAt - now - REFRESH_SKEW_MS, 60_000) : REFRESH_FALLBACK_MS;

      refreshTimerRef.current = setTimeout(async () => {
        try {
          const refreshed = await refreshRequest();
          setSessionState(refreshed);
          scheduleRefresh(refreshed.accessToken);
        } catch (error) {
          clearRefreshTimer();
          setSessionState(null);
          const message = getErrorMessage(error, 'Session expired. Please sign in again.');
          toast.error(message);
        }
      }, delay);
    },
    [clearRefreshTimer, setSessionState],
  );

  const applySession = useCallback((result: AuthResponse | null) => {
    if (!result) {
      clearRefreshTimer();
      setSessionState(null);
      return;
    }

    setSessionState(result);
    scheduleRefresh(result.accessToken);
  }, [clearRefreshTimer, scheduleRefresh, setSessionState]);

  const bootstrap = useCallback(async () => {
    try {
      const session = await refreshRequest();
      applySession(session);
    } catch {
      applySession(null);
    }
  }, [applySession]);

  useEffect(() => {
    void bootstrap();
    return () => {
      clearRefreshTimer();
    };
  }, [bootstrap, clearRefreshTimer]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsActionPending(true);
      try {
        const result = await loginRequest(payload);
        applySession(result);
        toast.success('Welcome back!');
      } catch (error) {
        applySession(null);
        const message = getErrorMessage(error, 'Unable to sign in.');
        toast.error(message);
        throw error;
      } finally {
        setIsActionPending(false);
      }
    },
    [applySession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setIsActionPending(true);
      try {
        const result = await registerRequest(payload);
        applySession(result);
        toast.success('Account created. Welcome aboard!');
      } catch (error) {
        applySession(null);
        const message = getErrorMessage(error, 'Unable to create account.');
        toast.error(message);
        throw error;
      } finally {
        setIsActionPending(false);
      }
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    setIsActionPending(true);
    try {
      await logoutRequest();
    } catch (error) {
      const message = getErrorMessage(error, 'Logout failed.');
      toast.error(message);
    } finally {
      applySession(null);
      setIsActionPending(false);
    }
  }, [applySession]);

  const refreshProfile = useCallback(async () => {
    if (!accessToken) {
      await bootstrap();
      return;
    }

    try {
      const profile = await getProfile(accessToken);
      setUser(profile);
      setStatus('authenticated');
    } catch (error) {
      const message = getErrorMessage(error, 'Session expired. Please sign in again.');
      toast.error(message);
      applySession(null);
    }
  }, [accessToken, applySession, bootstrap]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      accessToken,
      isActionPending,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [status, user, accessToken, isActionPending, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

