"use client";

import { Filter, Search, ShieldCheck, UserCheck, UserMinus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoTeamMembers } from "@/data/demo";
import { cn } from "@/lib/utils";

const statusDecor = {
  active: "bg-emerald-500/10 text-emerald-300 border border-emerald-400/40",
  away: "bg-amber-500/10 text-amber-300 border border-amber-400/40",
  offline: "bg-slate-700/60 text-slate-300 border border-slate-600/60",
};

export default function UsersAdminPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2rem] text-slate-400">Moderator roster</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Match roles to warmth, instantly.</h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Manage facilitators, moderators, and safety leads with quick role updates and presence insights.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="rounded-xl border border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700">
            <Filter className="mr-2 size-4" />
            Filters
          </Button>
          <Button className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/30 hover:from-sky-400 hover:to-indigo-500">
            Invite moderator
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70">
        <div className="flex flex-col gap-3 border-b border-slate-800/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-slate-200 shadow-inner shadow-slate-900/80">
              <Search className="size-4 text-slate-500" />
              <Input placeholder="Search teammates…" className="border-none bg-transparent p-0 text-sm focus-visible:ring-0" />
            </div>
            <div className="hidden gap-2 text-xs text-slate-500 sm:flex">
              <span className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 uppercase tracking-widest text-emerald-200">
                Moderators
              </span>
              <span className="rounded-lg border border-slate-800/60 px-3 py-1 uppercase tracking-widest">Hosts</span>
              <span className="rounded-lg border border-slate-800/60 px-3 py-1 uppercase tracking-widest">Safety</span>
            </div>
          </div>
          <Button variant="ghost" className="rounded-xl border border-slate-800/70 bg-slate-900/70 text-slate-300 hover:border-slate-700">
            Export roster
          </Button>
        </div>

        <div className="divide-y divide-slate-800/60">
          {demoTeamMembers.map((member) => (
            <div key={member.id} className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-900/60">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 text-lg font-semibold text-white shadow-lg shadow-slate-900/70">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">{member.name}</span>
                      <span className="text-xs text-slate-500">{member.region}</span>
                      <span className={cn("rounded-full px-3 py-1 text-xs text-slate-300", statusDecor[member.status])}>{member.status}</span>
                    </div>
                    <p className="text-xs uppercase tracking-widest text-slate-400">{member.role}</p>
                    <p className="text-xs text-slate-500">{member.contributions} contributions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="rounded-lg border border-slate-800/70 bg-slate-900/70 text-xs text-slate-300 hover:border-slate-700">
                    <ShieldCheck className="mr-2 size-4 text-emerald-300" />
                    Promote
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-lg text-xs text-emerald-300 hover:text-emerald-200">
                    <UserCheck className="mr-2 size-4" />
                    Assign circle
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-lg text-xs text-rose-300 hover:text-rose-200">
                    <UserMinus className="mr-2 size-4" />
                    Pause access
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


