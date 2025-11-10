import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";

const features = [
  {
    title: "Warmth engine",
    points: [
      "Thread summaries that feel human, translated for every moderator.",
      "Tone cues and empathy prompts tuned to your rituals.",
      "Celebration cards auto-created for stand-ups and newsletters.",
    ],
  },
  {
    title: "Moderation studio",
    points: [
      "AI surfaces context, humans approve or escalate in seconds.",
      "Confidence scores and cultural notes for every flag.",
      "Bulk actions with audit trails and gratitude follow-ups.",
    ],
  },
  {
    title: "Facilitator dashboards",
    points: [
      "Live warmth index by circle, timezone, and moderator.",
      "Mentions, sentiment, and gratitude streams in one view.",
      "Playbook nudges to maintain healthy pacing.",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-950/95 to-indigo-950 text-slate-100">
      <SiteNavbar />
      <main className="flex-1">
        <section className="border-b border-slate-800/60">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-16 text-balance sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold sm:text-4xl">Every feature respects the human leading the room.</h1>
            <p className="text-sm leading-7 text-slate-400 sm:text-base">
              KhoshGolpo is a suite of warmth tools: summaries, moderation, analytics, and escalations that honour cultural
              nuance. Here’s how each layer fits together.
            </p>
            <Link
              href="/docs"
              className="inline-flex max-w-xs items-center justify-center rounded-xl border border-slate-800/70 bg-slate-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:border-slate-700 hover:text-white"
            >
              Browse documentation
            </Link>
          </div>
        </section>

        <section className="border-b border-slate-800/60 bg-slate-950/60">
          <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 text-sm text-slate-300">
                <h2 className="text-lg font-semibold text-white">{feature.title}</h2>
                <ul className="mt-4 space-y-3">
                  {feature.points.map((point) => (
                    <li key={point} className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-sm text-emerald-100">
              <h2 className="text-lg font-semibold text-white">Integrations roadmap</h2>
              <p className="mt-3">
                Slack warmth summaries, Notion action exports, and webhook-based escalations are in private preview. Reach out if
                you’d like early access.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-800/60">
          <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-16 text-sm text-slate-300 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">Security & trust baked in.</h2>
            <p>
              Role-based access, detailed audit logs, and AI moderation states keep your org compliant while staying warm. We’re
              SOC 2 aligned and working through certification now.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "SSO + 2FA for moderators and admins.",
                "PII-aware redaction filters for transcripts and exports.",
                "Rate limits and anomaly detection managed from the security command center.",
                "Regional data residency options for high-compliance teams.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
                  {item}
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


