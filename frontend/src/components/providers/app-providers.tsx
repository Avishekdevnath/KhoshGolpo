"use client";

import { AuthProvider } from "@/lib/auth/auth-context";
import { Toaster } from "sonner";
import { HealthPollerProvider } from "@/lib/health/health-provider";
import { SocketProvider } from "@/lib/realtime/socket-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <HealthPollerProvider>
        <SocketProvider>
          {children}
          <Toaster richColors position="top-center" />
        </SocketProvider>
      </HealthPollerProvider>
    </AuthProvider>
  );
}

