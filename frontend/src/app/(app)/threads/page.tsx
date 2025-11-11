"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Filter, Flame, Loader2, MessageCircle, Search } from "lucide-react";

import { CreateThreadModal } from "@/components/threads/create-thread-modal";
import { buildPreview, statusStyles, THREADS_PER_PAGE } from "@/components/threads/thread-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useThreads } from "@/lib/api/hooks/threads";
import { formatRelativeTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks/use-debounce";

const statusOptions = ["all", "open", "locked", "archived"] as const;

export default function ThreadsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const getInitialStatus = () => {
    const statusParam = searchParams.get("status");
    return statusOptions.includes(statusParam as (typeof statusOptions)[number])
      ? (statusParam as (typeof statusOptions)[number])
      : "all";
  };

  const getInitialPage = () => {
    const pageParam = Number(searchParams.get("page") ?? "1");
    return Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  };

  const [page, setPage] = useState(getInitialPage);
  const initialSearch = searchParams.get("search") ?? searchParams.get("q") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search.trim(), 300);
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>(getInitialStatus);
  const [tag, setTag] = useState(searchParams.get("tag") ?? "");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const debouncedTag = useDebounce(tag.trim(), 300);
  const hasActiveSearch = !!debouncedSearch;
  const hasActiveTag = !!debouncedTag;
  const hasActiveFilters = hasActiveSearch || hasActiveTag;

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const nextStatus = statusOptions.includes(statusParam as (typeof statusOptions)[number])
      ? (statusParam as (typeof statusOptions)[number])
      : "all";

    const nextSearch = searchParams.get("search") ?? searchParams.get("q") ?? "";
    const nextTag = searchParams.get("tag") ?? "";
    const nextPageParam = Number(searchParams.get("page") ?? "1");
    const safePage = Number.isFinite(nextPageParam) && nextPageParam > 0 ? nextPageParam : 1;

    queueMicrotask(() => {
      setStatusFilter((current) => (current === nextStatus ? current : nextStatus));
      setSearch((current) => (current === nextSearch ? current : nextSearch));
      setTag((current) => (current === nextTag ? current : nextTag));
      setPage((current) => (current === safePage ? current : safePage));
    });
  }, [searchParams]);

  const updateQueryParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const current = searchParams.toString();
      const params = new URLSearchParams(current);

      // Remove legacy query param key if present
      params.delete("q");

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "" || (typeof value === "number" && value <= 0)) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      const next = params.toString();
      if (next === current) {
        return;
      }

      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const threadsQuery = useMemo(() => {
    const limit = hasActiveFilters ? Math.max(THREADS_PER_PAGE, 50) : THREADS_PER_PAGE;

    return {
      page,
      limit,
      status: statusFilter !== "all" ? (statusFilter as "open" | "locked" | "archived") : undefined,
      search: debouncedSearch || undefined,
      tag: debouncedTag || undefined,
    };
  }, [debouncedSearch, debouncedTag, hasActiveFilters, page, statusFilter]);

  useEffect(() => {
    updateQueryParams({
      page: page > 1 ? page : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      search: debouncedSearch || undefined,
      tag: debouncedTag || undefined,
    });
  }, [debouncedSearch, debouncedTag, page, statusFilter, updateQueryParams]);

  const { data, error, isLoading, isValidating } = useThreads(threadsQuery, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 30_000,
  });

  const threads = data?.data ?? [];
  const pagination = data?.pagination;

  const normalizedSearch = useMemo(() => debouncedSearch.toLowerCase(), [debouncedSearch]);
  const normalizedTag = useMemo(() => debouncedTag.toLowerCase(), [debouncedTag]);

  const filteredThreads = useMemo(
    () =>
      threads.filter((thread) => {
        const matchesTag = normalizedTag
          ? thread.tags?.some((threadTag) => threadTag.toLowerCase().includes(normalizedTag))
          : true;

        if (!matchesTag) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const searchFields = [
          thread.title,
          thread.summary ?? undefined,
          thread.firstPostPreview?.body ?? undefined,
          thread.author?.displayName ?? undefined,
          thread.author?.handle ? `@${thread.author.handle}` : undefined,
          ...(thread.tags ?? []),
        ];

        return searchFields.some((field) => field?.toLowerCase().includes(normalizedSearch));
      }),
    [normalizedSearch, normalizedTag, threads],
  );

  const visibleThreads = hasActiveFilters ? filteredThreads : threads;
  const effectiveLimit = pagination?.limit ?? THREADS_PER_PAGE;
  const effectiveTotal = hasActiveFilters ? filteredThreads.length : pagination?.total ?? threads.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / effectiveLimit));

  const showEmpty = !isLoading && !visibleThreads.length;
  const showError = !isLoading && !!error;

  return (
    <>
      <div className="space-y-8 text-slate-700 transition-colors dark:text-slate-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2rem] text-muted-foreground">Threads</p>
            <h1 className="text-3xl font-semibold text-slate-900 transition-colors dark:text-white sm:text-4xl">
              Rooms alive with warmth.
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Explore community stories, check-in moments, and moderation updates across your workspace.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/30 hover:from-sky-400 hover:to-indigo-500"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Flame className="mr-2 size-4" />
              Start a thread
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card/90 pb-6 shadow-lg shadow-slate-200/30 transition-colors dark:border-slate-800/70 dark:bg-slate-950/70 dark:shadow-slate-950/40">
          <div className="flex flex-col gap-3 border-b border-border/70 px-6 py-4 transition-colors dark:border-slate-800/70 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 rounded-xl border border-border/60 bg-secondary/60 px-3 py-2 text-sm text-muted-foreground shadow-inner shadow-slate-200/40 transition-colors dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-slate-900/70">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search for threads, tags, or participants"
                  className="border-none bg-transparent pl-10 text-sm text-muted-foreground placeholder:text-muted-foreground focus-visible:ring-0 dark:text-slate-200"
                />
              </div>
              <div className="relative w-full rounded-xl border border-border/60 bg-secondary/60 px-3 py-2 text-sm text-muted-foreground shadow-inner shadow-slate-200/40 transition-colors dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-slate-900/70 sm:w-56">
                <Input
                  value={tag}
                  onChange={(event) => {
                    setTag(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Filter by tag"
                  className="border-none bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground focus-visible:ring-0 dark:text-slate-200"
                />
              </div>
              <Button
                variant="ghost"
                className="rounded-xl border border-border/60 bg-secondary/60 px-4 text-muted-foreground hover:border-border dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-200"
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
                Updating conversations…
              </div>
            )}

            {showError && (
              <div className="flex items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 px-6 py-4 text-sm text-destructive transition-colors dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                <AlertTriangle className="size-4" />
                {error instanceof Error ? error.message : "Unable to load threads. Please try again."}
              </div>
            )}

            {showEmpty && (
              <div className="rounded-2xl border border-border/70 bg-secondary/50 px-6 py-10 text-center text-sm text-muted-foreground transition-colors dark:border-slate-800/70 dark:bg-slate-900/60">
                Nothing matches yet. Try another keyword, adjust filters, or start the conversation yourself.
              </div>
            )}

            {visibleThreads.map((thread) => {
              const statusLabel = thread.status ?? "open";
              const statusClass =
                statusStyles[statusLabel] ??
                "border border-border/60 bg-secondary/60 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300";

              const preview = buildPreview(thread.firstPostPreview?.body);
              const authorDisplayName = thread.author?.displayName?.trim();
              const authorHandle = thread.author?.handle ? `@${thread.author.handle}` : null;

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
                        <h2 className="text-lg font-semibold text-slate-900 transition-colors dark:text-white">{thread.title}</h2>
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
                            {thread.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-lg border border-border/60 bg-secondary/50 px-2 py-1 text-xs text-muted-foreground transition-colors dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
                              >
                                #{tag}
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
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {visibleThreads.length > 0 && pagination && (
            <div className="mt-6 flex items-center justify-between border-t border-border/70 px-6 pt-4 text-sm text-muted-foreground transition-colors dark:border-slate-800/70">
              <span>
                {hasActiveFilters ? (
                  <>
                    Showing {visibleThreads.length} result{visibleThreads.length === 1 ? "" : "s"}
                    {hasActiveSearch ? ` for "${search.trim()}"` : ""}
                    {hasActiveTag ? ` matching tag "${tag.trim()}"` : ""}
                  </>
                ) : (
                  <>
                    Showing {(pagination.page - 1) * pagination.limit + 1}-
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </>
                )}
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
      <CreateThreadModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </>
  );
}

