import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";

const storySections = [
  {
    title: "A response to silent threads",
    body: "KhoshGolpo started when a distributed team realised heartfelt stories were getting lost in inboxes. We built a tool that highlighted moments needing acknowledgement, and the pilot community saw response times cut in half.",
  },
  {
    title: "Blending human warmth with AI",
    body: "We work with community managers, social workers, and linguists to train models that sound respectful in Bangla and English. Every AI suggestion is transparent and easy to edit before sending.",
  },
  {
    title: "Scaling across industries",
    body: "Today, organisations in HR, education, and support use KhoshGolpo to keep dialogue open. We focus on teams that value empathy just as much as efficiency.",
  },
];

export default function StoryPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-950/95 to-indigo-950 text-slate-100">
      <SiteNavbar />

      <main className="flex-1">
        <section className="border-b border-slate-800/60">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-16 text-center sm:px-6 lg:px-8 lg:text-left">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
              Our story
            </span>
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                From a late-night experiment to a platform for human conversation.
              </h1>
              <p className="text-pretty text-sm leading-7 text-slate-400 sm:text-base">
                KhoshGolpo means “friendly chat” in Bangla. We chose the name because every tool we build should feel like an
                invitation, not a command.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-800/60">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
            {storySections.map((section) => (
              <article key={section.title} className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 text-sm text-slate-300">
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                <p className="mt-2 text-slate-400">{section.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

