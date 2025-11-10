"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Filter, Flame, MessageCircle, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoThreads } from "@/data/demo";
import { cn } from "@/lib/utils";

const sentimentStyles: Record<string, string> = {
  celebration: "bg-emerald-500/10 text-emerald-300 border border-emerald-400/30",
  insight: "bg-sky-500/10 text-sky-300 border border-sky-400/30",
  caution: "bg-amber-500/10 text-amber-300 border border-amber-400/30",
  growth: "bg-violet-500/10 text-violet-300 border border-violet-400/30",
};

export default function ThreadsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => ["all", ...new Set(demoThreads.map((thread) => thread.category))], []);

  const filteredThreads = useMemo(() => {
    return demoThreads.filter((thread) => {
      const matchesSearch =
        thread.title.toLowerCase().includes(search.toLowerCase()) ||
        thread.summary.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || thread.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2rem] text-slate-400">Threads</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Rooms alive with warmth.</h1>
          <p className="max-w-2xl text-sm text-slate-400">
            Join in-progress celebrations, moderation touchpoints, and empathy labs keeping conversations grounded.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="rounded-xl border border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700">
            <Sparkles className="mr-2 size-4" />
            Summarize this space
          </Button>
          <Button className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/30 hover:from-sky-400 hover:to-indigo-500">
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
                placeholder="Search for stories, names, or keywords"
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
            {categories.map((name) => {
              const isActive = name === category;
              return (
                <button
                  key={name}
                  onClick={() => setCategory(name)}
                  className={cn(
                    "rounded-xl border px-3 py-1 text-xs uppercase tracking-wide transition",
                    isActive
                      ? "border-sky-500/60 bg-sky-500/10 text-sky-200"
                      : "border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-slate-200",
                  )}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 px-6 pt-6">
          {filteredThreads.length === 0 && (
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 px-6 py-10 text-center text-sm text-slate-400">
              Nothing matches yet. Try another keyword or start the conversation yourself.
            </div>
          )}

          {filteredThreads.map((thread) => (
            <Link key={thread.id} href={`/threads/${thread.id}`} className="block">
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 transition hover:border-slate-700 hover:bg-slate-900/80">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                      <span>{thread.category}</span>
                      <span className="text-slate-700">•</span>
                      <span>{thread.createdAt}</span>
                    </div>
                    <h2 className="text-lg font-semibold text-white">{thread.title}</h2>
                    <p className="max-w-3xl text-sm text-slate-400">{thread.summary}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{thread.author}</span>
                      <span>•</span>
                      <span>{thread.authorRole}</span>
                      <span>•</span>
                      <span>{thread.replies} replies</span>
                      <span>•</span>
                      <span>{thread.views} views</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {thread.tags.map((tag) => (
                        <span key={tag} className="rounded-lg border border-slate-800 bg-slate-900/60 px-2 py-1 text-xs text-slate-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        "rounded-xl px-3 py-1 text-xs font-medium shadow-inner",
                        sentimentStyles[thread.sentiment] ?? "border border-slate-800/80 text-slate-300",
                      )}
                    >
                      {thread.sentiment === "celebration" && "✨ Celebration"}
                      {thread.sentiment === "insight" && "💡 Insight"}
                      {thread.sentiment === "caution" && "⚠️ Pause"}
                      {thread.sentiment === "growth" && "🌱 Growth"}
                    </span>
                    <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-3 text-center text-xs text-slate-400">
                      <MessageCircle className="mb-2 size-5 text-slate-300" />
                      <div className="font-semibold text-white">{thread.replies}</div>
                      replies
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

