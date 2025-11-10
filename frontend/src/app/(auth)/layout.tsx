import Link from "next/link";
import type { ReactNode } from "react";

import { AuthRedirect } from "@/components/auth/auth-redirect";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-950/95 to-indigo-950 text-slate-100">
      <AuthRedirect />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-slate-800/40 to-transparent lg:block" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-10 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 text-sm font-semibold tracking-[0.22em] text-slate-200 transition hover:text-white"
          >
            <span className="flex size-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-xs font-bold text-white shadow-lg shadow-sky-500/30">
              KG
            </span>
            KHOSH GOLPO
          </Link>

          <Link
            href="/features"
            className="hidden rounded-full border border-slate-800/60 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:border-slate-700 hover:text-white sm:inline-flex"
          >
            Explore features
          </Link>
        </header>

        <main className="mx-auto flex w-full flex-1 items-center px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

