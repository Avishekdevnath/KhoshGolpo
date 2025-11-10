"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCheck,
  Loader2,
  Share2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useThread, useCreatePost } from "@/lib/api/hooks/threads";
import { formatRelativeTime } from "@/lib/utils/date";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/hooks";
import { useSocket } from "@/lib/realtime/socket-context";

const THREAD_POSTS_PER_PAGE = 20;

const statusStyles: Record<string, string> = {
  open: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
  locked: "border-amber-400/50 bg-amber-500/10 text-amber-300",
  archived: "border-slate-600/60 bg-slate-800/60 text-slate-300",
};

const moderationStyles: Record<string, string> = {
  pending: "border-amber-400/40 bg-amber-500/10 text-amber-300",
  approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  flagged: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  rejected: "border-red-500/40 bg-red-500/10 text-red-300",
};

function SummarySection({ summary }: { summary?: string | null }) {
  if (!summary) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200/70 bg-white/70 p-6 text-sm text-slate-500 dark:border-slate-800/70 dark:bg-slate-900/50 dark:text-slate-400">
        <Sparkles className="mb-3 size-5 text-slate-400" />
        We’re weaving a warmth summary for this conversation. Check back soon or surface key highlights manually.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-inner shadow-slate-200/60 dark:border-slate-800/70 dark:bg-slate-900/60 dark:shadow-slate-900/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400">Warmth summary</p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-200">{summary}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
        >
          <Share2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function PostCard({
  body,
  moderationState,
  moderationFeedback,
  createdAt,
  authorId,
}: {
  body: string;
  moderationState: string;
  moderationFeedback?: string | null;
  createdAt: string;
  authorId: string;
}) {
  const moderationClass =
    moderationStyles[moderationState] ?? "border border-slate-700 bg-slate-800/60 text-slate-300";

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 transition hover:border-slate-300 dark:border-slate-800/60 dark:bg-slate-950/70 dark:hover:border-slate-700/80">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-white">{authorId}</span>
            <span className="text-slate-700 dark:text-slate-600">•</span>
            <span>{formatRelativeTime(createdAt)}</span>
          </div>
          <p className="text-sm leading-6 text-slate-700 dark:text-slate-200 whitespace-pre-line">{body}</p>
          {moderationFeedback && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              <div className="flex items-center gap-2 font-semibold uppercase tracking-[0.2em]">
                <ShieldAlert className="size-3" />
                Moderation note
              </div>
              <p className="mt-1 text-amber-100/90">{moderationFeedback}</p>
            </div>
          )}
        </div>
        <span className={cn("rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]", moderationClass)}>
          {moderationState}
        </span>
      </div>
    </div>
  );
}

export default function ThreadDetailPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = use(params);
  const [page, setPage] = useState(1);
  const [body, setBody] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const query = useMemo(
    () => ({
      page,
      limit: THREAD_POSTS_PER_PAGE,
    }),
    [page],
  );

  const { data, error, isLoading, isValidating, mutate } = useThread(threadId, { page: query.page, limit: query.limit });
  const createPost = useCreatePost(threadId);
  const { user } = useAuth();
  const { socket } = useSocket();

  if (error instanceof ApiError && error.status === 404) {
    notFound();
  }

  const thread = data?.thread;
  const posts = data?.posts ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1;

  const statusLabel = thread?.status ?? "open";
  const statusClass =
    statusStyles[statusLabel] ?? "border border-slate-700 bg-slate-900/60 text-slate-300";

  const summary = thread?.summary ?? null;
  const isThreadLocked = thread?.status !== "open";

  const handlePostReply = async () => {
    if (!thread || !body.trim()) {
      return;
    }
    setIsPosting(true);
    try {
      await createPost({ body: body.trim() });
      setBody("");
      toast.success("Reply posted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to post reply right now.");
    } finally {
      setIsPosting(false);
    }
  };

  useEffect(() => {
    if (!socket || !thread) {
      return;
    }

    socket.emit("joinThread", { threadId: thread.id });

    return () => {
      socket.emit("leaveThread", { threadId: thread.id });
    };
  }, [socket, thread]);

  return (
    <div className="space-y-8 text-slate-200">
      <div className="flex items-center justify-between">
        <Link
          href="/threads"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to threads
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="rounded-xl border border-slate-200/70 bg-white/80 text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-700"
          >
            <Sparkles className="mr-2 size-4 text-sky-400" />
            Request summary refresh
          </Button>
          <Button className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/30 hover:from-sky-400 hover:to-indigo-500">
            Join live reaction
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/60 px-6 py-4 text-sm text-slate-300">
          <Loader2 className="size-4 animate-spin text-sky-300" />
          Loading conversation…
        </div>
      )}

      {error && !(error instanceof ApiError && error.status === 404) && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-6 py-4 text-sm text-red-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-4" />
            <span>{error instanceof Error ? error.message : "Unable to load this thread right now."}</span>
          </div>
          <Button variant="ghost" size="sm" className="text-red-200 hover:text-red-100" onClick={() => mutate()}>
            Retry
          </Button>
        </div>
      )}

      {thread && (
        <>
          <Card className="border border-slate-800/70 bg-slate-950/70">
            <div className="space-y-6 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
                    <span className={cn("rounded-xl px-3 py-1 text-xs font-semibold shadow-inner", statusClass)}>{statusLabel}</span>
                    <span>{formatRelativeTime(thread.createdAt)}</span>
                    <span>Updated {formatRelativeTime(thread.updatedAt)}</span>
                    <span>{thread.participantsCount} participants</span>
                  </div>
                  <h1 className="text-3xl font-semibold text-white lg:text-4xl">{thread.title}</h1>
                  <p className="max-w-3xl text-sm text-slate-300">{summary ?? "Summary is being prepared."}</p>
                </div>
                <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 px-4 py-3 text-xs text-slate-400">
                  <div className="font-semibold uppercase tracking-[0.2em] text-slate-200">Stats</div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Posts</span>
                      <span>{thread.postsCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Participants</span>
                      <span>{thread.participantsCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last activity</span>
                      <span>{formatRelativeTime(thread.lastActivityAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {!!thread.tags?.length && (
                <div className="flex flex-wrap gap-2">
                  {thread.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <SummarySection summary={thread.summary} />
            </div>
          </Card>

          <div className="space-y-4">
            {isValidating && !isLoading && (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/60 px-6 py-3 text-xs text-slate-300">
                <Loader2 className="size-3 animate-spin text-sky-300" />
                Syncing latest replies…
              </div>
            )}

            {posts.map((post) => (
              <PostCard
                key={post.id}
                body={post.body}
                moderationState={post.moderationState}
                moderationFeedback={post.moderationFeedback}
                createdAt={post.createdAt}
                authorId={post.authorId}
              />
            ))}

            {!posts.length && (
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 px-6 py-10 text-center text-sm text-slate-400">
                No posts yet. Be the first to share a reflection.
              </div>
            )}

            {pagination && posts.length > 0 && (
              <div className="mt-6 flex items-center justify-between border-t border-slate-800/70 pt-4 text-xs text-slate-400">
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
                    className="rounded-lg border border-slate-800/70 bg-slate-900/60 text-xs uppercase tracking-[0.2em] text-slate-300 hover:border-slate-700"
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
                    className="rounded-lg border border-slate-800/70 bg-slate-900/60 text-xs uppercase tracking-[0.2em] text-slate-300 hover:border-slate-700"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-inner shadow-slate-200/70 transition dark:border-slate-800/70 dark:bg-slate-950/70 dark:shadow-slate-900/70">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Continue the warmth</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Your reply publishes instantly and syncs across all circles.
                </p>
              </div>
              {isThreadLocked && (
                <div className="inline-flex items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
                  <ShieldAlert className="size-3" />
                  Thread locked
                </div>
              )}
            </div>
            <Textarea
              rows={4}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={isThreadLocked ? "Posting is disabled for this thread." : "Share a story, reflection, or question…"}
              disabled={isThreadLocked || isPosting}
              className="border-slate-200/70 bg-white/80 text-slate-700 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
              <div className="inline-flex items-center gap-2">
                <CheckCheck className="size-4" />
                Replies sent as {user?.handle ?? "member"}
              </div>
              <Button
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-500"
                onClick={handlePostReply}
                disabled={isPosting || isThreadLocked || !body.trim()}
              >
                {isPosting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Posting…
                  </>
                ) : (
                  "Post reply"
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

