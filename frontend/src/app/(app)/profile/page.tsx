"use client";

import { Calendar, Check, Edit3, Flame, Globe, MapPin, Settings, ShieldCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { demoThreads, demoUser } from "@/data/demo";
import { cn } from "@/lib/utils";

const contributions = [
  { label: "Threads sparked", value: 42 },
  { label: "Stories amplified", value: 186 },
  { label: "Warm replies", value: 812 },
  { label: "Mentions received", value: 29 },
];

const recentHighlights = demoThreads.slice(0, 3);

export default function ProfilePage() {
  return (
    <div className="space-y-8 text-slate-700 transition-colors dark:text-slate-200">
      <div className="flex flex-col gap-6 lg:flex-row">
        <Card className="flex-1 p-0">
          <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl font-semibold text-white shadow-lg shadow-slate-200/50 dark:shadow-slate-900/70",
                    demoUser.avatarColor,
                  )}
                >
                  {demoUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{demoUser.name}</h1>
                    <span className="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-200">
                      Warmth moderator
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">@{demoUser.handle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="rounded-xl border border-slate-200/70 bg-white/80 text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-slate-800/80 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-700"
                >
                  <ShieldCheck className="mr-2 size-4 text-emerald-500 dark:text-emerald-300" />
                  Manage access
                </Button>
                <Button className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/30 hover:from-sky-400 hover:to-indigo-500">
                  <Edit3 className="mr-2 size-4" />
                  Edit profile
                </Button>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">{demoUser.bio}</p>

            <div className="grid gap-4 text-sm text-slate-500 dark:text-slate-400 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-slate-400" />
                {demoUser.location}
              </div>
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-slate-400" />
                Timezone: GMT+6
              </div>
              <div className="flex items-center gap-2">
                <Users className="size-4 text-slate-400" />
                Mentor circles every Thursday
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-slate-400" />
                Joined in March 2024
              </div>
            </div>
          </div>
        </Card>

        <Card className="w-full max-w-sm p-0">
          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Notification preferences</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Fine tune how you’re nudged when warmth needs a human touch.</p>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <label className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/80 px-3 py-3 dark:border-slate-800/70 dark:bg-slate-900/70">
                Email digests
                <span className="rounded-lg border border-emerald-400/50 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-600 dark:text-emerald-200">On</span>
              </label>
              <label className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/80 px-3 py-3 dark:border-slate-800/70 dark:bg-slate-900/70">
                Late-night escalations
                <span className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">Muted</span>
              </label>
              <label className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/80 px-3 py-3 dark:border-slate-800/70 dark:bg-slate-900/70">
                Empathy prompt recaps
                <span className="rounded-lg border border-emerald-400/50 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-600 dark:text-emerald-200">On</span>
              </label>
            </div>
            <Button
              variant="ghost"
              className="w-full rounded-xl border border-slate-200/70 bg-white/80 text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-slate-800/80 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-700"
            >
              <Settings className="mr-2 size-4" />
              Advanced settings
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-0">
          <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Stories amplified this week</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Celebrate highlights you’ve nurtured recently.</p>
              </div>
              <Button
                variant="ghost"
                className="rounded-xl border border-slate-200/70 bg-white/80 text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-700"
              >
                Export recap
              </Button>
            </div>
            <div className="space-y-4">
              {recentHighlights.map((thread) => (
                <div
                  key={thread.id}
                  className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-slate-600 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/60 dark:text-slate-300"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                      <span>{thread.category}</span>
                      <span>•</span>
                      <span>{thread.createdAt}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{thread.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{thread.summary}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-500">
                      <span>{thread.replies} replies</span>
                      <span>•</span>
                      <span>{thread.views} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Add a warmth note</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Capture a reflection about your community practice.</p>
            </div>
            <Textarea
              rows={5}
              placeholder="Keepers, moments, rituals..."
              className="border-slate-200/70 bg-white/80 text-slate-700 placeholder:text-slate-400 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
            <Button className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-500">
              Save note
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-0">
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {contributions.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200/70 bg-white/85 px-4 py-5 text-center shadow-inner shadow-slate-200/60 dark:border-slate-800/70 dark:bg-slate-950/70 dark:shadow-slate-900/60"
            >
              <p className="text-3xl font-semibold text-slate-900 dark:text-white">{item.value}</p>
              <p className="mt-2 text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-0">
        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Circle invitations</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Who’s asked you to bring warmth into their rooms.</p>
            </div>
            <Button
              variant="ghost"
              className="rounded-xl border border-slate-200/70 bg-white/80 text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-700"
            >
              <Flame className="mr-2 size-4 text-amber-500 dark:text-amber-400" />
              View all
            </Button>
          </div>
          <div className="grid gap-4 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
            {["Onboarding storytellers", "Late-night empathy lab", "Design feedback circle", "Safety reflection hour"].map((circle) => (
              <div
                key={circle}
                className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-inner shadow-slate-200/60 dark:border-slate-800/70 dark:bg-slate-950/70 dark:shadow-slate-900/60"
              >
                <Check className="mt-1 size-4 text-emerald-500 dark:text-emerald-300" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{circle}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Invited to host this week</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}


