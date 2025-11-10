import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { Button } from "@/components/ui/button";

const highlights = [
  {
    title: "Effortless warmth",
    description: "Keep every conversation human with thoughtful prompts and gentle nudges that feel natural.",
  },
  {
    title: "Shared understanding",
    description: "Map community sentiment in real time so moderators can respond quickly and confidently.",
  },
  {
    title: "Quiet confidence",
    description: "Minimal dashboards surface only what matters—no noise, just actionable clarity for your team.",
  },
];

const pillars = [
  {
    label: "Moments that matter",
    copy: "Design rituals across channels so global teams still feel close on busy days.",
  },
  {
    label: "Signals, not spam",
    copy: "We surface patterns gently—no flashing alerts, just timely context when you need it.",
  },
  {
    label: "Care at scale",
    copy: "Automated workflows preserve empathy while your community grows past time zones.",
  },
];

const faqs = [
  {
    question: "Can KhoshGolpo adapt to our tone?",
    answer: "Yes. Seed us with a few conversations you love and we’ll mirror the warmth across channels.",
  },
  {
    question: "How quickly can we onboard?",
    answer: "Most teams launch in under a week with our guided templates and a dedicated onboarding partner.",
  },
  {
    question: "Is our data secure?",
    answer: "We’re SOC 2 aligned and offer fine-grained controls so you decide what is stored and for how long.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900">
      <SiteNavbar />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-200 bg-white/80 py-24 sm:py-28">
          <div className="absolute inset-y-0 -left-24 hidden w-72 rounded-full bg-slate-200/60 blur-3xl sm:block" aria-hidden />
          <div className="absolute -top-32 right-6 hidden size-72 rounded-full bg-sky-200/40 blur-3xl lg:block" aria-hidden />
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
                Designed for caring teams
              </span>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                Gentle AI layers that keep every conversation thoughtful.
              </h1>
              <p className="text-lg text-slate-600 sm:text-xl">
                KhoshGolpo helps distributed communities stay kind, seen, and connected. We blend quiet automations
                with just enough guidance so your team spends less time firefighting and more time celebrating.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg">
                  Start a walkthrough
                </Button>
                <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:text-slate-900">
                  <Link href="/features">
                    See how it works
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-6 rounded-3xl border border-slate-200/80 bg-white/90 p-10 shadow-[0_40px_100px_-60px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
                    Community pulse
                  </h2>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                    92% feel more connected this quarter
                  </p>
                </div>
                <div className="flex gap-4 text-sm text-slate-600">
                  <div>
                    <span className="block text-xs uppercase tracking-[0.3em] text-slate-500">Response time</span>
                    <span className="text-lg font-semibold text-slate-900">-38%</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-[0.3em] text-slate-500">Escalations</span>
                    <span className="text-lg font-semibold text-slate-900">↓ 41%</span>
                  </div>
                </div>
              </div>
              <p className="max-w-3xl text-base text-slate-600">
                Our warmth engine spots the earliest signals of tension, suggests empathic replies, and guides follow-ups.
                You keep leading with care—without being on-call 24/7.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white/70 py-20 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                A calm control room built for moderators who care.
              </h2>
              <p className="mt-4 text-base text-slate-600">
                Clean layouts, gentle colors, and focus modes help teams triage in minutes. We obsess over the details so
                you can show up grounded.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.title} className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center">
            <div className="flex-1 space-y-6">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                The human layer stays front and center.
              </h2>
              <p className="text-base text-slate-600">
                Every workflow starts with intention. We co-create touchpoints with your team, then give you simple
                toggles to adapt as your community evolves.
              </p>
              <div className="space-y-4">
                {pillars.map((pillar) => (
                  <div key={pillar.label} className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-xs">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                      {pillar.label}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">{pillar.copy}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 rounded-[3rem] border border-slate-200 bg-white/90 p-10 shadow-[0_50px_120px_-80px_rgba(15,23,42,0.4)]">
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Moderator canvas</h3>
                  <p className="mt-2 text-slate-600">
                    Sketch ritual templates, experiment with prompts, and publish rituals directly to your channels.
                  </p>
                </div>
                <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 text-slate-700">
                    Daily warmth check ✨
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 text-slate-700">
                    1:1 nudge with context
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 text-slate-700">
                    Community memory loop
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 text-slate-700">
                    Conflict de-escalation path
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white/80 py-20 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Questions we hear often</h2>
              <p className="mt-4 text-base text-slate-600">
                Short answers, no fluff. Reach out anytime for anything deeper—we’re always happy to share a live demo.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {faqs.map((item) => (
                <div key={item.question} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">{item.question}</h3>
                  <p className="text-sm text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 rounded-[2.5rem] border border-slate-200 bg-white/80 px-6 py-16 text-center shadow-[0_45px_150px_-80px_rgba(15,23,42,0.45)] sm:px-10">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Ready to design warmer conversations?
            </h2>
            <p className="max-w-2xl text-base text-slate-600">
              We’ll listen first, then tailor KhoshGolpo to your team’s values. Every rollout starts with a co-created
              care plan.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg">
                Book an intro call
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-slate-700 hover:text-slate-900">
                <Link href="/contact">
                  Talk to our team
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
