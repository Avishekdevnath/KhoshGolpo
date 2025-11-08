"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<Profile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);

  const applySession = useCallback((result: AuthResponse | null) => {
    if (!result) {
      setUser(null);
      setAccessToken(null);
      setStatus('unauthenticated');
      return;
    }

    setAccessToken(result.accessToken);
    setUser(result.user);
    setStatus('authenticated');
  }, []);

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
  }, [bootstrap]);

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

