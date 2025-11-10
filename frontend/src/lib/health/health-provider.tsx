"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

import { ApiError, apiFetch } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/utils/error";

type HealthStatus = "idle" | "healthy" | "degraded" | "down";

interface HealthContextValue {
  status: HealthStatus;
  lastCheckedAt: Date | null;
  lastError: string | null;
}

const HealthContext = createContext<HealthContextValue | undefined>(undefined);

const POLL_INTERVAL_MS = 30_000;

async function fetchHealth(): Promise<HealthStatus> {
  try {
    const response = await apiFetch<
      {
        status: string;
        details?: Record<string, { status: string }>;
      },
      undefined
    >("/health", {
      method: "GET",
      cache: "no-store",
    });

    if (response.status === "ok") {
      const hasDegraded =
        response.details &&
        Object.values(response.details).some((detail) => detail.status !== "up");

      return hasDegraded ? "degraded" : "healthy";
    }

    return "down";
  } catch (error) {
    if (error instanceof ApiError) {
      return error.status >= 500 ? "down" : "degraded";
    }
    return "down";
  }
}

export function HealthPollerProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<HealthStatus>("idle");
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const runPoll = async () => {
      setLastCheckedAt(new Date());
      try {
        const nextStatus = await fetchHealth();
        setStatus(nextStatus);
        setLastError(null);
      } catch (error) {
        setStatus("down");
        setLastError(getErrorMessage(error, "Unable to reach backend health endpoint."));
      }
    };

    void runPoll();
    timerRef.current = setInterval(runPoll, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const value = useMemo<HealthContextValue>(
    () => ({
      status,
      lastCheckedAt,
      lastError,
    }),
    [lastCheckedAt, lastError, status],
  );

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error("useHealth must be used within a HealthPollerProvider");
  }
  return context;
}


