"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Activity, AlertTriangle, ArrowUpRight, MessageCircle, TrendingUp, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/lib/api/hooks/profile";
import { useThreads } from "@/lib/api/hooks/threads";
import { formatRelativeTime } from "@/lib/utils/date";
import type { PaginatedThreads } from "@/lib/api/threads";

type ThreadSummary = PaginatedThreads["data"][number];

type ActivityDatum = {
  name: string;
  threads: number;
  participants: number;
};

type TagDatum = {
  name: string;
  value: number;
  color: string;
  count: number;
};

const PIE_COLORS = ["#38bdf8", "#a855f7", "#ec4899", "#22d3ee", "#f97316", "#14b8a6"];
const DAY_IN_MS = 86_400_000;

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildActivityData(threads: ThreadSummary[]): ActivityDatum[] {
  const today = new Date();
  const buckets = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today.getTime() - (6 - index) * DAY_IN_MS);
    return {
      date,
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      threads: 0,
      participants: 0,
    };
  });

  if (!threads.length) {
    return buckets.map((bucket) => ({ name: bucket.label, threads: 0, participants: 0 }));
  }

  for (const thread of threads) {
    const activityDate =
      parseDate(thread.lastActivityAt) ?? parseDate(thread.updatedAt) ?? parseDate(thread.createdAt) ?? null;
    if (!activityDate) continue;
    const bucket = buckets.find(({ date }) => isSameDay(date, activityDate));
    if (!bucket) continue;
    bucket.threads += 1;
    bucket.participants += thread.participantsCount ?? 0;
  }

  return buckets.map((bucket) => ({
    name: bucket.label,
    threads: bucket.threads,
    participants: bucket.participants,
  }));
}

function buildTagData(threads: ThreadSummary[]): TagDatum[] {
  const tagCounts = new Map<string, number>();

  threads.forEach((thread) => {
    thread.tags?.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    });
  });

  if (!tagCounts.size) {
    return [
      {
        name: "No tags yet",
        value: 1,
        color: "#94a3b8",
        count: 0,
      },
    ];
  }

  return Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, PIE_COLORS.length)
    .map(([tag, count], index) => ({
    name: tag,
    value: count,
    color: PIE_COLORS[index % PIE_COLORS.length],
    count,
    }));
}

export default function DashboardPage() {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const {
    data: threadsResponse,
    error: threadsError,
    isLoading: isThreadsLoading,
    isValidating: isThreadsValidating,
  } = useThreads(
    {
      page: 1,
      limit: 50,
    },
    {
      revalidateOnFocus: false,
    },
  );

  const threads = useMemo(() => threadsResponse?.data ?? [], [threadsResponse?.data]);

  const referenceTimestamp = new Date().getTime();

  const {
    activityData,
    tagData,
    activeThreads7d,
    totalThreads,
    totalParticipants,
    totalPosts,
    openThreads,
    engagementRatio,
    newThreads7d,
    averagePostsPerThread,
  } = useMemo(() => {
    const activity = buildActivityData(threads);
    const tagSummary = buildTagData(threads);

    const sevenDaysAgo = referenceTimestamp - 7 * DAY_IN_MS;

    let active = 0;
    let posts = 0;
    let open = 0;
    let newThreads = 0;

    const participants = new Set<string>();

    threads.forEach((thread) => {
      const updatedAt = parseDate(thread.lastActivityAt) ?? parseDate(thread.updatedAt);
      const createdAt = parseDate(thread.createdAt);

      if (updatedAt && updatedAt.getTime() >= sevenDaysAgo) {
        active += 1;
      }

      if (createdAt && createdAt.getTime() >= sevenDaysAgo) {
        newThreads += 1;
      }

      posts += thread.postsCount ?? 0;
      if (thread.status === "open") {
        open += 1;
      }

      thread.participantIds?.forEach((id) => participants.add(id));
    });

    const total = threadsResponse?.pagination?.total ?? threads.length;
    const engagement = total ? Math.round((active / (threads.length || 1)) * 100) : 0;

    const averagePosts = threads.length ? Math.round(posts / threads.length) : 0;

    return {
      activityData: activity,
      tagData: tagSummary,
      activeThreads7d: active,
      totalThreads: total,
      totalParticipants: participants.size,
      totalPosts: posts,
      openThreads: open,
      engagementRatio: Math.min(engagement, 100),
      newThreads7d: newThreads,
      averagePostsPerThread: averagePosts,
    };
  }, [threads, threadsResponse?.pagination?.total, referenceTimestamp]);

  const trendingThreads = useMemo(() => {
    if (!threads.length) return [];
    return [...threads]
      .sort((a, b) => {
        const byLastActivity =
          (parseDate(b.lastActivityAt)?.getTime() ?? 0) - (parseDate(a.lastActivityAt)?.getTime() ?? 0);
        if (byLastActivity !== 0) return byLastActivity;
        const byUpdated = (parseDate(b.updatedAt)?.getTime() ?? 0) - (parseDate(a.updatedAt)?.getTime() ?? 0);
        if (byUpdated !== 0) return byUpdated;
        return (b.postsCount ?? 0) - (a.postsCount ?? 0);
      })
      .slice(0, 3);
  }, [threads]);

  const firstName =
    profile?.displayName?.split(" ")[0] ?? profile?.handle?.split(/[._-]/)[0] ?? (isProfileLoading ? "..." : "there");
  const personalPostsCount = profile?.postsCount ?? 0;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    if (hour < 22) return "Good evening";
    return "Hi";
  }, []);

  const isLoading = isThreadsLoading || isProfileLoading;
  const showThreadsError = !!threadsError;
  const showEmptyState = !isLoading && !threads.length && !showThreadsError;
  const topThread = trendingThreads[0];

  const warmthInsight = useMemo(() => {
    if (isLoading) {
      return {
        title: `Crunching the numbers for you, ${firstName}…`,
        description: "We’ll surface your latest highlights as soon as the data lands.",
      };
    }

    if (!threads.length) {
      return {
        title: `Ready to spark something new, ${firstName}?`,
        description: "Start your first thread to see personal insights light up here.",
      };
    }

    if (engagementRatio >= 80) {
      return {
        title: "🔥 Your community is buzzing",
        description: `You kept ${activeThreads7d} thread${activeThreads7d === 1 ? "" : "s"} warm this week. Nice work staying close to every conversation.`,
      };
    }

    if (newThreads7d >= 2) {
      return {
        title: "Fresh stories detected",
        description: `${newThreads7d} new thread${newThreads7d === 1 ? "" : "s"} launched in the last 7 days. Check in soon to keep momentum going.`,
      };
    }

    return {
      title: "Still a comfy glow",
      description: `You’ve touched ${activeThreads7d} thread${activeThreads7d === 1 ? "" : "s"} lately. A quick reply or tagged collaborator could nudge engagement higher.`,
    };
  }, [activeThreads7d, engagementRatio, firstName, isLoading, newThreads7d, threads.length]);

  return (
    <div className="space-y-8 text-slate-700 transition-colors dark:text-slate-200">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2rem] text-slate-500 dark:text-slate-400">Dashboard</p>
          <h1 className="text-3xl font-semibold text-slate-900 transition-colors dark:text-white sm:text-4xl">
            {greeting}, {firstName}.
          </h1>
          <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Live community metrics pulled from your threads. Track who’s keeping conversations warm and which themes are
            resonating this week.
          </p>
        </div>
        <Button className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-500">
          Download warmth report
          <ArrowUpRight className="size-4" />
        </Button>
      </div>

      <div className="rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-100/80 via-white to-teal-50 p-6 shadow-lg shadow-emerald-200/40 transition-colors dark:border-emerald-500/20 dark:from-emerald-500/10 dark:via-transparent dark:to-teal-900/20 dark:text-emerald-100">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">Your warmth insight</p>
            <p className="mt-2 text-lg font-semibold text-emerald-900 dark:text-emerald-100">{warmthInsight.title}</p>
            <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">{warmthInsight.description}</p>
          </div>
          <div className="flex gap-2">
            {topThread ? (
              <Button asChild variant="secondary" className="rounded-xl border-emerald-200 bg-white/70 text-emerald-700 hover:bg-white dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100 dark:hover:bg-emerald-500/20">
                <Link href={`/threads/${topThread.id}`}>Jump to {topThread.title}</Link>
              </Button>
            ) : (
              <Button asChild variant="secondary" className="rounded-xl border-emerald-200 bg-white/70 text-emerald-700 hover:bg-white dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100 dark:hover:bg-emerald-500/20">
                <Link href="/threads">Browse threads</Link>
              </Button>
            )}
            <Button asChild variant="ghost" className="rounded-xl border border-transparent text-emerald-700 hover:bg-emerald-100 dark:text-emerald-100 dark:hover:bg-emerald-500/20">
              <Link href="/threads">Start something new</Link>
            </Button>
          </div>
        </div>
      </div>

      {showThreadsError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertTriangle className="size-4" />
          {threadsError instanceof Error ? threadsError.message : "Unable to load dashboard data. Please try again."}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <MessageCircle className="size-4 text-sky-400" />
              Threads active (7d)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold text-slate-900 dark:text-white">
              {isLoading ? "—" : activeThreads7d}
            </p>
            <p className="text-xs text-emerald-500 dark:text-emerald-300">
              {isLoading
                ? "Tracking once data loads"
                : totalThreads
                  ? `${engagementRatio}% of ${totalThreads} threads touched`
                  : "No threads yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Users className="size-4 text-rose-400" />
              Participants engaged
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold text-slate-900 dark:text-white">
              {isLoading ? "—" : totalParticipants}
            </p>
            <p className="text-xs text-rose-500 dark:text-rose-300">
              {isLoading ? "Fetching thread data…" : `Across ${threads.length} recent threads`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <TrendingUp className="size-4 text-violet-400" />
              Posts captured
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold text-slate-900 dark:text-white">
              {isLoading ? "—" : totalPosts}
            </p>
            <p className="text-xs text-violet-500 dark:text-violet-300">
              {isLoading
                ? "Waiting for signal"
                : threads.length
                  ? `${averagePostsPerThread} avg posts per thread`
                  : "No threads yet"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isLoading ? "—" : `You’ve contributed ${personalPostsCount} post${personalPostsCount === 1 ? "" : "s"}.`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Activity className="size-4 text-amber-400" />
              Open threads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold text-slate-900 dark:text-white">
              {isLoading ? "—" : openThreads}
            </p>
            <p className="text-xs text-amber-500 dark:text-amber-300">
              {isLoading ? "Loading moderation view…" : `${newThreads7d} new threads this week`}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-900 dark:text-white">Conversation pulse</CardTitle>
            <CardDescription>
              Daily thread updates compared with unique participants engaging across the last week.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" tick={{ fill: "var(--color-muted-foreground)" }} />
                <YAxis stroke="var(--color-muted-foreground)" tick={{ fill: "var(--color-muted-foreground)" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "12px",
                    color: "var(--color-popover-foreground)",
                  }}
                />
                <Bar dataKey="threads" name="Threads touched" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                <Bar dataKey="participants" name="Participants active" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-900 dark:text-white">Story themes</CardTitle>
            <CardDescription>
              Top tags from your most recent threads. Trends refresh as new posts roll in.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tagData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={80} paddingAngle={3}>
                    {tagData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "12px",
                      color: "var(--color-popover-foreground)",
                    }}
                    formatter={(value: number, _name, item) => [`${value}`, item?.payload?.name ?? "Tag"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {tagData.map((category) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 dark:border-slate-800/80 dark:bg-slate-900/70"
                >
                  <span className="text-slate-700 dark:text-slate-200">{category.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {category.count} thread{category.count === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-900 dark:text-white">Trending threads</CardTitle>
            <CardDescription>
              Most active spaces based on recent posts and last activity timestamps.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-4 text-sm text-slate-400 dark:border-slate-800/70 dark:bg-slate-900/70">
                Loading the latest conversations…
              </div>
            )}

            {!isLoading && trendingThreads.length === 0 && (
              <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-6 text-center text-sm text-slate-500 dark:border-slate-800/70 dark:bg-slate-900/70">
                No threads yet. Create a conversation to see it appear here.
              </div>
            )}

            {trendingThreads.map((thread) => (
              <div
                key={thread.id}
                className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 transition hover:border-slate-300 dark:border-slate-800/70 dark:bg-slate-900/80 dark:hover:border-slate-700"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{thread.title}</p>
                  <span className="rounded-lg bg-slate-200 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {thread.status ?? "—"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {thread.summary?.trim() || "Summary is being generated. Jump in to keep the warmth going."}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                  <span>{thread.postsCount ?? 0} posts</span>
                  <span>•</span>
                  <span>{thread.participantsCount ?? 0} participants</span>
                  {thread.updatedAt && (
                    <>
                      <span>•</span>
                      <span>Updated {formatRelativeTime(thread.updatedAt)}</span>
                    </>
                  )}
                </div>
                {!!thread.tags?.length && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {thread.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-900 dark:text-white">Facilitator heartbeat</CardTitle>
            <CardDescription>
              Quick pulse on engagement trends pulled from live thread data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800/70 dark:bg-slate-900/80">
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>Engagement coverage</span>
                <span>{isLoading ? "…" : `${engagementRatio}%`}</span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all"
                  style={{ width: `${Math.max(5, engagementRatio)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {isThreadsValidating ? "Refreshing live activity…" : "Based on threads touched in the past 7 days."}
              </p>
            </div>

            <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-900/80">
                <span>Active threads (7d)</span>
                <span className="text-emerald-500 dark:text-emerald-300">{isLoading ? "—" : activeThreads7d}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-900/80">
                <span>New threads (7d)</span>
                <span className="text-sky-500 dark:text-sky-300">{isLoading ? "—" : newThreads7d}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-900/80">
                <span>Avg posts per thread</span>
                <span className="text-amber-500 dark:text-amber-300">
                  {isLoading ? "—" : threads.length ? averagePostsPerThread : "0"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showEmptyState && (
        <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-10 text-center text-sm text-slate-500 dark:border-slate-800/70 dark:bg-slate-900/70">
          <p>No thread data yet. Start a new conversation to seed the dashboard.</p>
        </div>
      )}
    </div>
  );
}

