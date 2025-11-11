"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BellRing, Cog, GaugeCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SETTINGS_STORAGE_KEY = "kg:workspace-settings";

const settingsSchema = z.object({
  emailAnnouncements: z.boolean(),
  emailMentions: z.boolean(),
  pushReplies: z.boolean(),
  pushReminders: z.boolean(),
  twoFactorAuth: z.boolean(),
  loginAlerts: z.boolean(),
  sessionTimeout: z
    .string()
    .trim()
    .min(1, "Session timeout is required.")
    .regex(/^\d+$/, "Session timeout must be a number of minutes."),
  digestFrequency: z.enum(["daily", "weekly", "monthly"]),
  aiAssist: z.boolean(),
  language: z.enum(["en", "bn"]),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const defaultPreferences: SettingsFormValues = {
  emailAnnouncements: true,
  emailMentions: true,
  pushReplies: true,
  pushReminders: false,
  twoFactorAuth: true,
  loginAlerts: true,
  sessionTimeout: "30",
  digestFrequency: "daily",
  aiAssist: true,
  language: "en",
};

const formatFrequencyLabel: Record<SettingsFormValues["digestFrequency"], string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

const languageLabel: Record<SettingsFormValues["language"], string> = {
  en: "English",
  bn: "বাংলা",
};

export default function SettingsPage() {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultPreferences,
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!stored) {
        return;
      }
      const parsed = JSON.parse(stored) as Partial<SettingsFormValues>;
      const merged = { ...defaultPreferences, ...parsed };
      const result = settingsSchema.safeParse(merged);
      if (result.success) {
        form.reset(result.data);
      }
    } catch (error) {
      console.warn("Unable to load saved settings", error);
    }
  }, [form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(values));
      toast.success("Settings updated successfully.");
    } catch (error) {
      console.warn("Unable to persist settings", error);
      toast.error("Could not save your settings. Please try again.");
    }
  });

  const handleReset = () => {
    form.reset(defaultPreferences);
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultPreferences));
    } catch (error) {
      console.warn("Unable to reset settings", error);
    }
    toast.message("Preferences restored", {
      description: "We've reset your workspace settings to their recommended defaults.",
    });
  };

  return (
    <div className="space-y-8 text-slate-700 transition-colors dark:text-slate-200">
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1.1fr]">
        <Card className="relative overflow-hidden border-border/80 bg-gradient-to-br from-sky-500/5 via-card to-indigo-500/5 p-6 shadow-lg shadow-slate-200/30 transition-colors dark:border-slate-800/70 dark:from-sky-500/5 dark:via-slate-950 dark:to-indigo-500/5 dark:shadow-slate-950/40">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/20" aria-hidden="true" />
          <div className="relative space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-600 transition-colors dark:text-sky-300">
                  Workspace preferences
                </p>
                <h1 className="text-3xl font-semibold leading-tight text-slate-900 transition-colors dark:text-white">
                  Fine-tune your KhoshGolpo experience
                </h1>
                <p className="max-w-xl text-sm text-muted-foreground">
                  Control how KhoshGolpo keeps you in the loop, keeps your account safe, and shapes collaborative storytelling to your style.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/80 px-3 py-1 text-xs font-medium text-sky-700 transition-colors dark:border-sky-400/40 dark:bg-sky-500/10 dark:text-sky-200">
                <Cog className="size-3.5" aria-hidden="true" />
                Guided controls
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  Icon: BellRing,
                  label: "Realtime alerts",
                  description: "Manage mention, reply, and community announcements.",
                },
                {
                  Icon: ShieldCheck,
                  label: "Account guard",
                  description: "Keep login activity and 2FA tuned to your comfort.",
                },
                {
                  Icon: GaugeCircle,
                  label: "Workspace flow",
                  description: "Adjust digest cadence, language, and AI assistance.",
                },
              ].map(({ Icon, label, description }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border/60 bg-card/80 px-4 py-4 shadow-inner shadow-slate-200/50 transition-colors dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-slate-950/70"
                >
                  <div className="flex items-start gap-3">
                    <span className="rounded-xl bg-sky-500/10 p-2 text-sky-600 transition-colors dark:bg-sky-500/20 dark:text-sky-300">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900 transition-colors dark:text-white">{label}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="border-border/80 bg-card/90 p-6 shadow-lg shadow-slate-200/30 transition-colors dark:border-slate-800/70 dark:bg-slate-950/80 dark:shadow-slate-950/40">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 transition-colors dark:text-white">Quick actions</h2>
            <p className="text-sm text-muted-foreground">
              Frequently requested updates you can apply in a tap. All changes are saved locally to your device.
            </p>
          </div>
          <div className="mt-5 grid gap-4">
            <Button
              type="button"
              variant="outline"
              className="justify-between rounded-xl border-border bg-background/60 text-left text-sm font-medium transition-colors hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-sky-500 dark:hover:text-sky-300"
              onClick={() => {
                const current = form.getValues();
                const next = { ...current, pushReminders: true, pushReplies: true, emailMentions: true };
                form.reset(next);
                toast.success("Realtime alerts boosted.");
              }}
            >
              Enable realtime alerts
              <BellRing className="size-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="justify-between rounded-xl border-border bg-background/60 text-left text-sm font-medium transition-colors hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
              onClick={() => {
                const current = form.getValues();
                const next = { ...current, twoFactorAuth: true, loginAlerts: true };
                form.reset(next);
                toast.success("Account security hardened.");
              }}
            >
              Harden account security
              <ShieldCheck className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </Card>
      </div>

      <Card className="border-border/80 bg-card/90 p-6 shadow-lg shadow-slate-200/30 transition-colors dark:border-slate-800/70 dark:bg-card/80 dark:shadow-slate-950/40">
        <form className="space-y-10" onSubmit={onSubmit}>
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900 transition-colors dark:text-white">Notifications</h2>
              <p className="text-sm text-muted-foreground">
                Decide how we nudge you about threads and community movements.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  id: "emailAnnouncements",
                  title: "Community announcements",
                  description: "Essential platform updates and new feature drops sent to your inbox.",
                },
                {
                  id: "emailMentions",
                  title: "Mentions and tags",
                  description: "Email when someone references you in a thread or private note.",
                },
                {
                  id: "pushReplies",
                  title: "Thread replies",
                  description: "Push notifications when stories you follow gain new responses.",
                },
                {
                  id: "pushReminders",
                  title: "Daily reminders",
                  description: "Prompt nudges to keep conversations flowing and drafts polished.",
                },
              ].map(({ id, title, description }) => (
                <label
                  key={id}
                  className="group flex items-start gap-3 rounded-2xl border border-border/60 bg-secondary/60 px-4 py-4 transition-colors hover:border-sky-300 hover:bg-secondary/80 dark:border-slate-800/60 dark:bg-slate-900/70 dark:hover:border-sky-500"
                >
                  <input
                    type="checkbox"
                    {...form.register(id as keyof SettingsFormValues)}
                    className="mt-1 size-4 rounded border-slate-300 text-sky-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <span className="space-y-1">
                    <span className="text-sm font-semibold text-slate-900 transition-colors dark:text-white">{title}</span>
                    <span className="block text-xs text-muted-foreground">{description}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900 transition-colors dark:text-white">Security</h2>
              <p className="text-sm text-muted-foreground">Protect your account and keep tabs on sign-in activity.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  id: "twoFactorAuth",
                  title: "Two-factor authentication",
                  description: "Require verification codes on every sign in for extra security.",
                },
                {
                  id: "loginAlerts",
                  title: "Login alerts",
                  description: "Email you whenever we detect a new device or location.",
                },
              ].map(({ id, title, description }) => (
                <label
                  key={id}
                  className="group flex items-start gap-3 rounded-2xl border border-border/60 bg-secondary/60 px-4 py-4 transition-colors hover:border-emerald-300 hover:bg-secondary/80 dark:border-slate-800/60 dark:bg-slate-900/70 dark:hover:border-emerald-500"
                >
                  <input
                    type="checkbox"
                    {...form.register(id as keyof SettingsFormValues)}
                    className="mt-1 size-4 rounded border-slate-300 text-emerald-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <span className="space-y-1">
                    <span className="text-sm font-semibold text-slate-900 transition-colors dark:text-white">{title}</span>
                    <span className="block text-xs text-muted-foreground">{description}</span>
                  </span>
                </label>
              ))}
              <div className="rounded-2xl border border-border/60 bg-secondary/60 px-4 py-4 transition-colors dark:border-slate-800/60 dark:bg-slate-900/70">
                <Label htmlFor="sessionTimeout" className="text-sm font-semibold text-slate-900 transition-colors dark:text-white">
                  Session timeout (minutes)
                </Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min={5}
                  step={5}
                  placeholder="30"
                  {...form.register("sessionTimeout")}
                  className="mt-2 rounded-xl border-border bg-background/80 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900"
                />
                {form.formState.errors.sessionTimeout && (
                  <p className="mt-2 text-xs text-destructive">{form.formState.errors.sessionTimeout.message}</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">We sign you out automatically after inactivity.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900 transition-colors dark:text-white">Workspace preferences</h2>
              <p className="text-sm text-muted-foreground">
                Shape how updates are delivered and how AI assists your storytelling.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-secondary/60 px-4 py-4 transition-colors dark:border-slate-800/60 dark:bg-slate-900/70">
                <Label htmlFor="digestFrequency" className="text-sm font-semibold text-slate-900 transition-colors dark:text-white">
                  Digest frequency
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Choose how often we send a round-up of highlights and prompts.
                </p>
                <select
                  id="digestFrequency"
                  {...form.register("digestFrequency")}
                  className="mt-3 w-full rounded-xl border border-border bg-background/80 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-900"
                >
                  {Object.entries(formatFrequencyLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <label className="group flex h-full items-start gap-3 rounded-2xl border border-border/60 bg-secondary/60 px-4 py-4 transition-colors hover:border-purple-300 hover:bg-secondary/80 dark:border-slate-800/60 dark:bg-slate-900/70 dark:hover:border-purple-500">
                <input
                  type="checkbox"
                  {...form.register("aiAssist")}
                  className="mt-1 size-4 rounded border-slate-300 text-purple-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:border-slate-700 dark:bg-slate-900"
                />
                <span className="space-y-1">
                  <span className="text-sm font-semibold text-slate-900 transition-colors dark:text-white">AI co-writer</span>
                  <span className="block text-xs text-muted-foreground">
                    Surface narrative prompts and smart suggestions while you compose threads.
                  </span>
                </span>
              </label>
              <div className="rounded-2xl border border-border/60 bg-secondary/60 px-4 py-4 transition-colors dark:border-slate-800/60 dark:bg-slate-900/70">
                <Label htmlFor="language" className="text-sm font-semibold text-slate-900 transition-colors dark:text-white">
                  Primary language
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">Switch the preferred language for interface hints and digests.</p>
                <select
                  id="language"
                  {...form.register("language")}
                  className="mt-3 w-full rounded-xl border border-border bg-background/80 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:border-slate-700 dark:bg-slate-900"
                >
                  {Object.entries(languageLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6 dark:border-slate-800/60">
            <div className="text-xs text-muted-foreground">
              Changes save to this device. We will sync with your account once the preference API is available.
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-border bg-background/60 text-sm font-medium transition-colors dark:border-slate-700 dark:bg-slate-900/60"
                onClick={handleReset}
              >
                Restore defaults
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-lg shadow-sky-500/30 hover:from-sky-400 hover:to-indigo-500"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Saving..." : "Save preferences"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}


