import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";

const milestones = [
  {
    year: "2023",
    title: "Prototype empathy labs",
    description: "Hand-built playbooks with Dhaka moderators to validate tone-aware AI prompts.",
  },
  {
    year: "2024",
    title: "Warmth engine launches",
    description: "Scaled summaries and moderation studio across 12 communities in five countries.",
  },
  {
    year: "2025",
    title: "Global moderator network",
    description: "Hundreds of facilitators co-creating culturally aware rituals and dashboards.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-950/95 to-indigo-950 text-slate-100">
      <SiteNavbar />
      <main className="flex-1">
        <section className="border-b border-slate-800/60">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-16 text-balance sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold sm:text-4xl">We build technology that keeps human warmth in the room.</h1>
            <p className="text-sm leading-7 text-slate-400 sm:text-base">
              KhoshGolpo began as late-night facilitator circles where we tested how AI could guide empathy without replacing
              humans. Every workflow, from summaries to escalation cues, is co-designed with community elders, moderators, and
              safety leads across the Global South.
            </p>
            <Link
              href="/features"
              className="inline-flex max-w-xs items-center justify-center rounded-xl border border-slate-800/70 bg-slate-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:border-slate-700 hover:text-white"
            >
              Explore the platform
            </Link>
          </div>
        </section>

        <section className="border-b border-slate-800/60 bg-slate-950/60">
          <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold sm:text-3xl">Our north stars.</h2>
              <p className="text-sm leading-7 text-slate-400">
                We measure our success by how communities feel: safe, celebrated, and able to scale without losing culture. The
                product evolves with three commitments.
              </p>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4">
                  <span className="font-semibold text-white">Human-in-the-loop everything.</span> AI surfaces signals; humans
                  decide the moves.
                </li>
                <li className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4">
                  <span className="font-semibold text-white">Culture before features.</span> We listen to moderators before
                  shipping dashboards.
                </li>
                <li className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4">
                  <span className="font-semibold text-white">Transparency over black boxes.</span> Every prompt and nudge has a
                  why, visible to the people using it.
                </li>
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6">
              <h3 className="text-sm uppercase tracking-[0.18em] text-slate-500">Milestones</h3>
              <div className="mt-6 space-y-4 text-sm text-slate-300">
                {milestones.map((milestone) => (
                  <div key={milestone.year} className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{milestone.year}</p>
                    <p className="mt-2 font-semibold text-white">{milestone.title}</p>
                    <p className="mt-2 text-slate-400">{milestone.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-800/60">
          <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
            <div className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6">
              <h3 className="text-sm uppercase tracking-[0.18em] text-slate-500">Where we’re going</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Over the next 12 months we’re focused on multilingual warmth prompts, moderator credentialing, and deeper
                analytics that stitch warmth data into leadership workflows.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 text-sm text-slate-300">
              <h3 className="text-sm uppercase tracking-[0.18em] text-slate-500">Say hello</h3>
              <p className="mt-4">
                We love hearing from communities designing new rituals. Reach out at{" "}
                <a href="mailto:hello@khoshgolpo.com" className="text-emerald-300 underline-offset-4 hover:underline">
                  hello@khoshgolpo.com
                </a>{" "}
                and we’ll set up a warmth session.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}


