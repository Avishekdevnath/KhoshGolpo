import type { ReactNode } from 'react';
import { AuthRedirect } from '@/components/auth/auth-redirect';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-16 dark:bg-zinc-950">
      <AuthRedirect />
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

