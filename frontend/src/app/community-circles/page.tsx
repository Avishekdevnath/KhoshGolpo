import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";

const circleBenefits = [
  {
    title: "Regional spaces",
    description: "Create circles for language groups, project squads, or onboarding cohorts. Configure access rules per circle so people only see what’s relevant.",
  },
  {
    title: "Shared rituals",
    description: "Set welcome prompts, weekly check-ins, and celebration moments that trigger automatically for each circle.",
  },
  {
    title: "Transfer with context",
    description: "Moving a conversation between circles retains thread history, tags, and relevant signals so nothing gets lost.",
  },
];

const circleToolkit = [
  {
    heading: "Pinned summaries",
    body: "Highlight the most helpful messages or decisions at the top of each circle so newcomers catch up quickly.",
  },
  {
    heading: "Circle metrics",
    body: "Track participation, response time, and sentiment per circle to celebrate thriving spaces and support quiet ones.",
  },
  {
    heading: "Circle roles",
    body: "Assign coordinators, moderators, and reviewers with clear permissions. Everyone knows their responsibility from day one.",
  },
];

export default function CommunityCirclesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-950/95 to-indigo-950 text-slate-100">
      <SiteNavbar />

      <main className="flex-1">
        <section className="border-b border-slate-800/60">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-16 text-center sm:px-6 lg:px-8 lg:text-left">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
              Community circles
            </span>
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                Give every group a home while keeping oversight simple.
              </h1>
              <p className="text-pretty text-sm leading-7 text-slate-400 sm:text-base">
                Circles are dedicated spaces for projects, regions, or affinity groups. Each circle keeps the warmth of small
                gatherings, while central teams retain visibility and control.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-800/60 bg-slate-950/60">
          <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
            {circleBenefits.map((benefit) => (
              <div key={benefit.title} className="rounded-3xl border border-slate-800/60 bg-slate-950/80 p-6 text-left shadow-inner shadow-slate-900/40">
                <h2 className="text-lg font-semibold text-white">{benefit.title}</h2>
                <p className="mt-3 text-sm text-slate-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-slate-800/60">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Tools that keep circles thriving</h2>
            <div className="space-y-6">
              {circleToolkit.map((tool) => (
                <div key={tool.heading} className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 text-sm text-slate-300">
                  <h3 className="text-lg font-semibold text-white">{tool.heading}</h3>
                  <p className="mt-2 text-slate-400">{tool.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

