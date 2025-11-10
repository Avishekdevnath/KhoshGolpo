import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";

const contactOptions = [
  {
    title: "Book a warmth session",
    description: "Walk through the platform with a community strategist and design your first playbook.",
    action: { label: "Schedule call", href: "mailto:hello@khoshgolpo.com?subject=Warmth%20session" },
  },
  {
    title: "Talk to support",
    description: "Need help with integrations, data residency, or moderation policy? The support team can help.",
    action: { label: "support@khoshgolpo.com", href: "mailto:support@khoshgolpo.com" },
  },
  {
    title: "Join the team Slack",
    description: "Swap rituals with global facilitators, share feedback, and hear about upcoming features.",
    action: { label: "Request invite", href: "mailto:community@khoshgolpo.com?subject=Slack%20invite" },
  },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-950/95 to-indigo-950 text-slate-100">
      <SiteNavbar />
      <main className="flex-1">
        <section className="border-b border-slate-800/60">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-16 text-balance sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold sm:text-4xl">Let’s keep the warmth going.</h1>
            <p className="text-sm leading-7 text-slate-400 sm:text-base">
              Whether you’re exploring KhoshGolpo or already running empathy labs, we’d love to talk. Choose the option that
              fits best or send a note to{" "}
              <a href="mailto:hello@khoshgolpo.com" className="text-emerald-300 underline-offset-4 hover:underline">
                hello@khoshgolpo.com
              </a>
              .
            </p>
          </div>
        </section>

        <section className="border-b border-slate-800/60 bg-slate-950/60">
          <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
            {contactOptions.map((option) => (
              <div key={option.title} className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 text-sm text-slate-300">
                <h2 className="text-lg font-semibold text-white">{option.title}</h2>
                <p className="mt-3 text-slate-400">{option.description}</p>
                <Link
                  href={option.action.href}
                  className="mt-6 inline-flex items-center justify-center rounded-xl border border-slate-800/70 bg-slate-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:border-slate-700 hover:text-white"
                >
                  {option.action.label}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-slate-800/60">
          <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 text-sm text-slate-300">
                <h3 className="text-sm uppercase tracking-[0.18em] text-slate-500">Office hours</h3>
                <p className="mt-4">
                  We host open office hours every Wednesday at 14:00 GMT. Drop in to ask questions about tone prompts, moderation,
                  or analytics. Email{" "}
                  <a href="mailto:officehours@khoshgolpo.com" className="text-emerald-300 underline-offset-4 hover:underline">
                    officehours@khoshgolpo.com
                  </a>{" "}
                  for a calendar invite.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 text-sm text-slate-300">
                <h3 className="text-sm uppercase tracking-[0.18em] text-slate-500">Press & partnerships</h3>
                <p className="mt-4">
                  If you’re covering community tech or interested in partnership, reach out to{" "}
                  <a href="mailto:press@khoshgolpo.com" className="text-emerald-300 underline-offset-4 hover:underline">
                    press@khoshgolpo.com
                  </a>
                  .
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 text-sm text-slate-300">
                <h3 className="text-sm uppercase tracking-[0.18em] text-slate-500">Community directory</h3>
                <p className="mt-4">
                  Looking for another community lead in your timezone? Ping{" "}
                  <a href="mailto:community@khoshgolpo.com" className="text-emerald-300 underline-offset-4 hover:underline">
                    community@khoshgolpo.com
                  </a>{" "}
                  and we’ll introduce you.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-emerald-500/40 bg-slate-950/70 p-6">
              <h2 className="text-lg font-semibold text-white">Send a message</h2>
              <p className="mt-2 text-sm text-slate-400">
                Tell us about your community and we’ll reply within one business day.
              </p>
              <form className="mt-6 space-y-4" method="post" action="#">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Your name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Amina Rahman"
                    className="w-full rounded-xl border border-slate-800/70 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@team.org"
                    className="w-full rounded-xl border border-slate-800/70 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="org" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Organization / community
                  </label>
                  <input
                    id="org"
                    name="org"
                    type="text"
                    placeholder="Community moderators collective"
                    className="w-full rounded-xl border border-slate-800/70 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    placeholder="Share a bit about your community, rituals, and what support you need."
                    className="w-full rounded-xl border border-slate-800/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-400 hover:to-teal-500"
                >
                  Send message
                </button>
                <p className="text-[11px] text-slate-500">
                  By submitting, you agree to let us email you about KhoshGolpo. We respect warm inboxes and won’t spam.
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}


