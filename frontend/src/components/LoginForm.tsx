"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/lib/auth/hooks";
import { appConfig } from "@/lib/config/env";
import { getErrorMessage } from "@/lib/utils/error";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().trim().min(1, "Enter your email address.").email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const { login, isActionPending } = useAuth();

  const [rootError, setRootError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    resetField,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const submit = useCallback(
    async ({ email, password }: LoginFormValues) => {
      setRootError(null);
      setSuccessMessage(null);

      try {
        await login({ email, password });

        setSuccessMessage("Signed in — redirecting to the KhoshGolpo workspace.");
        resetField("password");

        successTimeoutRef.current = setTimeout(() => {
          router.replace(appConfig.defaultRedirect);
          router.refresh();
        }, 800);
      } catch (error) {
        const message = getErrorMessage(error, "Invalid credentials. Please try again.");
        setRootError(message);
        setError("password", { message: "Check your credentials and try again." });
      }
    },
    [login, resetField, router, setError],
  );

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      void handleSubmit(submit)(event);
    },
    [handleSubmit, submit],
  );

  const [showPassword, setShowPassword] = useState(false);
  const pending = isSubmitting || isActionPending;
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((current) => !current);
  }, []);

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" placeholder="team@khoshgolpo.com" {...register("email")} />
        <FormMessage message={errors.email?.message} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/auth/forgot-password" className="text-xs font-medium text-emerald-300 hover:text-emerald-200">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="pr-12"
            {...register("password")}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-2 flex items-center justify-center rounded-md p-2 text-emerald-300 transition hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
            aria-pressed={showPassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
            <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
          </button>
        </div>
        <FormMessage message={errors.password?.message} />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="size-4 rounded border border-slate-700 bg-slate-900/80 text-emerald-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 dark:border-slate-700"
            {...register("rememberMe")}
          />
          <span className="select-none uppercase tracking-[0.2em]">Remember me</span>
        </label>

        <span className="uppercase tracking-[0.2em] text-slate-500">Secure entry</span>
      </div>

      {rootError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400 transition">
          <AlertCircle className="size-4" aria-hidden />
          <span aria-live="assertive">{rootError}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 transition">
          <CheckCircle2 className="size-4" aria-hidden />
          <span aria-live="polite">{successMessage}</span>
        </div>
      )}

      <Button
        type="submit"
        className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-400 hover:to-teal-500"
        isLoading={pending}
        disabled={pending}
      >
        Sign in
      </Button>

      <p className="text-center text-sm text-slate-400">
        New to KhoshGolpo?{" "}
        <Link href="/auth/register" className="font-semibold text-emerald-300 transition hover:text-emerald-200">
          Create an account
        </Link>
        .
      </p>
    </form>
  );
}
