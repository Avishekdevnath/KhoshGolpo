import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";

const supportOptions = [
  {
    title: "Help centre",
    description: "Guides on configuring warmth prompts, managing roles, and rolling out playbooks organisation-wide.",
    action: { label: "Browse knowledge base", href: "/docs" },
  },
  {
    title: "Team onboarding",
    description: "Need a walkthrough for your moderators or managers? Book an onboarding session tailored to your workflow.",
    action: { label: "Schedule session", href: "mailto:support@khoshgolpo.com?subject=Onboarding%20request" },
  },
  {
    title: "Incident desk",
    description: "Report abuse, security concerns, or urgent policy questions. We respond within four business hours.",
    action: { label: "Contact incident desk", href: "mailto:support@khoshgolpo.com?subject=Incident%20support" },
  },
];

const faqItems = [
  {
    question: "How quickly can we go live?",
    answer: "Most teams launch in under two weeks. Import your membership lists, select your initial playbooks, and schedule a training call—we’ll guide you through the rest.",
  },
  {
    question: "Do you support multiple languages?",
    answer: "Yes. Warmth prompts and tone analysis support Bangla and English today, with additional languages rolling out every quarter.",
  },
  {
    question: "Where do you store data?",
    answer: "Data is hosted in our ISO-compliant cloud region. Enterprise customers can request dedicated instances based on regulatory needs.",
  },
];

export default function SupportPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-950/95 to-indigo-950 text-slate-100">
      <SiteNavbar />

      <main className="flex-1">
        <section className="border-b border-slate-800/60">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-16 text-center sm:px-6 lg:px-8 lg:text-left">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
              Support
            </span>
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                We’re here to help you keep conversations healthy.
              </h1>
              <p className="text-pretty text-sm leading-7 text-slate-400 sm:text-base">
                Whether you’re launching KhoshGolpo for the first time or scaling to new regions, our team is ready with the
                resources and response times you need.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-800/60 bg-slate-950/60">
          <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
            {supportOptions.map((option) => (
              <div key={option.title} className="rounded-3xl border border-slate-800/60 bg-slate-950/80 p-6 text-left shadow-inner shadow-slate-900/40">
                <h2 className="text-lg font-semibold text-white">{option.title}</h2>
                <p className="mt-3 text-sm text-slate-400">{option.description}</p>
                <Link
                  href={option.action.href}
                  className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 transition hover:text-emerald-200"
                >
                  {option.action.label}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-slate-800/60">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Frequently asked questions</h2>
            <div className="space-y-6">
              {faqItems.map((item) => (
                <div key={item.question} className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 text-sm text-slate-300">
                  <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                  <p className="mt-2 text-slate-400">{item.answer}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400">
              Need something else? Email{" "}
              <Link href="mailto:support@khoshgolpo.com" className="font-semibold text-emerald-300 hover:text-emerald-200">
                support@khoshgolpo.com
              </Link>{" "}
              and we’ll get back within one business day.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

