import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";

const values = [
  {
    title: "Warmth first",
    description: "We design every workflow to protect connection before efficiency. Technology should sound like a teammate, not a ticketing bot.",
  },
  {
    title: "Trust by default",
    description: "Customers own their data and decide who sees it. Every feature is reviewed for privacy and compliance requirements.",
  },
  {
    title: "Scale with care",
    description: "We build for fast-growing organisations that still want nuance. The goal is thoughtful growth, not more noise.",
  },
];

const timeline = [
  {
    year: "2022",
    event: "KhoshGolpo began as an internal tool for a global non-profit to reduce response lag across volunteer communities.",
  },
  {
    year: "2023",
    event: "Expanded into a platform with warmth metrics, moderator hand-offs, and analytics for programme leads.",
  },
  {
    year: "2024",
    event: "Opened to early partners across HR teams, support organisations, and education networks spanning four continents.",
  },
];

export default function CompanyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-950/95 to-indigo-950 text-slate-100">
      <SiteNavbar />

      <main className="flex-1">
        <section className="border-b border-slate-800/60">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-16 text-center sm:px-6 lg:px-8 lg:text-left">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
              Our company
            </span>
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                We help teams keep empathy at the centre of every conversation.
              </h1>
              <p className="text-pretty text-sm leading-7 text-slate-400 sm:text-base">
                KhoshGolpo brings together product builders, community leads, and language experts from across Bangladesh and
                beyond. We’re building tools that feel human—because support shouldn’t sound like a script.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-800/60 bg-slate-950/60">
          <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
            {values.map((value) => (
              <div key={value.title} className="rounded-3xl border border-slate-800/60 bg-slate-950/80 p-6 text-left shadow-inner shadow-slate-900/40">
                <h2 className="text-lg font-semibold text-white">{value.title}</h2>
                <p className="mt-3 text-sm text-slate-400">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-slate-800/60">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Our path so far</h2>
            <div className="space-y-6">
              {timeline.map((item) => (
                <div key={item.year} className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 text-sm text-slate-300">
                  <h3 className="text-lg font-semibold text-white">{item.year}</h3>
                  <p className="mt-2 text-slate-400">{item.event}</p>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 text-sm text-slate-300">
              <h3 className="text-lg font-semibold text-white">Want to build with us?</h3>
              <p className="mt-2 text-slate-400">
                We collaborate with organisations that care about inclusive storytelling and safe digital communities.{" "}
                <Link href="/contact" className="font-semibold text-emerald-300 hover:text-emerald-200">
                  Reach out
                </Link>{" "}
                if you’d like to partner, invest, or join the team.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

