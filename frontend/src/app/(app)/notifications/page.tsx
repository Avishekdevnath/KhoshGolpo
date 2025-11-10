"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Bell, CheckCheck, Filter, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/lib/api/hooks/notifications";
import { formatRelativeTime } from "@/lib/utils/date";
import { ApiError } from "@/lib/api/client";

const NOTIFICATIONS_PER_PAGE = 20;

const typeDecor: Record<string, { label: string; accent: string }> = {
  mention: { label: "Mention", accent: "from-sky-500 to-indigo-500" },
  moderation: { label: "Moderation", accent: "from-amber-500 to-orange-500" },
  system: { label: "System", accent: "from-slate-500 to-slate-700" },
  insight: { label: "Insight", accent: "from-emerald-500 to-teal-500" },
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());

  useEffect(() => {
    setPage(1);
  }, [showUnreadOnly, deferredSearch]);

  const query = useMemo(
    () => ({
      page,
      limit: NOTIFICATIONS_PER_PAGE,
      unreadOnly: showUnreadOnly || undefined,
    }),
    [page, showUnreadOnly],
  );

  const { data, error, isLoading, mutate } = useNotifications(query);
  const markNotificationRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1;

  const filteredNotifications = deferredSearch
    ? notifications.filter((notification) =>
        JSON.stringify(notification.payload).toLowerCase().includes(deferredSearch.toLowerCase()),
      )
    : notifications;

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
    } catch (err) {
      if (err instanceof ApiError) {
        // no toast to keep page clean; console
        console.error(err.message);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2rem] text-slate-400">Notifications</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Every signal, all in one warm feed.</h1>
          <p className="max-w-2xl text-sm text-slate-400">
            Mentions, moderation moments, and AI insights land here so nothing warm slips away.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className={cn(
              "rounded-xl border border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700",
              showUnreadOnly && "border-sky-500/60 bg-sky-500/10 text-sky-200",
            )}
            onClick={() => {
              setPage(1);
              setShowUnreadOnly((prev) => !prev);
            }}
          >
            <Filter className="mr-2 size-4" />
            {showUnreadOnly ? "Showing unread" : "Show unread"}
          </Button>
          <Button
            className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/30 hover:from-sky-400 hover:to-indigo-500"
            onClick={handleMarkAllRead}
          >
            <CheckCheck className="mr-2 size-4" />
            Mark all read
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70">
        <div className="flex flex-col gap-3 border-b border-slate-800/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-slate-200 shadow-inner shadow-slate-900/80">
              <Input
                placeholder="Search notifications…"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="border-none bg-transparent p-0 text-sm focus-visible:ring-0"
              />
              <Bell className="size-4 text-slate-500" />
            </div>
            <span className="hidden text-xs uppercase tracking-[0.2em] text-slate-500 sm:inline-flex">
              {showUnreadOnly ? "Unread only" : "All signals"}
            </span>
          </div>
          <Button
            variant="ghost"
            className="rounded-xl border border-slate-800/70 bg-slate-900/70 text-slate-300 hover:border-slate-700 sm:text-sm"
            onClick={() => mutate()}
          >
            Refresh
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-3 px-6 py-5 text-sm text-slate-300">
            <Loader2 className="size-4 animate-spin text-sky-300" />
            Loading notifications…
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between gap-4 border-b border-slate-800/70 px-6 py-5 text-sm text-rose-200">
            <span>{error instanceof Error ? error.message : "Unable to load notifications right now."}</span>
            <Button variant="ghost" size="sm" className="text-rose-200 hover:text-rose-100" onClick={() => mutate()}>
              Retry
            </Button>
          </div>
        )}

        <div className="divide-y divide-slate-800/60">
          {filteredNotifications.map((notification) => {
            const decor = typeDecor[notification.event] ?? {
              label: notification.event,
              accent: "from-slate-600 to-slate-800",
            };

            return (
              <div
                key={notification.id}
                className={cn(
                  "flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-900/60",
                  !notification.read && "bg-slate-900/60",
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg shadow-slate-900/70",
                      decor.accent,
                    )}
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.2em]">{decor.label.slice(0, 2)}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">{decor.label}</span>
                      <span className="text-xs text-slate-500">{formatRelativeTime(notification.createdAt)}</span>
                      {!notification.read && (
                        <span className="rounded-lg bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-300">
                          New
                        </span>
                      )}
                    </div>
                    <pre className="whitespace-pre-wrap break-words text-xs text-slate-300">
                      {JSON.stringify(notification.payload, null, 2)}
                    </pre>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg border border-slate-800/70 bg-slate-900/70 text-xs text-slate-300 hover:border-slate-700"
                      onClick={() => handleMarkRead(notification.id)}
                      disabled={notification.read}
                    >
                      {notification.read ? "Read" : "Mark read"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!filteredNotifications.length && !isLoading && (
          <div className="px-6 py-12 text-center text-sm text-slate-400">
            Nothing to show right now. You’ll see new mentions, moderation updates, and insights here.
          </div>
        )}

        {pagination && filteredNotifications.length > 0 && (
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
              <span className="uppercase tracking-[0.18em]">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-slate-800/70 bg-slate-900/70 text-xs uppercase tracking-[0.2em] text-slate-300 hover:border-slate-700"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


