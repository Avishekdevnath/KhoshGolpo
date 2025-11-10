"use client";

import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";

import { useHomePageContext } from "@/components/home/home-context";

export function HeroSection() {
  const { metrics } = useHomePageContext();

  return (
    <section className="border-b border-slate-800/60 bg-gradient-to-b from-slate-950 via-slate-950 to-blue-950/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div className="space-y-8 lg:flex-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-900/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            <Sparkles className="size-4 text-emerald-300" />
            Conversations with warmth
          </span>
          <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Your community’s warmth, scaled with care—not chaos.
          </h1>
          <p className="max-w-2xl text-pretty text-sm leading-7 text-slate-400 sm:text-base">
            KhoshGolpo couples nuance-aware AI with human playbooks so every thread, escalation, and celebration feels seen. From
            late-night empathy labs to Monday stand-ups, signals stay warm, precise, and actionable.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-400 hover:to-teal-500 sm:inline-flex sm:items-center sm:justify-center"
            >
              Start a warm trial
            </Link>
            <Link
              href="/auth/login"
              className="rounded-2xl border border-slate-800/70 bg-slate-900/70 px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:border-slate-700 hover:text-white sm:inline-flex sm:items-center sm:justify-center"
            >
              Peek inside
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-slate-400">
            <Link
              href="/about"
              className="rounded-full border border-slate-800/70 px-4 py-2 text-center transition hover:border-slate-700 hover:text-white"
            >
              About
            </Link>
            <Link
              href="/features"
              className="rounded-full border border-slate-800/70 px-4 py-2 text-center transition hover:border-slate-700 hover:text-white"
            >
              Features
            </Link>
            <Link
              href="/docs"
              className="rounded-full border border-slate-800/70 px-4 py-2 text-center transition hover:border-slate-700 hover:text-white"
            >
              Docs
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-slate-800/70 px-4 py-2 text-center transition hover:border-slate-700 hover:text-white"
            >
              Contact
            </Link>
          </div>
        </div>

        <div className="flex-1">
          <div className="rounded-3xl border border-slate-800/60 bg-slate-950/60 p-6 shadow-[0_30px_120px_-40px_rgba(56,189,248,0.6)]">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
              <span>Live warmth board</span>
              <span className="inline-flex items-center gap-2 text-emerald-300">
                <Heart className="size-4" />
                18 celebrations
              </span>
            </div>
            <div className="mt-8 grid gap-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-slate-900/70 px-4 py-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
                    <p className="text-[11px] text-slate-500">{metric.detail}</p>
                  </div>
                  <p className="text-3xl font-semibold text-white">{metric.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 to-sky-500/20 px-4 py-4 text-sm text-emerald-100">
              <p className="font-semibold">“Our facilitators react in minutes, not hours.”</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-emerald-200">— Community Ops, Dhaka hub</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


