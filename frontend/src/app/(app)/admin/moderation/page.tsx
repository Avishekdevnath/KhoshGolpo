"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useModerationMutations, useModerationPosts, useModerationThreads } from "@/lib/api/hooks/admin";
import type { ModerationPostItem, ModerationThreadItem } from "@/lib/api/admin/moderation";
import { formatRelativeTime } from "@/lib/utils/date";
import { useAuth } from "@/lib/auth/hooks";

const POSTS_PER_PAGE = 10;
const THREADS_PER_PAGE = 5;

export default function ModerationPage() {
  const { user } = useAuth();
  const [postState, setPostState] = useState<"pending" | "flagged">("pending");
  const [postPage, setPostPage] = useState(1);
  const [threadPage, setThreadPage] = useState(1);

  const postQuery = useMemo(
    () => ({
      page: postPage,
      limit: POSTS_PER_PAGE,
      state: postState,
    }),
    [postPage, postState],
  );

  const threadQuery = useMemo(
    () => ({
      page: threadPage,
      limit: THREADS_PER_PAGE,
      status: "open" as const,
    }),
    [threadPage],
  );

  const {
    data: postsData,
    isLoading: isLoadingPosts,
    error: postsError,
  } = useModerationPosts(postQuery, { revalidateOnFocus: false });

  const {
    data: threadsData,
    isLoading: isLoadingThreads,
    error: threadsError,
  } = useModerationThreads(threadQuery, { revalidateOnFocus: false });

  const { updatePost, updateThread } = useModerationMutations();

  if (user && !user.roles?.some((role) => role === "moderator" || role === "admin")) {
    return (
      <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 px-6 py-10 text-center text-sm text-amber-200">
        You need moderator access to view this area.
      </div>
    );
  }

  const moderationPosts = postsData?.data ?? [];
  const postPagination = postsData?.pagination;
  const moderationThreads = threadsData?.data ?? [];
  const threadPagination = threadsData?.pagination;

  const handleApprove = async (postId: string) => {
    try {
      await updatePost(postId, { moderationState: "approved" });
      toast.success("Post approved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to approve post.");
    }
  };

  const handleFlag = async (postId: string) => {
    try {
      await updatePost(postId, { moderationState: "flagged" });
      toast.success("Post flagged for review.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to flag post.");
    }
  };

  const handleLockThread = async (threadId: string) => {
    try {
      await updateThread(threadId, { status: "locked" });
      toast.success("Thread locked.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to lock thread.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2rem] text-slate-400">Moderation studio</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Balance tone, keep warmth thriving.</h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Review AI surfaced posts, confirm tone, and steady the room in a few focused taps.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className={cn(
              "rounded-xl border border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700",
              postState === "pending" && "border-emerald-500/50 bg-emerald-500/10 text-emerald-200",
            )}
            onClick={() => setPostState("pending")}
          >
            Pending posts
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "rounded-xl border border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700",
              postState === "flagged" && "border-amber-500/50 bg-amber-500/10 text-amber-200",
            )}
            onClick={() => setPostState("flagged")}
          >
            Flagged posts
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70">
        <div className="flex items-center justify-between border-b border-slate-800/70 px-6 py-4">
          <p className="text-sm font-semibold text-white">Post queue</p>
          <Button variant="ghost" className="rounded-xl border border-slate-800/70 bg-slate-900/70 text-slate-300 hover:border-slate-700">
            <Filter className="mr-2 size-4" />
            Filters
          </Button>
        </div>

        {isLoadingPosts && (
          <div className="flex items-center gap-3 px-6 py-4 text-sm text-slate-300">
            <Loader2 className="size-4 animate-spin text-sky-300" />
            Loading moderation queue…
          </div>
        )}

        {postsError && (
          <div className="px-6 py-4 text-sm text-rose-200">
            {postsError instanceof Error ? postsError.message : "Unable to load moderated posts."}
          </div>
        )}

        <div className="divide-y divide-slate-800/60">
          {moderationPosts.map((item: ModerationPostItem) => (
            <div key={item.post.id} className="flex flex-col gap-3 px-6 py-5 transition hover:bg-slate-900/60">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="text-sm font-semibold text-white">{item.author.displayName ?? item.author.handle}</span>
                <span>•</span>
                <span>{formatRelativeTime(item.post.createdAt)}</span>
                <span>•</span>
                <span>{item.thread.title}</span>
                <span className="rounded-lg border border-slate-800/70 bg-slate-900/70 px-2 py-1 text-[10px] uppercase tracking-widest text-slate-400">
                  {item.post.moderationState}
                </span>
              </div>
              <p className="text-sm text-slate-300 whitespace-pre-line">{item.post.body}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg border border-slate-800/70 bg-slate-900/70 text-xs text-emerald-300 hover:border-slate-700"
                  onClick={() => handleApprove(item.post.id)}
                >
                  <CheckCircle2 className="mr-2 size-3" />
                  Approve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-xs text-amber-300 hover:text-amber-200"
                  onClick={() => handleFlag(item.post.id)}
                >
                  <AlertTriangle className="mr-2 size-3" />
                  Flag
                </Button>
              </div>
            </div>
          ))}
        </div>

        {!moderationPosts.length && !isLoadingPosts && (
          <div className="px-6 py-10 text-center text-sm text-slate-400">Nothing in the queue right now.</div>
        )}

        {postPagination && moderationPosts.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-800/70 px-6 py-4 text-xs text-slate-400">
            <span>
              Showing {(postPagination.page - 1) * postPagination.limit + 1}
              &ndash;
              {Math.min(postPagination.page * postPagination.limit, postPagination.total)} of {postPagination.total}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPostPage((current) => Math.max(1, current - 1))}
                disabled={postPage <= 1}
                className="rounded-lg border border-slate-800/70 bg-slate-900/70 text-xs uppercase tracking-[0.2em] text-slate-300 hover:border-slate-700"
              >
                Previous
              </Button>
              <span className="uppercase tracking-[0.18em]">Page {postPage}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPostPage((current) => current + 1)}
                disabled={postPagination.page * postPagination.limit >= postPagination.total}
                className="rounded-lg border border-slate-800/70 bg-slate-900/70 text-xs uppercase tracking-[0.2em] text-slate-300 hover:border-slate-700"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70">
        <div className="flex items-center justify-between border-b border-slate-800/70 px-6 py-4">
          <p className="text-sm font-semibold text-white">Threads awaiting decision</p>
        </div>

        {isLoadingThreads && (
          <div className="flex items-center gap-3 px-6 py-4 text-sm text-slate-300">
            <Loader2 className="size-4 animate-spin text-sky-300" />
            Loading threads…
          </div>
        )}

        {threadsError && (
          <div className="px-6 py-4 text-sm text-rose-200">
            {threadsError instanceof Error ? threadsError.message : "Unable to load moderation threads."}
          </div>
        )}

        <div className="divide-y divide-slate-800/60">
          {moderationThreads.map((item: ModerationThreadItem) => (
            <div key={item.thread.id} className="flex flex-col gap-3 px-6 py-5 transition hover:bg-slate-900/60">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="text-sm font-semibold text-white">{item.thread.title}</span>
                <span>•</span>
                <span>{formatRelativeTime(item.thread.createdAt)}</span>
                <span className="rounded-lg border border-slate-800/70 bg-slate-900/70 px-2 py-1 text-[10px] uppercase tracking-widest text-amber-300">
                  {item.thread.status}
                </span>
              </div>
              <p className="text-sm text-slate-300">{item.thread.summary ?? "Awaiting summary."}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg border border-slate-800/70 bg-slate-900/70 text-xs text-emerald-300 hover:border-slate-700"
                  onClick={() => handleLockThread(item.thread.id)}
                >
                  Lock thread
                </Button>
              </div>
            </div>
          ))}
        </div>

        {!moderationThreads.length && !isLoadingThreads && (
          <div className="px-6 py-10 text-center text-sm text-slate-400">All threads are in good standing.</div>
        )}

        {threadPagination && moderationThreads.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-800/70 px-6 py-4 text-xs text-slate-400">
            <span>
              Showing {(threadPagination.page - 1) * threadPagination.limit + 1}
              &ndash;
              {Math.min(threadPagination.page * threadPagination.limit, threadPagination.total)} of {threadPagination.total}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setThreadPage((current) => Math.max(1, current - 1))}
                disabled={threadPage <= 1}
                className="rounded-lg border border-slate-800/70 bg-slate-900/70 text-xs uppercase tracking-[0.2em] text-slate-300 hover:border-slate-700"
              >
                Previous
              </Button>
              <span className="uppercase tracking-[0.18em]">Page {threadPage}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setThreadPage((current) => current + 1)}
                disabled={threadPagination.page * threadPagination.limit >= threadPagination.total}
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

