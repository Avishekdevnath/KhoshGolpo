"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Calendar, Clock3, Mail, PenSquare, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile, useUpdateProfile } from "@/lib/api/hooks/profile";
import { formatRelativeTime } from "@/lib/utils/date";
import { useAuth } from "@/lib/auth/hooks";
import { cn } from "@/lib/utils";

const schema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters.")
    .max(80, "Display name must be at most 80 characters."),
});

type ProfileFormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const { data: profile, isLoading, error, mutateRemote } = useProfile();
  const updateProfile = useUpdateProfile();
  const { user } = useAuth();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName ?? "",
      });
    }
  }, [form, profile]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: ProfileFormValues = {
      displayName: values.displayName.trim(),
    };

    try {
      await updateProfile(payload);
      await mutateRemote();
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update profile right now.");
    }
  });

  const stats = [
    {
      label: "Threads sparked",
      value: profile?.threadsCount ?? 0,
      hint: "All-time conversations you've started.",
    },
    {
      label: "Posts shared",
      value: profile?.postsCount ?? 0,
      hint: "Total stories and replies in the community.",
    },
    {
      label: "Roles",
      value: profile?.roles?.join(", ") ?? "member",
      hint: "Community roles currently assigned.",
    },
    {
      label: "Status",
      value: profile?.status ?? "active",
      hint: "Current account standing.",
    },
  ];

  const formattedStats = stats.map((item) => ({
    ...item,
    value: typeof item.value === "number" ? item.value.toLocaleString() : item.value,
  }));

  const detailItems = [
    {
      icon: Mail,
      label: "Email",
      value: profile?.email ?? user?.email ?? "Not provided",
    },
    {
      icon: UserRound,
      label: "Handle",
      value: profile?.handle ? `@${profile.handle}` : user?.handle ? `@${user.handle}` : "Not set",
    },
    {
      icon: Clock3,
      label: "Last active",
      value: profile?.lastActiveAt ? formatRelativeTime(profile.lastActiveAt) : "Moments ago",
    },
    {
      icon: Calendar,
      label: "Joined",
      value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Recently",
    },
  ];

  const metaItems = [
    {
      label: "Profile updated",
      value: profile?.updatedAt ? formatRelativeTime(profile.updatedAt) : "Just now",
    },
    {
      label: "Account status",
      value: profile?.status ?? "active",
    },
    {
      label: "Primary role",
      value: profile?.roles?.[0] ?? "member",
    },
  ];

  const heroSubtitle =
    profile?.roles && profile.roles.length > 1
      ? `Championing ${profile.roles.slice(0, 2).join(" & ")}`
      : profile?.roles?.[0]
        ? `Championing the ${profile.roles[0]} community`
        : "Keeping the KhoshGolpo warmth alive.";

  return (
    <div className="space-y-8 text-slate-700 transition-colors dark:text-slate-200">
      <div className="grid gap-6 xl:grid-cols-[1.8fr_1.2fr]">
        <Card className="relative overflow-hidden border-border/80 bg-gradient-to-br from-sky-500/5 via-card to-indigo-500/5 p-6 shadow-lg shadow-slate-200/30 transition-colors dark:border-slate-800/70 dark:from-sky-500/5 dark:via-slate-950 dark:to-indigo-500/5 dark:shadow-slate-950/40">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/20" aria-hidden="true" />
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-1 flex-wrap items-center gap-4">
                <div
                  className={cn(
                    "flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 text-2xl font-semibold text-white shadow-lg shadow-sky-500/40",
                  )}
                >
                  {(profile?.displayName ?? user?.displayName ?? "KG")
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="space-y-1">
                  <h1 className="text-3xl font-semibold leading-tight text-slate-900 transition-colors dark:text-white">
                    {profile?.displayName ?? user?.displayName ?? "Member"}
                  </h1>
                  <p className="text-sm text-muted-foreground">{heroSubtitle}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{profile?.handle ? `@${profile.handle}` : user?.handle ? `@${user.handle}` : "@handle"}</span>
                    <span>•</span>
                    <span>
                      Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "recently"}
                    </span>
                  </div>
                </div>
                <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 transition-colors dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <ShieldCheck className="size-3" aria-hidden="true" />
                  {profile?.roles?.[0] ?? "member"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-border bg-background/60 backdrop-blur dark:border-slate-700 dark:bg-slate-900/60"
                asChild
              >
                <a href="#profile-form">
                  <PenSquare className="size-4" aria-hidden="true" />
                  Edit profile
                </a>
              </Button>
            </div>
            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive transition-colors dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                {error instanceof Error ? error.message : "Unable to load profile details right now."}
              </div>
            )}
            {isLoading && <div className="text-sm text-muted-foreground">Loading profile details…</div>}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {formattedStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border/60 bg-card/80 px-4 py-5 shadow-inner shadow-slate-200/40 transition-colors dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-slate-950/70"
                >
                  <p className="text-2xl font-semibold text-slate-900 transition-colors dark:text-white">{item.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-xs text-muted-foreground opacity-80">{item.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="border-border/80 bg-card/90 p-6 shadow-lg shadow-slate-200/30 transition-colors dark:border-slate-800/70 dark:bg-slate-950/80 dark:shadow-slate-950/40">
          <p className="text-sm font-semibold text-slate-900 transition-colors dark:text-white">Account insights</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Snapshot of how your profile shows up across the community.
          </p>
          <div className="mt-5 grid gap-4">
            {detailItems.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-secondary/60 px-4 py-4 transition-colors dark:border-slate-800/70 dark:bg-slate-900/70"
              >
                <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-900 transition-colors dark:text-white">{label}</p>
                  <p className="text-sm text-muted-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl border border-border/60 bg-card/80 px-4 py-4 transition-colors dark:border-slate-800/70 dark:bg-slate-900/70">
            {metaItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-slate-900 transition-colors dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="border-border/80 bg-card/90 p-6 shadow-lg shadow-slate-200/30 transition-colors dark:border-slate-800/70 dark:bg-card/80 dark:shadow-slate-950/40" id="profile-form">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-slate-900 transition-colors dark:text-white">Edit profile</h2>
          <p className="text-sm text-muted-foreground">
            Update your public display name. Handle and email changes require contacting an administrator.
          </p>
        </div>
        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" {...form.register("displayName")} placeholder="Your name" />
            {form.formState.errors.displayName && (
              <p className="text-xs text-destructive">{form.formState.errors.displayName.message}</p>
            )}
          </div>
          <Button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold uppercase tracking-[0.22em] text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-500"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

