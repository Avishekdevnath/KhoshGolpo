"use client";

import { AlertTriangle, Download, Filter, Lock, MonitorSmartphone, Search, Shield, Signal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoSecurityEvents } from "@/data/demo";
import { cn } from "@/lib/utils";

const severityDecor = {
  low: "bg-emerald-500/10 text-emerald-300 border border-emerald-400/40",
  medium: "bg-amber-500/10 text-amber-300 border border-amber-400/40",
  high: "bg-rose-500/10 text-rose-300 border border-rose-400/40",
};

const statusDecor = {
  monitoring: "bg-sky-500/10 text-sky-300 border border-sky-400/40",
  investigating: "bg-amber-500/10 text-amber-300 border border-amber-400/40",
  resolved: "bg-emerald-500/10 text-emerald-300 border border-emerald-400/40",
};

export default function SecurityPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2rem] text-slate-400">Safety command</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Keep conversations safe, quietly.</h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Monitor login events, API usage, and anomalies with a calm, human-first response plan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="rounded-xl border border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700">
            <MonitorSmartphone className="mr-2 size-4" />
            Session watcher
          </Button>
          <Button className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-500">
            Trigger rotation
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70">
        <div className="flex flex-col gap-3 border-b border-slate-800/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-slate-200 shadow-inner shadow-slate-900/80">
              <Search className="size-4 text-slate-500" />
              <Input placeholder="Search security events…" className="border-none bg-transparent p-0 text-sm focus-visible:ring-0" />
            </div>
            <div className="hidden gap-2 text-xs text-slate-500 sm:flex">
              <span className="rounded-lg border border-slate-800/60 px-3 py-1 uppercase tracking-widest">All</span>
              <span className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 uppercase tracking-widest text-emerald-200">
                Resolved
              </span>
              <span className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1 uppercase tracking-widest text-amber-200">
                Investigating
              </span>
              <span className="rounded-lg border border-rose-400/40 bg-rose-400/10 px-3 py-1 uppercase tracking-widest text-rose-200">
                Critical
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="rounded-xl border border-slate-800/70 bg-slate-900/70 text-slate-300 hover:border-slate-700">
              <Filter className="mr-2 size-4" />
              Filters
            </Button>
            <Button variant="ghost" className="rounded-xl border border-slate-800/70 bg-slate-900/70 text-slate-300 hover:border-slate-700">
              <Download className="mr-2 size-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {demoSecurityEvents.map((event) => (
            <div key={event.id} className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-900/60">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-white">{event.title}</span>
                  <span className="text-xs text-slate-500">{event.detectedAt}</span>
                  <span className={cn("rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-widest", severityDecor[event.severity])}>
                    {event.severity} severity
                  </span>
                  <span className={cn("rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-widest", statusDecor[event.status])}>
                    {event.status}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{event.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <Button variant="ghost" size="sm" className="rounded-lg border border-slate-800/70 bg-slate-900/70 text-xs text-slate-300 hover:border-slate-700">
                  <Shield className="mr-2 size-4" />
                  View details
                </Button>
                <Button variant="ghost" size="sm" className="rounded-lg text-xs text-emerald-300 hover:text-emerald-200">
                  <Lock className="mr-2 size-4" />
                  Escalate
                </Button>
                <Button variant="ghost" size="sm" className="rounded-lg text-xs text-amber-300 hover:text-amber-200">
                  <AlertTriangle className="mr-2 size-4" />
                  Set watch
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Rate-limit radar</p>
            <p className="text-xs text-slate-400">Which endpoints, IPs, or teams need a check-in.</p>
          </div>
          <Button variant="ghost" className="rounded-xl border border-slate-800/70 bg-slate-900/70 text-slate-300 hover:border-slate-700">
            Download chart
          </Button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Endpoints tapped", value: "38", sub: "Last 60 minutes" },
            { label: "IPs throttled", value: "4", sub: "Containment active" },
            { label: "User alerts", value: "7", sub: "Pending review" },
            { label: "Emerging patterns", value: "3", sub: "Watchlist updated" },
          ].map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-slate-800/70 bg-slate-950/70 px-4 py-5 shadow-inner shadow-slate-900/60">
              <p className="text-2xl font-semibold text-white">{metric.value}</p>
              <p className="mt-2 text-xs uppercase tracking-widest text-slate-400">{metric.label}</p>
              <p className="mt-3 text-xs text-slate-500">{metric.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Response playbook updates</p>
            <p className="text-xs text-slate-400">Keep the team aligned on remediation rituals.</p>
          </div>
          <Button variant="ghost" className="rounded-xl border border-slate-800/70 bg-slate-900/70 text-slate-300 hover:border-slate-700">
            Publish update
          </Button>
        </div>
        <div className="mt-6 grid gap-4 text-sm text-slate-300 md:grid-cols-2">
          {["Compromised device workflow", "Token rotation cadence", "Login anomaly triage", "Incident retro template"].map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
              <Signal className="mt-1 size-4 text-sky-300" />
              <div>
                <p className="font-semibold text-white">{item}</p>
                <p className="text-xs text-slate-400">Last refreshed 3 days ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


