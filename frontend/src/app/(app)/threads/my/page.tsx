"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState, useCallback } from "react";
import { AlertTriangle, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { buildPreview, statusStyles, THREADS_PER_PAGE } from "@/components/threads/thread-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useArchiveThread, useMyThreads, useUnarchiveThread } from "@/lib/api/hooks/threads";
import { formatRelativeTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils";

const statusOptions = ["all", "open", "archived"] as const;

export default function MyThreadsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("all");
  const [busyThreadId, setBusyThreadId] = useState<string | null>(null);

  const threadsQuery = useMemo(
    () => ({
      page,
      limit: THREADS_PER_PAGE,
      status: statusFilter !== "all" ? (statusFilter as "open" | "archived") : undefined,
      search: deferredSearch || undefined,
    }),
    [deferredSearch, page, statusFilter],
  );

  const { data, error, isLoading, isValidating } = useMyThreads(threadsQuery);
  const archiveThread = useArchiveThread();
  const unarchiveThread = useUnarchiveThread();

  const threads = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1;

  const showEmpty = !isLoading && !threads.length;
  const showError = !isLoading && !!error;

  const handleStatusChange = useCallback(
    async (threadId: string, action: "archive" | "unarchive") => {
      const confirmationMessage =
        action === "archive"
          ? "Archive this thread? It will disappear from your active list until restored."
          : "Restore this thread to active?";
      if (typeof window !== "undefined" && !window.confirm(confirmationMessage)) {
        return;
      }

      try {
        setBusyThreadId(threadId);
        if (action === "archive") {
          await archiveThread(threadId);
          toast.success("Thread archived.");
        } else {
          await unarchiveThread(threadId);
          toast.success("Thread restored.");
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unable to update thread status right now.");
      } finally {
        setBusyThreadId(null);
      }
    },
    [archiveThread, unarchiveThread],
  );

  return (
    <div className="space-y-8 text-slate-700 transition-colors dark:text-slate-200">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2rem] text-muted-foreground">My threads</p>
          <h1 className="text-3xl font-semibold text-slate-900 transition-colors dark:text-white sm:text-4xl">
            Your conversations hub.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Track every thread you’ve started. Archive ones that can rest, or restore the stories worth revisiting.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-border/80 bg-card/90 pb-6 shadow-lg shadow-slate-200/30 transition-colors dark:border-slate-800/70 dark:bg-slate-950/70 dark:shadow-slate-950/40">
        <div className="flex flex-col gap-3 border-b border-border/70 px-6 py-4 transition-colors dark:border-slate-800/70 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 rounded-xl border border-border/60 bg-secondary/60 px-3 py-2 text-sm text-muted-foreground shadow-inner shadow-slate-200/40 transition-colors dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-slate-900/70">
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search within your threads"
                className="border-none bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground focus-visible:ring-0 dark:text-slate-200"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {statusOptions.map((option) => {
              const isActive = option === statusFilter;
              return (
                <button
                  key={option}
                  onClick={() => {
                    setStatusFilter(option);
                    setPage(1);
                  }}
                  className={cn("rounded-xl border px-3 py-1 text-xs uppercase tracking-wide transition-colors", {
                    "border-sky-500/60 bg-sky-500/10 text-sky-600 dark:text-sky-200": isActive,
                    "border-border/60 bg-secondary/60 text-muted-foreground hover:border-border hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-slate-200":
                      !isActive,
                  })}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 px-6 pt-6">
          {(isLoading || isValidating) && (
            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-secondary/60 px-6 py-4 text-sm text-muted-foreground transition-colors dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-300">
              <Loader2 className="size-4 animate-spin text-sky-500" aria-hidden="true" />
              Updating your conversations…
            </div>
          )}

          {showError && (
            <div className="flex items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 px-6 py-4 text-sm text-destructive transition-colors dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
              <AlertTriangle className="size-4" />
              {error instanceof Error ? error.message : "Unable to load your threads. Please try again."}
            </div>
          )}

          {showEmpty && (
            <div className="rounded-2xl border border-border/70 bg-secondary/50 px-6 py-10 text-center text-sm text-muted-foreground transition-colors dark:border-slate-800/70 dark:bg-slate-900/60">
              You haven’t started any threads yet. Create one to begin the conversation.
            </div>
          )}

          {threads.map((thread) => {
            const statusLabel = thread.status ?? "open";
            const statusClass =
              statusStyles[statusLabel] ??
              "border border-border/60 bg-secondary/60 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300";

            const preview = buildPreview(thread.firstPostPreview?.body);
            const authorDisplayName = thread.author?.displayName?.trim();
            const authorHandle = thread.author?.handle ? `@${thread.author.handle}` : null;

            const isArchived = thread.status === "archived";
            const isBusy = busyThreadId === thread.id;

            return (
              <Link key={thread.id} href={`/threads/${thread.id}`} className="block">
                <div className="rounded-2xl border border-border/70 bg-card/80 p-6 transition-colors hover:border-border hover:bg-secondary/60 dark:border-slate-800/60 dark:bg-slate-900/70 dark:hover:border-slate-700 dark:hover:bg-slate-900/80">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                        <span>{statusLabel}</span>
                        <span className="text-border">•</span>
                        <span>{formatRelativeTime(thread.lastActivityAt)}</span>
                      </div>
                      <h2 className="text-lg font-semibold text-slate-900 transition-colors dark:text-white">
                        {thread.title}
                      </h2>
                      {(authorDisplayName || authorHandle) && (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>By {authorDisplayName ?? authorHandle}</span>
                          {authorDisplayName && authorHandle && (
                            <>
                              <span>•</span>
                              <span>{authorHandle}</span>
                            </>
                          )}
                        </div>
                      )}
                      {preview ? (
                        <p className="max-w-3xl text-sm text-muted-foreground">{preview}</p>
                      ) : (
                        <p className="max-w-3xl text-sm text-muted-foreground">
                          Be the first to add a note to this thread.
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{thread.postsCount} posts</span>
                        <span>•</span>
                        <span>{thread.participantsCount} participants</span>
                        <span>•</span>
                        <span>Updated {formatRelativeTime(thread.updatedAt)}</span>
                      </div>
                      {!!thread.tags?.length && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {thread.tags.map((tagValue) => (
                            <span
                              key={tagValue}
                              className="rounded-lg border border-border/60 bg-secondary/50 px-2 py-1 text-xs text-muted-foreground transition-colors dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
                            >
                              #{tagValue}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <span className={cn("rounded-xl px-3 py-1 text-xs font-medium shadow-inner capitalize", statusClass)}>
                        {statusLabel}
                      </span>
                      <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-secondary/60 px-3 py-2 text-sm font-semibold text-slate-900 transition-colors dark:border-slate-800/80 dark:bg-slate-900/70 dark:text-slate-200">
                        <MessageCircle className="size-4 text-muted-foreground dark:text-slate-300" aria-hidden="true" />
                        <span>{thread.postsCount}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl border border-border/60 bg-secondary/60 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:border-border hover:text-slate-800 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-200"
                        disabled={isBusy}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleStatusChange(thread.id, isArchived ? "unarchive" : "archive");
                        }}
                      >
                        {isBusy ? (
                          <>
                            <Loader2 className="mr-2 size-3 animate-spin" />
                            Working…
                          </>
                        ) : isArchived ? (
                          "Unarchive"
                        ) : (
                          "Archive"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {threads.length > 0 && pagination && (
          <div className="mt-6 flex items-center justify-between border-t border-border/70 px-6 pt-4 text-sm text-muted-foreground transition-colors dark:border-slate-800/70">
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
                className="rounded-lg border border-border/60 bg-secondary/60 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:border-border disabled:opacity-50 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-300"
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
                className="rounded-lg border border-border/60 bg-secondary/60 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:border-border disabled:opacity-50 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-300"
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


