"use client";

import { useHomePageContext } from "@/components/home/home-context";

export function FaqSection() {
  const { faqs } = useHomePageContext();

  return (
    <section id="faq" className="border-b border-slate-800/60 bg-slate-950">
      <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-semibold text-white sm:text-4xl">Questions from fellow moderators.</h2>
        <div className="mt-10 space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6">
              <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
              <p className="mt-2 text-sm text-slate-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


