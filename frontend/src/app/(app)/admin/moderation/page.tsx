"use client";

import { AlertTriangle, CheckCircle2, Filter, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoModerationQueue, demoThreads } from "@/data/demo";

export default function ModerationPage() {
  const flaggedThreads = demoThreads.filter((thread) => thread.status !== "approved");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2rem] text-slate-400">Moderation studio</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Balance tone, keep warmth thriving.</h1>
          <p className="max-w-3xl text-sm text-slate-400">
            AI highlights and community context land here first so you can respond with nuance, not burnout.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="rounded-xl border border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700">
            <Sparkles className="mr-2 size-4" />
            AI triage log
          </Button>
          <Button className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-500">
            Approve all safe
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70">
        <div className="flex flex-col gap-3 border-b border-slate-800/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-slate-200 shadow-inner shadow-slate-900/80">
              <Search className="size-4 text-slate-500" />
              <Input placeholder="Search flagged posts…" className="border-none bg-transparent p-0 text-sm focus-visible:ring-0" />
            </div>
            <div className="hidden gap-2 text-xs text-slate-500 sm:flex">
              <span className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 uppercase tracking-widest text-emerald-200">
                Pending
              </span>
              <span className="rounded-lg border border-slate-800/60 px-3 py-1 uppercase tracking-widest">Flagged</span>
              <span className="rounded-lg border border-slate-800/60 px-3 py-1 uppercase tracking-widest">Resolved</span>
            </div>
          </div>
          <Button variant="ghost" className="rounded-xl border border-slate-800/70 bg-slate-900/70 text-slate-300 hover:border-slate-700">
            <Filter className="mr-2 size-4" />
            Advanced filters
          </Button>
        </div>

        <div className="divide-y divide-slate-800/60">
          {demoModerationQueue.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-900/60">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {item.status === "pending" ? (
                    <AlertTriangle className="size-5 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="size-5 text-emerald-400" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-white">{item.author}</span>
                    <span className="text-xs text-slate-500">{item.flaggedAt}</span>
                    <span className="rounded-lg border border-slate-800/70 bg-slate-900/70 px-2 py-1 text-[10px] uppercase tracking-widest text-slate-400">
                      {item.reason}
                    </span>
                    <span className="rounded-lg border border-slate-800/70 bg-slate-900/70 px-2 py-1 text-[10px] uppercase tracking-widest text-slate-400">
                      Confidence {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">“{item.excerpt}”</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <Button variant="ghost" size="sm" className="rounded-lg border border-slate-800/70 bg-slate-900/70 text-xs text-slate-300 hover:border-slate-700">
                      View thread
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-lg text-xs text-emerald-300 hover:text-emerald-200">
                      Approve
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-lg text-xs text-amber-300 hover:text-amber-200">
                      Request rewrite
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-lg text-xs text-rose-300 hover:text-rose-200">
                      Escalate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70">
        <div className="flex items-center justify-between border-b border-slate-800/70 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-white">Threads awaiting review</p>
            <p className="text-xs text-slate-400">Threads that need a human decision before going live.</p>
          </div>
          <Button variant="ghost" className="rounded-xl border border-slate-800/70 bg-slate-900/70 text-slate-300 hover:border-slate-700">
            Download queue
          </Button>
        </div>
        <div className="divide-y divide-slate-800/60">
          {flaggedThreads.map((thread) => (
            <div key={thread.id} className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-900/60">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>{thread.category}</span>
                  <span className="text-slate-700">•</span>
                  <span>{thread.createdAt}</span>
                  <span className="rounded-lg border border-slate-800/70 bg-slate-900/70 px-2 py-1 text-[10px] uppercase tracking-widest text-amber-300">
                    {thread.status}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white">{thread.title}</p>
                <p className="text-xs text-slate-400">{thread.summary}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <Button variant="ghost" size="sm" className="rounded-lg border border-slate-800/70 bg-slate-900/70 text-xs text-slate-300 hover:border-slate-700">
                  Open detail
                </Button>
                <Button variant="ghost" size="sm" className="rounded-lg text-xs text-emerald-300 hover:text-emerald-200">
                  Approve
                </Button>
                <Button variant="ghost" size="sm" className="rounded-lg text-xs text-amber-300 hover:text-amber-200">
                  Hold
                </Button>
                <Button variant="ghost" size="sm" className="rounded-lg text-xs text-rose-300 hover:text-rose-200">
                  Lock thread
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Moderation health</p>
            <p className="text-xs text-slate-400">Track response times and share outcomes with the community.</p>
          </div>
          <Button variant="ghost" className="rounded-xl border border-slate-800/70 bg-slate-900/70 text-slate-300 hover:border-slate-700">
            Export metrics
          </Button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Avg response", value: "1h 42m", trend: "↓ faster by 12%" },
            { label: "Pending posts", value: "6", trend: "↓ down by 3" },
            { label: "Escalations", value: "2", trend: "↑ one overnight" },
            { label: "Community kudos", value: "18", trend: "↑ 4 this week" },
          ].map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-slate-800/70 bg-slate-950/70 px-4 py-5 shadow-inner shadow-slate-900/60">
              <p className="text-2xl font-semibold text-white">{metric.value}</p>
              <p className="mt-2 text-xs uppercase tracking-widest text-slate-400">{metric.label}</p>
              <p className="mt-3 text-xs text-emerald-300">{metric.trend}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


