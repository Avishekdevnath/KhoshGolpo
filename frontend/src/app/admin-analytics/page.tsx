import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";

const analyticsHighlights = [
  {
    title: "Executive dashboards",
    description: "See warmth trends, policy adherence, and response quality broken down by region, team, or topic.",
  },
  {
    title: "Operational KPIs",
    description: "Track time-to-acknowledge, follow-up completion, and unresolved threads so nothing stalls.",
  },
  {
    title: "Policy insights",
    description: "Monitor which guidelines are triggered most often and identify where additional training is needed.",
  },
];

const dataCapabilities = [
  {
    heading: "Self-serve visualisations",
    body: "Filter charts, combine metrics, and bookmark views. Every widget supports drill-downs to the original conversation.",
  },
  {
    heading: "Scheduled reporting",
    body: "Automate weekly or monthly recap emails for leadership with the metrics that matter most to them.",
  },
  {
    heading: "Secure exports",
    body: "Export data to CSV, connect to BI tools, or use webhooks. Access is role-based to protect sensitive conversations.",
  },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-950/95 to-indigo-950 text-slate-100">
      <SiteNavbar />

      <main className="flex-1">
        <section className="border-b border-slate-800/60">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-16 text-center sm:px-6 lg:px-8 lg:text-left">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
              Admin analytics
            </span>
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                Data that connects conversation health to business outcomes.
              </h1>
              <p className="text-pretty text-sm leading-7 text-slate-400 sm:text-base">
                Provide leadership with clarity on what’s happening across the network—without asking moderators to build
                spreadsheets or screenshots.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-800/60 bg-slate-950/60">
          <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
            {analyticsHighlights.map((item) => (
              <div key={item.title} className="rounded-3xl border border-slate-800/60 bg-slate-950/80 p-6 text-left shadow-inner shadow-slate-900/40">
                <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-3 text-sm text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-slate-800/60">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Flexible reporting built for collaboration</h2>
            <div className="space-y-6">
              {dataCapabilities.map((capability) => (
                <div key={capability.heading} className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 text-sm text-slate-300">
                  <h3 className="text-lg font-semibold text-white">{capability.heading}</h3>
                  <p className="mt-2 text-slate-400">{capability.body}</p>
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

