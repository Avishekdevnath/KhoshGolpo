"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCheck, Loader2, ShieldAlert, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useThread, useCreatePost, useDeletePost, useDeleteThread } from "@/lib/api/hooks/threads";
import type { Post } from "@/lib/api/threads";
import { getErrorMessage } from "@/lib/utils/error";
import { formatRelativeTime } from "@/lib/utils/date";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/hooks";
import { useSocket } from "@/lib/realtime/socket-context";

const THREAD_POSTS_PER_PAGE = 20;

const statusStyles: Record<string, string> = {
  open: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-300",
  locked: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-300",
  archived:
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-600/60 dark:bg-slate-800/60 dark:text-slate-300",
};

const moderationStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  flagged: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  rejected: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
};

const formatAuthorLabel = (authorId: string) => {
  if (!authorId) return "Community member";
  const trimmed = authorId.replace(/[^a-zA-Z0-9]/g, "");
  return trimmed ? `member-${trimmed.slice(0, 6).toLowerCase()}` : "Community member";
};

function SummarySection({ summary }: { summary?: string | null }) {
  if (!summary) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-800/70 dark:bg-slate-900/50 dark:text-slate-400">
        <Sparkles className="mb-3 size-5 text-slate-400" />
        We’re still crafting a highlight reel for this conversation. Share a reflection to warm it up.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-inner shadow-slate-200/60 dark:border-slate-800/70 dark:bg-slate-900/60 dark:shadow-slate-900/60">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-1 size-5 text-sky-400" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Summary</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-200">{summary}</p>
        </div>
      </div>
    </div>
  );
}

function PostItem({
  post,
  depth = 0,
  repliesMap,
  onReply,
  onDelete,
  currentUserId,
}: {
  post: Post;
  depth?: number;
  repliesMap: Map<string, Post[]>;
  onReply: (parentId: string, message: string) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
  currentUserId?: string | null;
}) {
  const childReplies = repliesMap.get(post.id) ?? [];
  const moderationBadge =
    moderationStyles[post.moderationState] ?? "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300";

  const [isReplying, setIsReplying] = useState(false);
  const [draft, setDraft] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isOwnPost = currentUserId && post.authorId === currentUserId;

  const handleSubmitReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReplyError(null);
    if (!draft.trim()) {
      setReplyError("Enter a reply before sending.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onReply(post.id, draft.trim());
      setDraft("");
      setIsReplying(false);
      toast.success("Reply posted.");
    } catch (error) {
      const message = getErrorMessage(error, "Unable to post reply right now.");
      setReplyError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("space-y-4", depth > 0 && "border-l border-slate-200 pl-4 dark:border-slate-800")}>
      <article className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 dark:border-slate-800/60 dark:bg-slate-950/70 dark:hover:border-slate-700/80">
        <header className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white">{formatAuthorLabel(post.authorId)}</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <time dateTime={post.createdAt}>{formatRelativeTime(post.createdAt)}</time>
        </header>
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-200">{post.body}</p>
        {post.moderationFeedback && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-100 px-3 py-2 text-xs text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200">
            <div className="flex items-center gap-2 font-semibold uppercase tracking-[0.2em]">
              <ShieldAlert className="size-3" />
              Moderation note
            </div>
            <p className="mt-1 text-amber-700 dark:text-amber-100/90">{post.moderationFeedback}</p>
          </div>
        )}

        <footer className="mt-4 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsReplying((prev) => !prev);
                setReplyError(null);
              }}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-300"
            >
              {isReplying ? "Close reply" : "Reply"}
            </Button>
            {isOwnPost && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-rose-500 hover:text-rose-600 dark:text-rose-300"
                onClick={async () => {
                  if (isDeleting) {
                    return;
                  }
                  const confirmed = window.confirm("Delete this post? This can’t be undone.");
                  if (!confirmed) {
                    return;
                  }
                  setIsDeleting(true);
                  try {
                    await onDelete(post.id);
                    toast.success("Post deleted.");
                  } catch (error) {
                    toast.error(getErrorMessage(error, "Unable to delete this post right now."));
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                isLoading={isDeleting}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            )}
          </div>
          <span className={cn("inline-flex items-center rounded-full px-3 py-1 font-semibold capitalize", moderationBadge)}>
            {post.moderationState}
          </span>
        </footer>

        {isReplying && (
          <form onSubmit={handleSubmitReply} className="mt-4 space-y-3">
            <Textarea
              rows={3}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={`Reply to ${formatAuthorLabel(post.authorId)}`}
              className="border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
            {replyError && <p className="text-xs text-red-500">{replyError}</p>}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsReplying(false);
                  setDraft("");
                  setReplyError(null);
                }}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-300"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send reply"
                )}
              </Button>
            </div>
          </form>
        )}
      </article>

      {childReplies.length > 0 && (
        <div className="space-y-4">
          {childReplies.map((child) => (
            <PostItem
              key={child.id}
              post={child}
              depth={depth + 1}
              repliesMap={repliesMap}
              onReply={onReply}
              onDelete={onDelete}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ThreadDetailPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = use(params);
  const [page, setPage] = useState(1);
  const [body, setBody] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isDeletingThread, setIsDeletingThread] = useState(false);

  const query = useMemo(
    () => ({
      page,
      limit: THREAD_POSTS_PER_PAGE,
    }),
    [page],
  );

  const { data, error, isLoading, isValidating, mutate } = useThread(threadId, { page: query.page, limit: query.limit });
  const createPost = useCreatePost(threadId);
  const deletePostMutation = useDeletePost(threadId);
  const deleteThreadMutation = useDeleteThread();
  const { user } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();

  if (error instanceof ApiError && error.status === 404) {
    notFound();
  }

  const thread = data?.thread;
  const posts = useMemo(() => data?.posts ?? [], [data?.posts]);
  const pagination = data?.pagination;
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1;

  const statusLabel = thread?.status ?? "open";
  const statusClass =
    statusStyles[statusLabel] ??
    "border border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300";

  const summary = thread?.summary ?? null;
  const isThreadLocked = thread?.status !== "open";
  const isFirstPage = page === 1;
  const firstPost = isFirstPage && posts.length ? posts[0] : null;
  const currentUserId = user?.id ?? null;
  const userRoles = user?.roles ?? [];
  const canDeleteThread =
    thread && currentUserId
      ? thread.authorId === currentUserId || userRoles.includes("admin") || userRoles.includes("moderator")
      : false;

  const repliesByParent = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const post of posts) {
      if (!post.parentPostId) continue;
      const list = map.get(post.parentPostId) ?? [];
      list.push(post);
      map.set(post.parentPostId, list);
    }
    return map;
  }, [posts]);

  const heroReplies = useMemo(
    () => (firstPost ? repliesByParent.get(firstPost.id) ?? [] : []),
    [firstPost, repliesByParent],
  );

  const topLevelPosts = useMemo(
    () => posts.filter((post) => !post.parentPostId && (!firstPost || post.id !== firstPost.id)),
    [posts, firstPost],
  );

  const hasReplies = heroReplies.length > 0 || topLevelPosts.length > 0;

  const handlePostReply = async () => {
    if (!thread || !body.trim()) {
      return;
    }
    setIsPosting(true);
    try {
      await createPost({ body: body.trim() });
      setBody("");
      toast.success("Reply posted.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to post reply right now."));
    } finally {
      setIsPosting(false);
    }
  };

  const handleInlineReply = useCallback(
    async (parentId: string, message: string) => {
      await createPost({ body: message, parentPostId: parentId });
    },
    [createPost],
  );

  const handleDeletePost = useCallback(
    async (postId: string) => {
      await deletePostMutation(postId);
      await mutate();
    },
    [deletePostMutation, mutate],
  );

  const handleDeleteThread = useCallback(async () => {
    if (!thread || isDeletingThread) {
      return;
    }
    const confirmed = window.confirm("Delete this entire thread? All posts will be removed permanently.");
    if (!confirmed) {
      return;
    }
    setIsDeletingThread(true);
    try {
      await deleteThreadMutation(thread.id);
      toast.success("Thread deleted.");
      router.replace("/threads");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete this thread right now."));
    } finally {
      setIsDeletingThread(false);
    }
  }, [deleteThreadMutation, isDeletingThread, router, thread]);

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
    <div className="min-h-full space-y-8 text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between">
        <Link
          href="/threads"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to threads
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-700"
          >
            <Sparkles className="mr-2 size-4 text-sky-400" />
            Request summary refresh
          </Button>
          <Button className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/30 hover:from-sky-400 hover:to-indigo-500">
            Join live reaction
          </Button>
            {canDeleteThread && (
              <Button
                variant="ghost"
                className="rounded-xl border border-red-200/60 bg-red-50 text-sm font-semibold text-red-600 hover:border-red-300 hover:bg-red-100 hover:text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-400 dark:hover:bg-red-500/20"
                onClick={handleDeleteThread}
                isLoading={isDeletingThread}
              >
                <Trash2 className="mr-2 size-4" />
                Delete thread
              </Button>
            )}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 dark:border-slate-800/70 dark:bg-slate-950/60 dark:text-slate-300">
          <Loader2 className="size-4 animate-spin text-sky-300" />
          Loading conversation…
        </div>
      )}

      {error && !(error instanceof ApiError && error.status === 404) && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-100 px-6 py-4 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-4" />
            <span>{error instanceof Error ? error.message : "Unable to load this thread right now."}</span>
          </div>
          <Button variant="ghost" size="sm" className="text-red-700 hover:text-red-800 dark:text-red-200 dark:hover:text-red-100" onClick={() => mutate()}>
            Retry
          </Button>
        </div>
      )}

      {thread && (
        <>
          <Card className="border border-slate-200 bg-white shadow-lg shadow-slate-200/40 dark:border-slate-800/70 dark:bg-slate-950/70">
            <div className="space-y-6 p-6">
              <header className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <span className={cn("rounded-xl px-3 py-1 text-xs font-semibold shadow-inner", statusClass)}>{statusLabel}</span>
                  <span>Started {formatRelativeTime(thread.createdAt)}</span>
                  <span>Updated {formatRelativeTime(thread.updatedAt)}</span>
                  <span>{thread.participantsCount} participants</span>
                </div>
                <h1 className="text-3xl font-semibold text-slate-900 dark:text-white lg:text-4xl">{thread.title}</h1>
              </header>

              {firstPost && (
                <section className="space-y-4">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-slate-700 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-200">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <span>{formatAuthorLabel(firstPost.authorId)}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(firstPost.createdAt)}</span>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-base leading-7">{firstPost.body}</p>
                  </div>

                  {heroReplies.length > 0 && (
                    <div className="space-y-4">
                      {heroReplies.map((reply) => (
                        <PostItem
                          key={reply.id}
                          post={reply}
                          depth={1}
                          repliesMap={repliesByParent}
                          onReply={handleInlineReply}
                          onDelete={handleDeletePost}
                          currentUserId={currentUserId}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              <SummarySection summary={summary} />

              {!!thread.tags?.length && (
                <div className="flex flex-wrap gap-2">
                  {thread.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <section className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-400">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300">Stats</h2>
                <dl className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <dt>Posts</dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-200">{thread.postsCount}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Participants</dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-200">{thread.participantsCount}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Last activity</dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-200">{formatRelativeTime(thread.lastActivityAt)}</dd>
                  </div>
                </dl>
              </section>
            </div>
          </Card>

          <div className="space-y-4">
            {isValidating && !isLoading && (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-500 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-300">
                <Loader2 className="size-3 animate-spin text-sky-300" />
                Syncing latest replies…
              </div>
            )}

            {topLevelPosts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                repliesMap={repliesByParent}
                onReply={handleInlineReply}
                onDelete={handleDeletePost}
                currentUserId={currentUserId}
              />
            ))}

            {!hasReplies && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-400">
                No replies yet. Be the first to share a reflection.
              </div>
            )}

            {pagination && posts.length > 0 && (
              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800/70 dark:text-slate-400">
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
                    className="rounded-lg border border-slate-200 bg-white text-xs uppercase tracking-[0.2em] text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700"
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
                    className="rounded-lg border border-slate-200 bg-white text-xs uppercase tracking-[0.2em] text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-inner shadow-slate-200/70 transition dark:border-slate-800/70 dark:bg-slate-950/70 dark:shadow-slate-900/70">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Continue the warmth</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Your reply publishes instantly and syncs across all circles.
                </p>
              </div>
              {isThreadLocked && (
                <div className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200">
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
              className="border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-200 dark:placeholder:text-slate-500"
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

