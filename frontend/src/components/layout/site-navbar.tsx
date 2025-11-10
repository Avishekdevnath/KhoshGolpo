import Link from "next/link";

import { appConfig } from "@/lib/config/env";

const navItems = [
  { label: "Features", href: "/features" },
  { label: "Docs", href: "/docs" },
  { label: "Contact", href: "/contact" },
];

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-[0.22em] text-slate-200">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-xs font-bold text-white shadow-lg shadow-sky-500/30">
            KG
          </span>
          KHOSH GOLPO
        </Link>

        <nav className="hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.18em] text-slate-400 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={appConfig.loginPath}
            className="hidden rounded-xl border border-slate-800/60 bg-slate-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 shadow-sm transition hover:border-slate-700 hover:text-white md:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href={appConfig.registerPath}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-400 hover:to-teal-500"
          >
            Join circles
          </Link>
        </div>
      </div>
    </header>
  );
}

