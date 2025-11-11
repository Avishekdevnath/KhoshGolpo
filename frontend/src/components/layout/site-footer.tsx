import Link from "next/link";

const footerLinks = [
  {
    title: "Team tools",
    links: [
      { label: "Community circles", href: "/community-circles" },
      { label: "Moderation studio", href: "/moderation-studio" },
      { label: "Admin analytics", href: "/admin-analytics" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Story", href: "/story" },
      { label: "Support", href: "/support" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 py-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-[0.32rem] text-slate-100">
              <span className="flex size-9 items-center justify-center rounded-2xl bg-white/10 text-xs font-bold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)]">
                KG
              </span>
              KHOSH GOLPO
            </Link>
            <p className="max-w-sm text-sm text-slate-300">
              Conversations designed for empathy-first teams. Our AI keeps the warmth alive while you scale across time zones.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title} className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.28rem] text-slate-400">{group.title}</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                {group.links.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="transition hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 text-xs uppercase tracking-[0.28rem] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} KhoshGolpo. Crafted with warmth.</p>
          <div className="flex gap-6">
            <Link href="#" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="#" className="transition hover:text-white">
              Terms
            </Link>
            <Link href="#" className="transition hover:text-white">
              Status
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

