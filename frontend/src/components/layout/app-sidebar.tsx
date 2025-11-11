"use client";

import Link from "next/link";
import { useMemo, useState, type FC } from "react";
import { usePathname } from "next/navigation";
import { Flame, LogOut, PanelLeftClose, PanelLeftOpen, PlusCircle, Settings2, X } from "lucide-react";

import { navigationSections } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/hooks";
import { useThreads } from "@/lib/api/hooks/threads";
import { useNotifications } from "@/lib/api/hooks/notifications";
import { useModerationPosts } from "@/lib/api/hooks/admin";
import { Button } from "@/components/ui/button";
import { CreateThreadModal } from "@/components/threads/create-thread-modal";

type AppSidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

export const AppSidebar: FC<AppSidebarProps> = ({ open, onOpenChange, collapsed, onCollapsedChange }) => {
  const pathname = usePathname();
  const { user, logout, isActionPending } = useAuth();
  const [isCreateThreadOpen, setIsCreateThreadOpen] = useState(false);
  const threadsCountQuery = useMemo(() => ({ page: 1, limit: 1 }), []);
  const notificationsCountQuery = useMemo(() => ({ page: 1, limit: 1, unreadOnly: true }), []);
  const moderationCountQuery = useMemo(() => ({ page: 1, limit: 1, state: "pending" as const }), []);
  const { data: threadsMeta } = useThreads(threadsCountQuery, { revalidateOnFocus: false, dedupingInterval: 60_000 });
  const { data: notificationsMeta } = useNotifications(notificationsCountQuery, { revalidateOnFocus: false, dedupingInterval: 30_000 });
  const { data: moderationMeta } = useModerationPosts(moderationCountQuery, { revalidateOnFocus: false, dedupingInterval: 45_000 });

  const threadsCount = threadsMeta?.pagination.total;
  const unreadCount = notificationsMeta?.pagination.total;
  const moderationCount = moderationMeta?.pagination.total;

  const displayName = user?.displayName ?? "Member";
  const firstName = displayName.split(" ")[0] ?? displayName;
  const subtitle = user ? `@${user.handle}` : "community guide";
  const initials =
    displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "KG";

  const badgeCounts: Record<string, string | undefined> = {
    threads: threadsCount != null ? String(threadsCount) : undefined,
    notifications: unreadCount != null ? String(unreadCount) : undefined,
    moderation: moderationCount != null ? String(moderationCount) : undefined,
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const handleLogout = () => {
    onOpenChange(false);
    void logout();
  };

  const handleCreateThreadClick = () => {
    setIsCreateThreadOpen(true);
    onOpenChange(false);
  };

  const roles = user?.roles ?? [];
  const isModerator = roles.includes("moderator");
  const isAdmin = roles.includes("admin");

  const visibleSections = navigationSections.filter((section) => {
    if (section.id === "admin") {
      return isModerator || isAdmin;
    }
    return true;
  });

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 cursor-pointer bg-slate-950/70 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
          onClick={() => onOpenChange(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen flex-col overflow-hidden border-r border-slate-200/70 bg-white/90 py-6 text-slate-700 shadow-[inset_-1px_0px_0px_rgba(148,163,184,0.25)] backdrop-blur-xl transition-transform duration-300 dark:border-slate-800/70 dark:bg-slate-950/95 dark:text-slate-100 dark:shadow-[inset_-1px_0px_0px_rgba(15,23,42,0.6)] lg:static lg:transition-[transform,width] lg:duration-200",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-20 px-3" : "w-72 px-6",
        )}
        data-collapsed={collapsed}
      >
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 rounded-xl border border-transparent px-2 py-1 transition hover:border-slate-300/80 hover:bg-slate-100/80 dark:hover:border-slate-800/80 dark:hover:bg-slate-900/60",
              collapsed && "justify-center px-0",
            )}
            onClick={() => onOpenChange(false)}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30">
              <Flame className="size-5" />
            </span>
            {!collapsed && (
              <span className="text-left">
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">KhoshGolpo</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Warmth-driven spaces</span>
              </span>
            )}
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hidden text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white lg:inline-flex"
              onClick={() => onCollapsedChange(!collapsed)}
              title={collapsed ? "Expand navigation" : "Collapse navigation"}
              aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            >
              {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white lg:hidden"
              onClick={() => onOpenChange(false)}
              aria-label="Close navigation"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            className={cn(
              "inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200/70 bg-white/70 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800/80 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white",
              collapsed && "gap-0 px-0",
            )}
            onClick={handleCreateThreadClick}
            title="Create a new warm thread"
          >
            <PlusCircle className="size-5" />
            {!collapsed && <span>New warm thread</span>}
          </Button>

        </div>

        <nav className="scrollbar-thin mt-6 flex-1 space-y-8 overflow-y-auto pb-6 pr-1 min-h-0">
          {visibleSections.map((section) => (
            <div key={section.id} className="space-y-3">
              {!collapsed && (
                <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-500">{section.label}</p>
              )}
              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const badge = item.badgeKey ? badgeCounts[item.badgeKey] : undefined;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => onOpenChange(false)}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "group relative flex w-full items-center justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200/80 hover:text-slate-900 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-full before:content-[''] before:opacity-0 before:transition-all before:duration-300 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white",
                          active
                            ? "bg-slate-200 text-slate-900 shadow-inner before:opacity-100 before:bg-sky-500 dark:bg-slate-800 dark:text-white"
                            : "before:bg-slate-300 group-hover:before:opacity-100 group-hover:before:bg-slate-400/70 dark:before:bg-slate-700/50",
                          collapsed && "justify-center px-0 py-3",
                        )}
                        title={collapsed ? item.label : undefined}
                        aria-label={collapsed ? item.label : undefined}
                      >
                        <item.icon className="size-5 transition group-hover:scale-105" />
                        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                        {!collapsed && badge && (
                          <span className="ml-auto rounded-full border border-slate-300/70 bg-white/80 px-2 py-0.5 text-xs font-semibold text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.25)] transition group-hover:border-slate-400 group-hover:bg-white dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-[0_0_0_1px_rgba(15,23,42,0.35)] dark:group-hover:border-slate-600 dark:group-hover:bg-slate-900">
                            {badge}
                          </span>
                        )}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-200/70 pt-4 dark:border-slate-800/70">
          <div
            className={cn(
              "flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-3 text-slate-700 shadow-inner shadow-slate-200/60 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-100 dark:shadow-slate-900/60",
              collapsed && "flex-col gap-2",
            )}
          >
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
                "from-sky-500 to-indigo-600",
              )}
            >
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0 text-sm">
                <p className="truncate font-semibold text-slate-900 dark:text-white">{firstName}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
              </div>
            )}
            <div className={cn("ml-auto flex items-center gap-1.5", collapsed && "ml-0 w-full justify-center")}>
              <Button
                asChild
                variant="ghost"
                size="icon-sm"
                className="text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
              >
                <Link href="/profile" onClick={() => onOpenChange(false)} aria-label="Profile settings">
                  <Settings2 className="size-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
                title="Sign out"
                aria-label="Sign out"
                onClick={handleLogout}
                disabled={isActionPending}
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
      <CreateThreadModal isOpen={isCreateThreadOpen} onClose={() => setIsCreateThreadOpen(false)} />
    </>
  );
};


