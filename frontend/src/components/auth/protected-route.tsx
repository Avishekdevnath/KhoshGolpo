"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { appConfig } from '@/lib/config/env';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(appConfig.loginPath);
    }
  }, [status, router]);

  if (status === 'loading') {
    return <LoadingScreen message="Checking your session..." />;
  }

  if (status !== 'authenticated') {
    return null;
  }

  return <>{children}</>;
}

