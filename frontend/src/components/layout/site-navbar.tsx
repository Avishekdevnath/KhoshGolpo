import { appConfig } from "@/lib/config/env";
import Link from "next/link";
export function SiteNavbar() {
  const navItems = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Community", href: "#community" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-[0.22em] text-slate-100">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-white/10 text-xs font-bold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.15)]">
            KG
          </span>
          KHOSH GOLPO
        </Link>

        <nav className="hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.18em] text-slate-300 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={appConfig.loginPath}
            className="hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 shadow-sm transition hover:border-white/25 hover:bg-white/10 hover:text-white md:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href={appConfig.registerPath}
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 shadow-sm transition hover:bg-slate-200"
          >
            Join circles
          </Link>
        </div>
      </div>
    </header>
  );
}

