"use client";

import { Bell, CheckCheck, Filter, MessageCircle, Share2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoNotifications } from "@/data/demo";
import { cn } from "@/lib/utils";

const typeDecor = {
  mention: { icon: MessageCircle, label: "Mention", accent: "from-sky-500 to-indigo-500" },
  moderation: { icon: Filter, label: "Moderation", accent: "from-amber-500 to-orange-500" },
  system: { icon: Share2, label: "System", accent: "from-slate-500 to-slate-700" },
  insight: { icon: Sparkles, label: "Insight", accent: "from-emerald-500 to-teal-500" },
};

export default function NotificationsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2rem] text-slate-400">Notifications</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Every signal, all in one warm feed.</h1>
          <p className="max-w-2xl text-sm text-slate-400">
            Mentions, moderation moments, and AI insights are collected here so nothing meaningful slips away.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="rounded-xl border border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700">
            <Filter className="mr-2 size-4" />
            Filters
          </Button>
          <Button className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/30 hover:from-sky-400 hover:to-indigo-500">
            <CheckCheck className="mr-2 size-4" />
            Mark all read
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70">
        <div className="flex flex-col gap-3 border-b border-slate-800/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-slate-200 shadow-inner shadow-slate-900/80">
              <Input placeholder="Search notifications…" className="border-none bg-transparent p-0 text-sm focus-visible:ring-0" />
              <Bell className="size-4 text-slate-500" />
            </div>
            <div className="hidden gap-2 text-xs text-slate-500 sm:flex">
              <span className="rounded-lg border border-slate-800/70 px-3 py-1 uppercase tracking-widest">All</span>
              <span className="rounded-lg border border-slate-800/60 px-3 py-1 uppercase tracking-widest text-slate-400">Unread</span>
              <span className="rounded-lg border border-slate-800/60 px-3 py-1 uppercase tracking-widest text-slate-400">Mentions</span>
            </div>
          </div>
          <Button variant="ghost" className="rounded-xl border border-slate-800/70 bg-slate-900/70 text-slate-300 hover:border-slate-700 sm:text-sm">
            Export timeline
          </Button>
        </div>

        <div className="divide-y divide-slate-800/60">
          {demoNotifications.map((notification) => {
            const decor = typeDecor[notification.type];
            const Icon = decor.icon;

            return (
              <div
                key={notification.id}
                className={cn(
                  "flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-900/60",
                  notification.isNew && "bg-slate-900/60",
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg shadow-slate-900/70",
                      `from-slate-700 to-slate-900`,
                      notification.isNew && decor.accent,
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">{notification.title}</span>
                      <span className="text-xs text-slate-500">{notification.timestamp}</span>
                      <span className="rounded-lg border border-slate-800/70 bg-slate-900/70 px-2 py-1 text-[10px] uppercase tracking-widest text-slate-400">
                        {decor.label}
                      </span>
                      {notification.isNew && (
                        <span className="rounded-lg bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-300">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300">{notification.description}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" size="sm" className="rounded-lg border border-slate-800/70 bg-slate-900/70 text-xs text-slate-300 hover:border-slate-700">
                      View context
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-lg text-xs text-slate-500 hover:text-white">
                      Mark read
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


