import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";

const sections = [
  {
    title: "Getting started",
    items: [
      { label: "Auth & session flow", href: "/docs#auth" },
      { label: "Connecting the API client", href: "/docs#client" },
      { label: "Realtime sockets", href: "/docs#realtime" },
    ],
  },
  {
    title: "Warmth engine",
    items: [
      { label: "Thread summaries", href: "/docs#summaries" },
      { label: "Tone cues & prompts", href: "/docs#tone" },
      { label: "Celebration exports", href: "/docs#celebrations" },
    ],
  },
  {
    title: "Moderation & security",
    items: [
      { label: "Moderation states", href: "/docs#moderation" },
      { label: "Audit events", href: "/docs#audit" },
      { label: "Rate-limit dashboard", href: "/docs#rate-limit" },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-950/95 to-indigo-950 text-slate-100">
      <SiteNavbar />
      <main className="flex-1">
        <section className="border-b border-slate-800/60">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold sm:text-4xl">Documentation</h1>
            <p className="text-sm leading-7 text-slate-400 sm:text-base">
              Everything you need to integrate KhoshGolpo with your product or run it for your community. We keep the docs
              opinionated and warmth-focused—code, prompts, and playbooks all in one place.
            </p>
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-slate-400">
              <Link href="#auth" className="rounded-full border border-slate-800/70 px-4 py-2 transition hover:border-slate-700 hover:text-white">
                Auth
              </Link>
              <Link
                href="#client"
                className="rounded-full border border-slate-800/70 px-4 py-2 transition hover:border-slate-700 hover:text-white"
              >
                API client
              </Link>
              <Link
                href="#moderation"
                className="rounded-full border border-slate-800/70 px-4 py-2 transition hover:border-slate-700 hover:text-white"
              >
                Moderation
              </Link>
              <Link
                href="#sdk"
                className="rounded-full border border-slate-800/70 px-4 py-2 transition hover:border-slate-700 hover:text-white"
              >
                SDK (coming soon)
              </Link>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-800/60 bg-slate-950/60">
          <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
            <div className="space-y-4 text-sm text-slate-300">
              <h2 className="text-lg font-semibold text-white">Quick links</h2>
              {sections.map((section) => (
                <div key={section.title} className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{section.title}</p>
                  <ul className="mt-4 space-y-3">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <Link href={item.href} className="text-slate-300 transition hover:text-white">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 text-sm text-slate-300">
              <h2 className="text-lg font-semibold text-white">API status</h2>
              <p className="mt-3">
                Live REST and websocket endpoints documented at{" "}
                <a
                  href="https://docs.khoshgolpo.com"
                  rel="noreferrer"
                  target="_blank"
                  className="text-emerald-300 underline-offset-4 hover:underline"
                >
                  docs.khoshgolpo.com
                </a>
                . We update schemas after every release—the changelog is replicated in-app for admins.
              </p>
              <div className="mt-6 rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Latest release</p>
                <p className="mt-2 font-semibold text-white">v0.18 “Mentor Circles”</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-400">
                  <li>Added mentions API for warmth summaries.</li>
                  <li>Expanded moderation states with empathy feedback.</li>
                  <li>Improved webhook signatures and retry policy.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-800/60">
          <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
            <div className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 text-sm text-slate-300">
              <h3 className="text-sm uppercase tracking-[0.18em] text-slate-500" id="support">
                Support
              </h3>
              <p className="mt-4">
                Join the team Slack or email{" "}
                <a href="mailto:devrel@khoshgolpo.com" className="text-emerald-300 underline-offset-4 hover:underline">
                  devrel@khoshgolpo.com
                </a>{" "}
                for implementation questions.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 text-sm text-slate-300">
              <h3 className="text-sm uppercase tracking-[0.18em] text-slate-500">SDK waitlist</h3>
              <p className="mt-4">
                Want React helpers for prompts, moderation states, and warmth analytics? Throw your email on the waitlist and
                we’ll reach out:{" "}
                <a href="mailto:sdk@khoshgolpo.com" className="text-emerald-300 underline-offset-4 hover:underline">
                  sdk@khoshgolpo.com
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}


