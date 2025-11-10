import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";

const studioWorkflows = [
  {
    title: "Escalation triage",
    description: "Route urgent posts to the right lead with one click. Attach context, prior actions, and suggested responses.",
  },
  {
    title: "Policy guidance",
    description: "Surface relevant policy excerpts next to the thread so moderators can make decisions with confidence.",
  },
  {
    title: "Case timeline",
    description: "Track comments, approvals, and next steps in one timeline that syncs back to the main conversation.",
  },
];

const studioAssists = [
  {
    heading: "Draft assistant",
    body: "AI-generated replies respect your tone guide and highlight sections that should be reviewed by a human before publishing.",
  },
  {
    heading: "Checklists",
    body: "Custom checklists ensure each moderation task follows legal and community standards before it’s marked complete.",
  },
  {
    heading: "Multi-language support",
    body: "Transcribes and translates in-line so global teams understand intent without waiting for manual summaries.",
  },
];

export default function ModerationStudioPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-950/95 to-indigo-950 text-slate-100">
      <SiteNavbar />

      <main className="flex-1">
        <section className="border-b border-slate-800/60">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-16 text-center sm:px-6 lg:px-8 lg:text-left">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
              Moderation studio
            </span>
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                Resolve sensitive conversations with clarity and care.
              </h1>
              <p className="text-pretty text-sm leading-7 text-slate-400 sm:text-base">
                The Moderation Studio equips teams with shared context, smart assists, and audit-ready records so every thread
                is handled consistently.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-800/60 bg-slate-950/60">
          <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
            {studioWorkflows.map((workflow) => (
              <div key={workflow.title} className="rounded-3xl border border-slate-800/60 bg-slate-950/80 p-6 text-left shadow-inner shadow-slate-900/40">
                <h2 className="text-lg font-semibold text-white">{workflow.title}</h2>
                <p className="mt-3 text-sm text-slate-400">{workflow.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-slate-800/60">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Assistive tools that keep humans in control</h2>
            <div className="space-y-6">
              {studioAssists.map((assist) => (
                <div key={assist.heading} className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 text-sm text-slate-300">
                  <h3 className="text-lg font-semibold text-white">{assist.heading}</h3>
                  <p className="mt-2 text-slate-400">{assist.body}</p>
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

