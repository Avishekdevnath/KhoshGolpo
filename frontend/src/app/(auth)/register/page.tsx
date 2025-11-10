import Link from "next/link";
import { ArrowUpRight, Sparkles, Users } from "lucide-react";

import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    title: "Craft your presence",
    body: "Pick a handle and profile that follows you into every warmth ritual.",
  },
  {
    title: "Meet your circles",
    body: "Step into moderated rooms with empathy prompts ready to guide tone.",
  },
  {
    title: "Stay in sync",
    body: "Realtime threads, mentions, and dashboards keep the team aligned across time zones.",
  },
];

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 rounded-[32px] border border-slate-800/60 bg-slate-950/75 p-6 shadow-[0_45px_160px_-90px_rgba(59,130,246,0.7)] backdrop-blur-xl sm:p-10 lg:flex-row lg:items-center lg:gap-14 lg:p-14">
      <div className="flex-1 space-y-8 text-center text-slate-100 lg:text-left">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-100">
          <Sparkles className="size-4" />
          Create workspace
        </span>

        <div className="space-y-4">
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Open your own KhoshGolpo studio.</h1>
          <p className="text-pretty text-sm leading-7 text-slate-400 sm:text-base">
            Shape a profile that feels like you, invite collaborators, and unlock the moderation toolkit that keeps every room warm and grounded.
          </p>
        </div>

        <div className="grid gap-4 text-left text-xs uppercase tracking-[0.2em] text-slate-400 sm:grid-cols-2">
          {highlights.map((item) => (
            <div key={item.title} className="space-y-2 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
              <p className="text-[0.72rem] font-semibold text-slate-200">{item.title}</p>
              <p className="text-[0.68rem] normal-case tracking-normal text-slate-500">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-400 lg:justify-start">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-full border border-slate-800/70 px-4 py-2 transition hover:border-slate-700 hover:text-white"
          >
            Read onboarding guide
            <ArrowUpRight className="size-4" />
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-emerald-200">
            <Users className="size-4" />
            Invite teammates after sign-up
          </div>
        </div>
      </div>

      <Card className="relative w-full max-w-md overflow-hidden border border-slate-800/70 bg-slate-950/85 px-8 py-10 text-left shadow-[0_45px_160px_-85px_rgba(99,102,241,0.6)] transition-all duration-300 hover:border-sky-400/40 hover:shadow-[0_50px_190px_-90px_rgba(79,70,229,0.55)]">
        <div className="pointer-events-none absolute inset-0 rounded-3xl border border-sky-500/20" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />

        <CardHeader className="space-y-4 px-0">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-sky-500 text-sm font-bold text-white shadow-lg shadow-sky-500/30">
              KG
            </span>
            <div>
              <CardTitle className="text-xl font-semibold text-white">Let’s get you set up</CardTitle>
              <CardDescription className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Community onboarding
              </CardDescription>
            </div>
          </div>
          <p className="text-sm text-slate-400">
            Choose your handle, share a display name, and you’ll step straight into moderated threads with realtime insights.
          </p>
        </CardHeader>

        <CardContent className="space-y-6 px-0">
          <RegisterForm />
        </CardContent>

        <CardFooter className="px-0">
          <p className="w-full text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-white transition hover:text-sky-200">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

