"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Filter, Loader2, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/hooks";
import { useRateLimitSummary, useSecurityEvents } from "@/lib/api/hooks/admin";
import type { RateLimitSummary, SecurityEvent } from "@/lib/api/admin/security";
import { formatRelativeTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils";

const EVENTS_PER_PAGE = 15;

const severityStyles: Record<string, string> = {
  info: "border-sky-400/40 bg-sky-500/10 text-sky-200",
  warning: "border-amber-400/40 bg-amber-500/10 text-amber-200",
  critical: "border-rose-400/40 bg-rose-500/10 text-rose-200",
};

const statusStyles: Record<string, string> = {
  open: "border-amber-400/40 bg-amber-500/10 text-amber-200",
  escalated: "border-rose-400/40 bg-rose-500/10 text-rose-200",
  resolved: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
};

export default function SecurityPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  if (user && !user.roles?.includes("admin")) {
    return (
      <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 px-6 py-10 text-center text-sm text-amber-200">
        Admin access is required to view security telemetry.
      </div>
    );
  }

  const eventsQuery = useMemo(
    () => ({
      page,
      limit: EVENTS_PER_PAGE,
      endpoint: search ? search : undefined,
    }),
    [page, search],
  );

  const { data, isLoading, error } = useSecurityEvents(eventsQuery, { revalidateOnFocus: false });
  const { data: rateLimitData, isLoading: isLoadingRateLimit } = useRateLimitSummary(
    { groupBy: "endpoint", windowMinutes: 60 },
    { revalidateOnFocus: false },
  );

  const events = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2rem] text-slate-400">Safety command</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Keep conversations safe, quietly.</h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Monitor login events, API usage, and anomalies with lightweight signals.
          </p>
        </div>
        <Button
          variant="ghost"
          className="rounded-xl border border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700"
        >
          <Filter className="mr-2 size-4" />
          Filters
        </Button>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70">
        <div className="flex flex-col gap-3 border-b border-slate-800/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-slate-200 shadow-inner shadow-slate-900/80">
            <Input
              placeholder="Filter by endpoint or pattern…"
              className="border-none bg-transparent p-0 text-sm focus-visible:ring-0"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="text-xs text-slate-500">{pagination ? `${pagination.total} events` : null}</div>
        </div>

        {isLoading && (
          <div className="flex items-center gap-3 px-6 py-4 text-sm text-slate-300">
            <Loader2 className="size-4 animate-spin text-sky-300" />
            Loading security events…
          </div>
        )}

        {error && (
          <div className="px-6 py-4 text-sm text-rose-200">
            {error instanceof Error ? error.message : "Unable to load security feed."}
          </div>
        )}

        <div className="divide-y divide-slate-800/60">
          {events.map((event: SecurityEvent) => (
            <div key={event.id} className="flex flex-col gap-3 px-6 py-5 transition hover:bg-slate-900/60">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="text-sm font-semibold text-white">{event.type}</span>
                <span>•</span>
                <span>{formatRelativeTime(event.createdAt)}</span>
                <span className={cn("rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-widest", severityStyles[event.severity])}>
                  {event.severity}
                </span>
                <span className={cn("rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-widest", statusStyles[event.status])}>
                  {event.status}
                </span>
              </div>
              <pre className="whitespace-pre-wrap break-words rounded-2xl border border-slate-800/70 bg-slate-900/70 px-4 py-3 text-xs text-slate-300">
                {JSON.stringify(event.details ?? {}, null, 2)}
              </pre>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {event.endpoint && <span>Endpoint: {event.endpoint}</span>}
                {event.ip && <span>IP: {event.ip}</span>}
                {event.userId && <span>User: {event.userId}</span>}
              </div>
            </div>
          ))}
        </div>

        {!events.length && !isLoading && (
          <div className="px-6 py-10 text-center text-sm text-slate-400">No security events match these filters.</div>
        )}

        {pagination && events.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-800/70 px-6 py-4 text-xs text-slate-400">
            <span>
              Showing {(pagination.page - 1) * pagination.limit + 1}
              &ndash;
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-800/70 bg-slate-900/70 text-xs uppercase tracking-[0.2em] text-slate-300 hover:border-slate-700"
              >
                Previous
              </Button>
              <span className="uppercase tracking-[0.18em]">Page {page}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((current) => current + 1)}
                disabled={pagination.page * pagination.limit >= pagination.total}
                className="rounded-lg border border-slate-800/70 bg-slate-900/70 text-xs uppercase tracking-[0.2em] text-slate-300 hover:border-slate-700"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Rate-limit radar</p>
            <p className="text-xs text-slate-400">Which endpoints are closest to the guard rails.</p>
          </div>
          <Button variant="ghost" className="rounded-xl border border-slate-800/70 bg-slate-900/70 text-slate-300 hover:border-slate-700">
            Refresh
          </Button>
        </div>

        {isLoadingRateLimit && (
          <div className="flex items-center gap-3 py-4 text-sm text-slate-300">
            <Loader2 className="size-4 animate-spin text-sky-300" />
            Loading rate-limit telemetry…
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {rateLimitData?.data.map((item: RateLimitSummary) => (
            <div
              key={item.key}
              className="rounded-2xl border border-slate-800/70 bg-slate-900/70 px-4 py-5 shadow-inner shadow-slate-900/60"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{item.key}</span>
                <span>{formatRelativeTime(item.lastOccurrence)}</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">{item.count}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                {item.sampleEndpoint && <span className="rounded border border-slate-800/70 bg-slate-950/70 px-2 py-1">{item.sampleEndpoint}</span>}
                {item.sampleIp && <span className="rounded border border-slate-800/70 bg-slate-950/70 px-2 py-1">{item.sampleIp}</span>}
                {item.sampleUserId && (
                  <span className="rounded border border-slate-800/70 bg-slate-950/70 px-2 py-1">{item.sampleUserId}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {!rateLimitData?.data?.length && !isLoadingRateLimit && (
          <div className="py-8 text-center text-sm text-slate-400">Rate-limit behaviour looks calm.</div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70 px-6 py-6 text-sm text-slate-300">
        <div className="flex items-center gap-3 text-slate-400">
          <AlertCircle className="size-4" />
          Need to escalate something? Jump into the incident playbook and assign responders.
        </div>
      </div>
    </div>
  );
}
