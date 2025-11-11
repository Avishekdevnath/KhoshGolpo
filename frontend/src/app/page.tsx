import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { Button } from "@/components/ui/button";

const featureHighlights = [
  {
    title: "Create threads instantly",
    description: "Spin up a new thread with a friendly prompt and keep every voice included.",
    href: "/threads",
    cta: "Go to threads",
  },
  {
    title: "Invite teammates with ease",
    description: "Onboard new members through a guided welcome flow that sets the tone for caring dialogue.",
    href: "/auth/register",
    cta: "Invite teammates",
  },
  {
    title: "Stay on top of replies",
    description: "Jump back into any conversation from your dashboard and respond in seconds.",
    href: "/dashboard",
    cta: "Open dashboard",
  },
];

const gettingStarted = [
  {
    step: "Sign up",
    headline: "Create your account",
    copy: "Register your team in minutes and set the tone with a custom greeting.",
    href: "/auth/register",
    cta: "Create account",
  },
  {
    step: "Log in",
    headline: "Add your teammates",
    copy: "Send invitations and keep everyone aligned inside a single shared space.",
    href: "/auth/login",
    cta: "Log in now",
  },
  {
    step: "Create",
    headline: "Start a warm thread",
    copy: "Launch your first community thread and watch the conversation grow.",
    href: "/threads",
    cta: "Start a thread",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-950/95 to-indigo-950 text-slate-100">
      <SiteNavbar />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-white/10 bg-slate-950/70 py-24 sm:py-28">
          <div className="absolute inset-y-0 -left-28 hidden w-80 rounded-full bg-indigo-600/25 blur-3xl sm:block" aria-hidden />
          <div className="absolute -top-48 right-0 hidden h-72 w-72 rounded-full bg-sky-500/20 blur-[110px] lg:block" aria-hidden />
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-slate-300">
                  Start kinder conversations
                </span>
                <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                  Bring your community together with threads that feel welcoming from day one.
                </h1>
                <p className="text-base text-slate-300 sm:text-lg">
                  KhoshGolpo gives every team a warm home to share updates, celebrate wins, and resolve questions—
                  without cold automation getting in the way.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="lg" asChild>
                    <Link href="/auth/register">Create your account</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-white/20 bg-white/5 text-slate-100 hover:border-white/30 hover:bg-white/10"
                  >
                    <Link href="/threads">Start a thread</Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-8 shadow-[0_40px_120px_-60px_rgba(8,47,73,0.85)] backdrop-blur">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    <span>Today</span>
                    <span>Community feed</span>
                  </div>
                  <div className="space-y-3 text-sm text-slate-200">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Thread</p>
                      <p className="mt-2 font-medium text-white">“Friday gratitude round”—5 replies in 10 minutes</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Direct mention</p>
                      <p className="mt-2 font-medium text-white">Priya added a reminder for the welcome ritual</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Action</p>
                      <p className="mt-2 font-medium text-white">Draft a celebration note for this week’s milestone</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-slate-950/60 py-20 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Everything you need to keep threads warm and actionable.
              </h2>
              <p className="mt-4 text-base text-slate-300">
                Each feature is built around the basics—sign up, log in, and start sharing stories that matter.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featureHighlights.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-sm transition hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_35px_120px_-70px_rgba(8,47,73,0.9)]"
                >
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-300">{item.description}</p>
                  <Button asChild variant="ghost" className="justify-start px-0 text-slate-200 hover:bg-white/10">
                    <Link href={item.href}>{item.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Three simple steps to get your community flowing.
              </h2>
              <p className="text-base text-slate-300">
                You can launch in an afternoon—no elaborate setup, just thoughtful prompts and a space designed for care.
              </p>
            </div>
            <div className="space-y-6">
              {gettingStarted.map((item) => (
                <div
                  key={item.step}
                  className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
                      {item.step}
                    </span>
                    <h3 className="text-lg font-semibold text-white">{item.headline}</h3>
                    <p className="text-sm text-slate-300">{item.copy}</p>
                  </div>
                  <Button asChild className="w-full sm:w-auto">
                    <Link href={item.href}>{item.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-slate-950/65 py-20 sm:py-24">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 rounded-[2.5rem] border border-white/10 bg-slate-950/70 px-6 py-16 text-center shadow-[0_60px_180px_-90px_rgba(8,47,73,0.9)] sm:px-10">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Ready to open the next thread?
            </h2>
            <p className="max-w-2xl text-base text-slate-300">
              Sign up, invite your team, and launch a conversation that feels personal from the very first post.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/auth/register">Create your account</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-slate-200 hover:bg-white/10">
                <Link href="/auth/login">Log back in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
