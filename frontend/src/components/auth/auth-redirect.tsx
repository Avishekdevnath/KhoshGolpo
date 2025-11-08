"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { appConfig } from '@/lib/config/env';

export function AuthRedirect() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(appConfig.defaultRedirect);
    }
  }, [status, router]);

  return null;
}

