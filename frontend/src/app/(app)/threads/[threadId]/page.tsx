"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Flame, Heart, MessageCircle, Reply, Share2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { demoThreads } from "@/data/demo";
import { cn } from "@/lib/utils";

const sentimentDecor = {
  positive: {
    label: "Warm",
    className:
      "border border-emerald-400/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 dark:border-emerald-400/30",
  },
  neutral: {
    label: "Steady",
    className:
      "border border-slate-300/60 bg-slate-200/60 text-slate-700 dark:border-slate-600/60 dark:bg-slate-800/70 dark:text-slate-300",
  },
  warning: {
    label: "Check tone",
    className:
      "border border-amber-400/50 bg-amber-500/10 text-amber-600 dark:border-amber-400/40 dark:text-amber-300",
  },
} as const;

const threadSentiment = {
  celebration: {
    label: "Celebration",
    icon: "✨",
    className:
      "border border-emerald-400/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 dark:border-emerald-400/30",
  },
  insight: {
    label: "Insight",
    icon: "💡",
    className:
      "border border-sky-400/40 bg-sky-500/10 text-sky-600 dark:text-sky-300 dark:border-sky-400/30",
  },
  caution: {
    label: "Pause",
    icon: "⚠️",
    className:
      "border border-amber-400/40 bg-amber-500/10 text-amber-600 dark:text-amber-300 dark:border-amber-400/30",
  },
  growth: {
    label: "Growth",
    icon: "🌱",
    className:
      "border border-violet-400/40 bg-violet-500/10 text-violet-600 dark:text-violet-300 dark:border-violet-400/30",
  },
} as const;

function SummarySection({ summary }: { summary: string | undefined }) {
  if (!summary) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200/70 bg-white/70 p-6 text-sm text-slate-500 dark:border-slate-800/70 dark:bg-slate-900/50 dark:text-slate-400">
        <Sparkles className="mb-3 size-5 text-slate-400" />
        We are weaving a warmth summary for this conversation. Check back soon or surface key highlights manually.
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
  author,
  role,
  avatarColor,
  timestamp,
  body,
  sentiment,
}: {
  author: string;
  role: string;
  avatarColor: string;
  timestamp: string;
  body: string;
  sentiment?: "positive" | "neutral" | "warning";
}) {
  const decor = sentiment ? sentimentDecor[sentiment] : null;

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-slate-700 transition hover:border-slate-300 dark:border-slate-800/60 dark:bg-slate-950/70 dark:text-slate-200 hover:dark:border-slate-700/80">
      <div className="flex items-start gap-4">
        <div className={cn("mt-1 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg", avatarColor)}>
          {author
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-start gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{author}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{role}</p>
            </div>
            {decor && (
              <span className={cn("rounded-lg px-2.5 py-1 text-xs font-medium shadow-inner", decor.className)}>{decor.label}</span>
            )}
            <span className="ml-auto text-xs text-slate-500 dark:text-slate-500">{timestamp}</span>
          </div>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-200">{body}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-500">
            <button className="inline-flex items-center transition hover:text-emerald-500 dark:hover:text-emerald-300" aria-label="Appreciate">
              <Heart className="size-4" />
            </button>
            <button className="inline-flex items-center transition hover:text-sky-500 dark:hover:text-sky-300" aria-label="Reply inline">
              <Reply className="size-4" />
            </button>
            <button className="inline-flex items-center transition hover:text-slate-700 dark:hover:text-slate-300" aria-label="Share">
              <Share2 className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThreadDetailPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = use(params);

  const thread =
    demoThreads.find((item) => item.id === threadId) ?? demoThreads.find((item) => item.id.toLowerCase() === threadId.toLowerCase()) ?? demoThreads[0];

  if (!thread) {
    notFound();
  }

  const sentiment = threadSentiment[thread.sentiment];

  return (
    <div className="space-y-8 text-slate-700 transition-colors dark:text-slate-200">
      <div className="flex items-center justify-between">
        <Link
          href="/threads"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to threads
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="rounded-xl border border-slate-200/70 bg-white/80 text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-700"
          >
            <Flame className="mr-2 size-4 text-amber-500 dark:text-amber-400" />
            Highlight story
          </Button>
          <Button className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/30 hover:from-sky-400 hover:to-indigo-500">
            Join live reaction
          </Button>
        </div>
      </div>

      <Card className="p-0">
        <div className="space-y-6 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-500">
                <span>{thread.category}</span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span>{thread.createdAt}</span>
              </div>
              <h1 className="text-3xl font-semibold text-slate-900 transition-colors dark:text-white lg:text-4xl">{thread.title}</h1>
              <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">{thread.summary}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-500">
                <span>{thread.author}</span>
                <span>•</span>
                <span>{thread.authorRole}</span>
                <span>•</span>
                <span>{thread.replies} replies</span>
                <span>•</span>
                <span>{thread.views} views</span>
                <span>•</span>
                <span>Warmth prompts active</span>
              </div>
            </div>
            {sentiment && (
              <span className={cn("rounded-2xl px-4 py-2 text-sm font-medium shadow-inner", sentiment.className)}>
                <span className="mr-2">{sentiment.icon}</span>
                {sentiment.label}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {thread.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-1 text-xs text-slate-500 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>

          <SummarySection summary={thread.summary} />
        </div>
      </Card>

      <div className="space-y-4">
        {thread.posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-inner shadow-slate-200/70 transition dark:border-slate-800/70 dark:bg-slate-950/70 dark:shadow-slate-900/70">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Continue the warmth</p>
            <p className="text-xs text-slate-500 dark:text-slate-500">Your reply goes live instantly and syncs across all circles.</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Mention someone"
              className="w-40 border-slate-200/70 bg-white/80 text-xs text-slate-600 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-200"
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
            >
              <Sparkles className="size-4" />
            </Button>
          </div>
        </div>
        <Textarea
          rows={4}
          placeholder="Share a story, reflection, or question…"
          className="border-slate-200/70 bg-white/80 text-slate-700 placeholder:text-slate-400 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-200 dark:placeholder:text-slate-500"
        />
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="size-4" />
              Realtime enabled
            </span>
            <span className="inline-flex items-center gap-1">
              <Sparkles className="size-4" />
              Empathy prompts on
            </span>
          </div>
          <Button className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-500">
            Post reply
          </Button>
        </div>
      </div>
    </div>
  );
}


