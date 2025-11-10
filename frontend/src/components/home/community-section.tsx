"use client";

export function CommunitySection() {
  return (
    <section id="community" className="border-b border-slate-800/60 bg-slate-950/80">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Built with community elders & moderators.</h2>
          <p className="text-sm leading-7 text-slate-400">
            We co-designed every workflow with facilitators across Dhaka, Manila, Nairobi, and beyond. The result is an
            experience that respects culture while embracing scale.
          </p>
          <div className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 text-sm leading-7 text-slate-300">
            “Warmth is finally measurable. Our empathy labs used to rely on gut feel—now the signal board keeps us aligned without losing heart.”
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">— Sadia, Community Moderator</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Circles live</p>
          <ul className="mt-6 space-y-4 text-sm text-slate-300">
            {["Empathy Lab Facilitators", "Language Room Storytellers", "Safety Night Shift", "Celebration Curators"].map((circle) => (
              <li key={circle} className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-slate-900/70 px-4 py-3">
                <span>{circle}</span>
                <span className="text-xs text-emerald-300">Active</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}


