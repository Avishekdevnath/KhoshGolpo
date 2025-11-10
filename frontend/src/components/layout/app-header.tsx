"use client";

import { Menu, Moon, Search, Settings2, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ThemeMode = "light" | "dark";

type AppHeaderProps = {
  onMenuClick: () => void;
  onToggleTheme: () => void;
  theme: ThemeMode;
};

export function AppHeader({ onMenuClick, onToggleTheme, theme }: AppHeaderProps) {
  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl transition-colors dark:border-slate-800/60 dark:bg-slate-950/70">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-600 hover:bg-slate-200 hover:text-slate-900 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </Button>

        <div className="relative hidden flex-1 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 px-4 py-2 text-slate-600 shadow-inner shadow-slate-300/40 transition-colors dark:border-slate-800/80 dark:bg-slate-900/70 dark:text-slate-300 dark:shadow-slate-900/70 lg:flex">
          <Search className="size-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Search threads, notes, or people"
            className="border-0 bg-transparent p-0 text-sm text-slate-600 placeholder:text-slate-400 focus-visible:ring-0 dark:text-slate-200"
          />
          <span className="ml-auto hidden rounded-lg border border-slate-200/80 px-3 py-1 text-xs uppercase tracking-wide text-slate-500 transition-colors dark:border-slate-700 dark:text-slate-400 xl:inline-flex">
            Ctrl + K
          </span>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
            title={`Switch to ${isDark ? "light" : "dark"} theme`}
            aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
            onClick={onToggleTheme}
          >
            {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
            title="Open settings"
            aria-label="Open settings"
          >
            <Settings2 className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}


