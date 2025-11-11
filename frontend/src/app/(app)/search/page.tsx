"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, Search as SearchIcon, UserCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type AdminUser, listAdminUsers } from "@/lib/api/admin/users";
import { useAuthorizedSWR } from "@/lib/api/swr";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/date";
import { useDebounce } from "@/lib/hooks/use-debounce";

const STATUS_STYLES: Record<AdminUser["status"], string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  suspended: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  banned: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
};

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryParam = searchParams.get("q") ?? "";
  const pageParam = Number(searchParams.get("page") ?? "1");
  const safePage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const [inputValue, setInputValue] = useState(queryParam);
  const [page, setPage] = useState(safePage);

  useEffect(() => {
    setInputValue((current) => (current === queryParam ? current : queryParam));
  }, [queryParam]);

  useEffect(() => {
    setPage((current) => (current === safePage ? current : safePage));
  }, [safePage]);

  const trimmedQuery = queryParam.trim();
  const debouncedQuery = useDebounce(trimmedQuery, 300);
  const shouldShowResults = debouncedQuery.length > 0;

  const peopleQuery = useMemo(
    () => ({
      page,
      limit: 20,
      query: debouncedQuery || undefined,
    }),
    [debouncedQuery, page],
  );

  const searchParamsString = searchParams.toString();

  type PeopleResponse = Awaited<ReturnType<typeof listAdminUsers>>;

  const { data, error, isLoading, isValidating } = useAuthorizedSWR<PeopleResponse>(
    shouldShowResults ? (["people-search", debouncedQuery, page] as const) : null,
    (accessToken) => listAdminUsers(peopleQuery, accessToken),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30_000,
    },
  );

  const peopleData = shouldShowResults ? data : undefined;

  const people = peopleData?.data ?? [];
  const pagination = shouldShowResults ? peopleData?.pagination : undefined;
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1;

  const showEmpty = shouldShowResults && !isLoading && people.length === 0;
  const showError = shouldShowResults && !isLoading && !!error;

  const introDescription = "Start typing above to find teammates and collaborators.";
  const loadingDescription = "Finding people...";
  const emptyDescription = trimmedQuery ? `No people match "${trimmedQuery}". Try another name or handle.` : "No people found.";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedValue = inputValue.trim();
    const params = new URLSearchParams();
    if (trimmedValue) {
      params.set("q", trimmedValue);
    }
    params.delete("page");
    params.set("type", "people");
    setPage(1);
    const target = params.toString();
    router.push(target ? `/search?${target}` : "/search");
  };

  const handleClear = () => {
    setInputValue("");
    setPage(1);
    router.push("/search?type=people");
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) {
      return;
    }

    setPage(nextPage);

    const params = new URLSearchParams(searchParamsString);
    params.set("type", "people");
    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }

    const trimmed = (params.get("q") ?? "").trim();
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }

    const next = params.toString();
    router.replace(next ? `/search?${next}` : "/search", { scroll: false });
  };

  return (
    <div className="space-y-8 text-slate-700 transition-colors dark:text-slate-200">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2rem] text-muted-foreground">Search</p>
        <h1 className="text-3xl font-semibold text-slate-900 transition-colors dark:text-white sm:text-4xl">
          Find the people you need.
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Look across the community to connect with the right collaborators.
        </p>
      </div>

      <div className="rounded-3xl border border-border/80 bg-card/90 pb-6 shadow-lg shadow-slate-200/30 transition-colors dark:border-slate-800/70 dark:bg-slate-950/70 dark:shadow-slate-950/40">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 border-b border-border/70 px-6 py-5 transition-colors dark:border-slate-800/70 sm:flex-row sm:items-center"
          role="search"
          aria-label="Search people"
        >
          <div className="relative flex-1 rounded-xl border border-border/60 bg-secondary/60 px-3 py-2 text-sm text-muted-foreground shadow-inner shadow-slate-200/40 transition-colors dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-slate-900/70">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Search for people by name, handle, or email"
              className="border-none bg-transparent pl-9 text-sm text-muted-foreground placeholder:text-muted-foreground focus-visible:ring-0 dark:text-slate-200"
              aria-label="Search for people"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl border border-border/60 bg-secondary/60 px-4 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:border-border hover:text-slate-700 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-200"
              onClick={handleClear}
              disabled={!inputValue.length && !queryParam.length}
            >
              Clear
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 hover:from-sky-400 hover:to-indigo-500"
            >
              Search
            </Button>
          </div>
        </form>

        {!shouldShowResults && (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">{introDescription}</div>
        )}

        {shouldShowResults && (
          <>
            <div className="space-y-4 px-6 pt-6">
              {(isLoading || isValidating) && (
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-secondary/60 px-6 py-4 text-sm text-muted-foreground transition-colors dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-300">
                  <Loader2 className="size-4 animate-spin text-sky-500" aria-hidden="true" />
                  {loadingDescription}
                </div>
              )}

              {showError && (
                <div className="flex items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 px-6 py-4 text-sm text-destructive transition-colors dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                  <AlertTriangle className="size-4" />
                  {error instanceof Error ? error.message : "Unable to load search results. Please try again."}
                </div>
              )}

              {showEmpty && (
                <div className="rounded-2xl border border-border/70 bg-secondary/50 px-6 py-10 text-center text-sm text-muted-foreground transition-colors dark:border-slate-800/70 dark:bg-slate-900/60">
                  {emptyDescription}
                </div>
              )}

              {people.map((person) => {
                const displayName = person.displayName?.trim() || person.email || "Community member";
                const handle = person.handle ? `@${person.handle}` : null;
                const roleBadges = (person.roles ?? []).filter(Boolean);
                const statusStyle = STATUS_STYLES[person.status] ?? STATUS_STYLES.active;
                const threadsCount = person.threadsCount ?? 0;
                const postsCount = person.postsCount ?? 0;
                const lastActive = person.lastActiveAt ? formatRelativeTime(person.lastActiveAt) : null;

                return (
                  <div
                    key={person.id}
                    className="rounded-2xl border border-border/70 bg-card/80 p-6 transition-colors hover:border-border hover:bg-secondary/60 dark:border-slate-800/60 dark:bg-slate-900/70 dark:hover:border-slate-700 dark:hover:bg-slate-900/80"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 shadow-inner dark:bg-slate-800 dark:text-slate-200">
                          <UserCircle2 className="size-6" aria-hidden="true" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-semibold text-slate-900 transition-colors dark:text-white">{displayName}</h2>
                            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", statusStyle)}>
                              {person.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            {handle && <span>{handle}</span>}
                            {person.email && handle && <span>•</span>}
                            {person.email && <span>{person.email}</span>}
                          </div>
                          {roleBadges.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {roleBadges.map((role) => (
                                <span
                                  key={role}
                                  className="rounded-md border border-border/60 bg-secondary/60 px-2 py-1 text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors dark:border-slate-800/70 dark:bg-slate-900/70"
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/60 px-3 py-2 transition-colors dark:border-slate-800/70 dark:bg-slate-900/70">
                          <span className="text-xs uppercase tracking-[0.18em]">Threads</span>
                          <span className="text-base font-semibold text-slate-900 dark:text-white">{threadsCount}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/60 px-3 py-2 transition-colors dark:border-slate-800/70 dark:bg-slate-900/70">
                          <span className="text-xs uppercase tracking-[0.18em]">Posts</span>
                          <span className="text-base font-semibold text-slate-900 dark:text-white">{postsCount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {lastActive ? <span>Last active {lastActive}</span> : <span>Recent activity unavailable</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {people.length > 0 && pagination && (
              <div className="mt-6 flex items-center justify-between border-t border-border/70 px-6 pt-4 text-sm text-muted-foreground transition-colors dark:border-slate-800/70">
                <span>
                  Showing {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
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
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="rounded-lg border border-border/60 bg-secondary/60 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:border-border disabled:opacity-50 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-300"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


