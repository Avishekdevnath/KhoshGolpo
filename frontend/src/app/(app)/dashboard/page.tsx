"use client";

import { useMemo } from "react";
import { Activity, ArrowUpRight, MessageCircle, TrendingUp, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { demoThreads, demoUser } from "@/data/demo";

const activityData = [
  { name: "Mon", posts: 120, replies: 80 },
  { name: "Tue", posts: 150, replies: 95 },
  { name: "Wed", posts: 180, replies: 110 },
  { name: "Thu", posts: 140, replies: 85 },
  { name: "Fri", posts: 200, replies: 130 },
  { name: "Sat", posts: 220, replies: 150 },
  { name: "Sun", posts: 190, replies: 120 },
];

const categoryData = [
  { name: "Celebrations", value: 45, color: "#38bdf8" },
  { name: "Moderation", value: 30, color: "#a855f7" },
  { name: "Programs", value: 15, color: "#ec4899" },
  { name: "Experiments", value: 10, color: "#22d3ee" },
];

export default function DashboardPage() {
  const trendingThreads = useMemo(() => demoThreads.filter((thread) => thread.trending).slice(0, 3), []);

  return (
    <div className="space-y-8 text-slate-700 transition-colors dark:text-slate-200">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2rem] text-slate-500 dark:text-slate-400">Dashboard</p>
          <h1 className="text-3xl font-semibold text-slate-900 transition-colors dark:text-white sm:text-4xl">
            Welcome back, {demoUser.name.split(" ")[0]}.
          </h1>
          <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Here’s what’s keeping the warmth alive: trending celebrations, moderation touchpoints, and the momentum of your
            facilitators across timezones.
          </p>
        </div>
        <Button className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-500">
          Download warmth report
          <ArrowUpRight className="size-4" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <MessageCircle className="size-4 text-sky-400" />
              Threads alive this week
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold text-slate-900 dark:text-white">148</p>
            <p className="text-xs text-emerald-500 dark:text-emerald-300">+12 since last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Users className="size-4 text-rose-400" />
              Facilitators checking in
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold text-slate-900 dark:text-white">36</p>
            <p className="text-xs text-rose-500 dark:text-rose-300">6 on mentor duty tonight</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <TrendingUp className="size-4 text-violet-400" />
              Warmth index
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold text-slate-900 dark:text-white">84%</p>
            <p className="text-xs text-violet-500 dark:text-violet-300">Tone stability up 4%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Activity className="size-4 text-amber-400" />
              Moderation touchpoints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold text-slate-900 dark:text-white">12</p>
            <p className="text-xs text-amber-500 dark:text-amber-300">All actioned within 2 hours</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-900 dark:text-white">Conversation pulse</CardTitle>
            <CardDescription>
              Post vs reply volume. Peaks show storyteller circles and empathy labs kicking in.
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
                <Bar dataKey="posts" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                <Bar dataKey="replies" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-900 dark:text-white">Story themes</CardTitle>
            <CardDescription>
              What threads community voices are celebrating this week.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={80} paddingAngle={3}>
                    {categoryData.map((entry) => (
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
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {categoryData.map((category) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 dark:border-slate-800/80 dark:bg-slate-900/70"
                >
                  <span className="text-slate-700 dark:text-slate-200">{category.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">{category.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-900 dark:text-white">Trending celebrations</CardTitle>
            <CardDescription>
              Highlights to amplify in next week’s storytelling roundups.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {trendingThreads.map((thread) => (
              <div
                key={thread.id}
                className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 transition hover:border-slate-300 dark:border-slate-800/70 dark:bg-slate-900/80 dark:hover:border-slate-700"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{thread.title}</p>
                  <span className="rounded-lg bg-slate-200 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {thread.category}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{thread.summary}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                  <span>{thread.replies} replies</span>
                  <span>•</span>
                  <span>{thread.views} views</span>
                  <span>•</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {thread.sentiment === "celebration" ? "✨ Celebration" : "Insight"}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-900 dark:text-white">Facilitator heartbeat</CardTitle>
            <CardDescription>
              Quick view of who’s guiding conversations with warmth right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800/70 dark:bg-slate-900/80">
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>Mentor circles</span>
                <span>Live in 4 rooms</span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-2 w-4/5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500" />
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Warmth prompts triggered x18 in the last hour.</p>
            </div>

            <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-900/80">
                <span>Empathy labs</span>
                <span className="text-emerald-500 dark:text-emerald-300">+22% retention</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-900/80">
                <span>Storyteller showcases</span>
                <span className="text-sky-500 dark:text-sky-300">5 features queued</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-900/80">
                <span>Late-night support</span>
                <span className="text-amber-500 dark:text-amber-300">3 mentors on standby</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


