"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Filter, Flame, Loader2, MessageCircle, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useThreads } from "@/lib/api/hooks/threads";
import { CreateThreadModal } from "@/components/threads/create-thread-modal";
import { formatRelativeTime } from "@/lib/utils/date";

const statusStyles: Record<string, string> = {
  open: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
  locked: "border-amber-400/50 bg-amber-500/10 text-amber-300",
  archived: "border-slate-600/60 bg-slate-800/60 text-slate-300",
};

const statusOptions = ["all", "open", "locked", "archived"] as const;

const THREADS_PER_PAGE = 10;

export default function ThreadsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const threadsQuery = useMemo(
    () => ({
      page,
      limit: THREADS_PER_PAGE,
      status: statusFilter !== "all" ? (statusFilter as "open" | "locked" | "archived") : undefined,
      search: debouncedSearch || undefined,
    }),
    [debouncedSearch, page, statusFilter],
  );

  const { data, error, isLoading, isValidating } = useThreads(threadsQuery);

  const threads = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1;

  const showEmpty = !isLoading && !threads.length;
  const showError = !isLoading && !!error;

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2rem] text-slate-400">Threads</p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">Rooms alive with warmth.</h1>
            <p className="max-w-2xl text-sm text-slate-400">
              Explore community stories, check-in moments, and moderation updates across your workspace.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="rounded-xl border border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700"
            >
              <Sparkles className="mr-2 size-4" />
              Summarize this space
            </Button>
            <Button
              className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/30 hover:from-sky-400 hover:to-indigo-500"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Flame className="mr-2 size-4" />
              Start a thread
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70 pb-6">
          <div className="flex flex-col gap-3 border-b border-slate-800/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 rounded-xl border border-slate-800/80 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 shadow-inner shadow-slate-900/70">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search for threads, tags, or participants"
                  className="border-none bg-transparent pl-10 text-sm text-slate-200 placeholder:text-slate-500 focus-visible:ring-0"
                />
              </div>
              <Button
                variant="ghost"
                className="rounded-xl border border-slate-800/80 bg-slate-900/70 px-4 text-slate-200 hover:border-slate-700"
              >
                <Filter className="mr-2 size-4" />
                Filters
              </Button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {statusOptions.map((option) => {
                const isActive = option === statusFilter;
                return (
                  <button
                    key={option}
                    onClick={() => setStatusFilter(option)}
                    className={cn(
                      "rounded-xl border px-3 py-1 text-xs uppercase tracking-wide transition",
                      isActive
                        ? "border-sky-500/60 bg-sky-500/10 text-sky-200"
                        : "border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-slate-200",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 px-6 pt-6">
            {(isLoading || isValidating) && (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/60 px-6 py-4 text-sm text-slate-300">
                <Loader2 className="size-4 animate-spin text-sky-300" />
                Updating conversations…
              </div>
            )}

            {showError && (
              <div className="flex items-center gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-6 py-4 text-sm text-red-300">
                <AlertTriangle className="size-4" />
                {error instanceof Error ? error.message : "Unable to load threads. Please try again."}
              </div>
            )}

            {showEmpty && (
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 px-6 py-10 text-center text-sm text-slate-400">
                Nothing matches yet. Try another keyword, adjust filters, or start the conversation yourself.
              </div>
            )}

            {threads.map((thread) => {
              const statusLabel = thread.status ?? "open";
              const statusClass =
                statusStyles[statusLabel] ?? "border border-slate-700 bg-slate-900/60 text-slate-300";

              const summary =
                thread.summary && thread.summary.trim().length > 0
                  ? thread.summary
                  : "Summary is being generated. Jump in to keep the warmth going.";

              return (
                <Link key={thread.id} href={`/threads/${thread.id}`} className="block">
                  <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 transition hover:border-slate-700 hover:bg-slate-900/80">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                          <span>{statusLabel}</span>
                          <span className="text-slate-700">•</span>
                          <span>{formatRelativeTime(thread.lastActivityAt)}</span>
                        </div>
                        <h2 className="text-lg font-semibold text-white">{thread.title}</h2>
                        <p className="max-w-3xl text-sm text-slate-400">{summary}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>{thread.postsCount} posts</span>
                          <span>•</span>
                          <span>{thread.participantsCount} participants</span>
                          <span>•</span>
                          <span>Updated {formatRelativeTime(thread.updatedAt)}</span>
                        </div>
                        {!!thread.tags?.length && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {thread.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-lg border border-slate-800 bg-slate-900/60 px-2 py-1 text-xs text-slate-400"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-start gap-2">
                        <span className={cn("rounded-xl px-3 py-1 text-xs font-medium shadow-inner", statusClass)}>
                          {statusLabel}
                        </span>
                        <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-3 text-center text-xs text-slate-400">
                          <MessageCircle className="mb-2 size-5 text-slate-300" />
                          <div className="font-semibold text-white">{thread.postsCount}</div>
                          posts
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {threads.length > 0 && pagination && (
            <div className="mt-6 flex items-center justify-between border-t border-slate-800/70 px-6 pt-4 text-sm text-slate-400">
              <span>
                Showing {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-slate-800/70 bg-slate-900/60 text-xs uppercase tracking-[0.2em] text-slate-300 hover:border-slate-700"
                >
                  Previous
                </Button>
                <span className="text-xs uppercase tracking-[0.2em]">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-slate-800/70 bg-slate-900/60 text-xs uppercase tracking-[0.2em] text-slate-300 hover:border-slate-700"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <CreateThreadModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </>
  );
}

