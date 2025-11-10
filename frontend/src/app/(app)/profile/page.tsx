"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Calendar, ShieldCheck } from "lucide-react";

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
  handle: z
    .string()
    .trim()
    .min(3, "Handle must be at least 3 characters.")
    .max(20, "Handle must be at most 20 characters.")
    .regex(/^[a-z0-9_.-]+$/i, "Handle can include letters, numbers, dots, underscores or dashes."),
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
      handle: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName ?? "",
        handle: profile.handle ?? "",
      });
    }
  }, [form, profile]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: ProfileFormValues = {
      displayName: values.displayName.trim(),
      handle: values.handle.trim(),
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
    },
    {
      label: "Posts shared",
      value: profile?.postsCount ?? 0,
    },
    {
      label: "Roles",
      value: profile?.roles?.join(", ") ?? "member",
    },
    {
      label: "Status",
      value: profile?.status ?? "active",
    },
  ];

  return (
    <div className="space-y-8 text-slate-200">
      <Card className="border border-slate-800/70 bg-slate-950/70">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <div className="flex flex-col gap-3">
              <div className="inline-flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-xl font-semibold text-white shadow-lg shadow-sky-500/40",
                  )}
                >
                  {(profile?.displayName ?? user?.displayName ?? "KG")
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-white">{profile?.displayName ?? user?.displayName ?? "Member"}</h1>
                  <p className="text-sm text-slate-400">@{profile?.handle ?? user?.handle}</p>
                </div>
                <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  <ShieldCheck className="size-3" />
                  {profile?.roles?.[0] ?? "member"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Joined {profile?.createdAt ? formatRelativeTime(profile.createdAt) : "recently"} • Last active{" "}
                {profile?.lastActiveAt ? formatRelativeTime(profile.lastActiveAt) : "moments ago"}
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error instanceof Error ? error.message : "Unable to load profile details right now."}
              </div>
            )}

            {isLoading && (
              <div className="text-sm text-slate-400">Loading profile details…</div>
            )}

            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display name</Label>
                  <Input
                    id="displayName"
                    {...form.register("displayName")}
                    placeholder="Your name"
                    className="border-slate-800/70 bg-slate-900/70 text-slate-200 placeholder:text-slate-500"
                  />
                  {form.formState.errors.displayName && (
                    <p className="text-xs text-red-300">{form.formState.errors.displayName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="handle">Handle</Label>
                  <Input
                    id="handle"
                    {...form.register("handle")}
                    placeholder="handle"
                    className="border-slate-800/70 bg-slate-900/70 text-slate-200 placeholder:text-slate-500"
                  />
                  {form.formState.errors.handle && (
                    <p className="text-xs text-red-300">{form.formState.errors.handle.message}</p>
                  )}
                </div>
              </div>
              <Button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold uppercase tracking-[0.22em] text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-500"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-white">Account snapshot</p>
              <p className="text-xs text-slate-400">Quick metrics that help you track your warmth footprint.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-800/70 bg-slate-900/70 px-4 py-5 text-center shadow-inner shadow-slate-900/60"
                >
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-widest text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/70 px-4 py-4 text-xs text-slate-400">
              <Calendar className="size-4 text-slate-500" />
              Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

