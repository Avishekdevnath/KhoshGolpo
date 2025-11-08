import type { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-900 dark:text-zinc-50">
        {children}
      </div>
    </ProtectedRoute>
  );
}

