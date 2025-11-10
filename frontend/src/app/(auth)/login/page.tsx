import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { LoginForm } from "@/components/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 rounded-[32px] border border-slate-800/60 bg-slate-950/70 p-6 shadow-[0_40px_150px_-80px_rgba(56,189,248,0.7)] backdrop-blur-xl sm:p-10 lg:flex-row lg:items-center lg:gap-12 lg:p-12">
      <div className="flex-1 space-y-6 text-center text-slate-100 lg:text-left">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
          <Sparkles className="size-4" />
          Team login
        </span>

        <div className="space-y-3">
          <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">
            Sign in to manage your KhoshGolpo workspace.
          </h1>
          <p className="text-pretty text-sm leading-7 text-slate-400 sm:text-base">
            Access thread updates, respond to team mentions, and keep community conversations moving forward.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-400 lg:justify-start">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 rounded-full border border-slate-800/70 px-4 py-2 transition hover:border-slate-700 hover:text-white"
          >
            Explore features
            <ArrowUpRight className="size-4" />
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-full border border-slate-800/70 px-4 py-2 transition hover:border-slate-700 hover:text-white"
          >
            Visit docs
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>

      <Card className="relative w-full max-w-md border border-slate-800/70 bg-slate-950/85 px-8 py-10 text-left shadow-[0_40px_140px_-90px_rgba(45,212,191,0.8)] transition-all duration-300 hover:border-emerald-400/40 hover:shadow-[0_45px_160px_-85px_rgba(16,185,129,0.6)]">
        <div className="pointer-events-none absolute inset-0 rounded-3xl border border-emerald-500/20" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

        <CardHeader className="space-y-4 px-0">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-sky-500/30">
              KG
            </span>
            <div>
              <CardTitle className="text-xl font-semibold text-white">Welcome back</CardTitle>
              <CardDescription className="text-xs uppercase tracking-[0.22em] text-slate-500">
                KhoshGolpo workspace
              </CardDescription>
            </div>
          </div>
          <p className="text-sm text-slate-400">
            Enter your credentials to reach the workspace, update thread status, and keep conversations healthy and safe.
          </p>
        </CardHeader>

        <CardContent className="px-0">
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}

