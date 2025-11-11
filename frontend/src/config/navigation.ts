"use client";

import { Activity, Bell, LayoutDashboard, MessageCircle, Settings2, ShieldCheck, UserCircle2, Users } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export type NavigationItem = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  badgeKey?: string;
};

export type NavigationSection = {
  id: string;
  label: string;
  items: NavigationItem[];
};

export const navigationSections: NavigationSection[] = [
  {
    id: "primary",
    label: "Primary",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Threads", href: "/threads", icon: MessageCircle, badgeKey: "threads" },
      { label: "My Threads", href: "/threads/my", icon: UserCircle2 },
      { label: "Notifications", href: "/notifications", icon: Bell, badgeKey: "notifications" },
      { label: "Profile", href: "/profile", icon: Users },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    items: [
      { label: "Moderation", href: "/admin/moderation", icon: ShieldCheck, badgeKey: "moderation" },
      { label: "Team", href: "/admin/users", icon: Users },
      { label: "Security", href: "/admin/security", icon: Activity },
      { label: "Settings", href: "/settings", icon: Settings2 },
    ],
  },
];


