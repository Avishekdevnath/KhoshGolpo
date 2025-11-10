"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import "@/styles/scrollbar.css";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import Scrollbar from "@/components/ui/Scrollbar";
import { cn } from "@/lib/utils";

const COLLAPSE_STORAGE_KEY = "kg:sidebar-collapsed";
const THEME_STORAGE_KEY = "kg:theme";

type ThemeMode = "light" | "dark";

const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") {
    return "dark";
  }
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    // ignore
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getInitialSidebarCollapsed = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const stored = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
    return stored === "true";
  } catch {
    return false;
  }
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => getInitialSidebarCollapsed());
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());

  useEffect(() => {
    try {
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(sidebarCollapsed));
    } catch (error) {
      console.warn("Unable to persist sidebar collapse state", error);
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn("Unable to persist theme preference", error);
    }
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const containerClasses = cn(
    "flex h-screen overflow-hidden bg-gradient-to-br transition-colors",
    theme === "dark"
      ? "from-slate-950 via-slate-950/95 to-blue-950 text-slate-100"
      : "from-slate-100 via-white to-slate-200 text-slate-900",
  );

  return (
    <ProtectedRoute>
      <div className={containerClasses} data-theme={theme === "dark" ? "app-dark" : "app-light"}>
        <AppSidebar
          open={sidebarOpen}
          onOpenChange={(next: boolean) => setSidebarOpen(next)}
          collapsed={sidebarCollapsed}
          onCollapsedChange={(next: boolean) => setSidebarCollapsed(next)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader onMenuClick={() => setSidebarOpen(true)} onToggleTheme={handleToggleTheme} theme={theme} />
          <main className="flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-10">
            <Scrollbar className="h-full">
              <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
            </Scrollbar>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

