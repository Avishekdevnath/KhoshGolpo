"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/lib/auth/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { getErrorMessage } from "@/lib/utils/error";
import { appConfig } from "@/lib/config/env";

const schema = z
  .object({
    email: z.string().email("Enter a valid email address."),
    handle: z
      .string()
      .min(3, "Handle must be at least 3 characters.")
      .max(20, "Handle must be at most 20 characters.")
      .regex(/^[a-z0-9_.-]+$/i, "Handle can contain letters, numbers, underscores, dots or dashes."),
    displayName: z.string().max(80, "Display name must be at most 80 characters.").optional().or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Please re-enter your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof schema>;

const inputClasses =
  "border-slate-800/70 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 shadow-inner shadow-slate-900/60 focus-visible:ring-emerald-400/40";

export function RegisterForm() {
  const router = useRouter();
  const { register: registerAccount, isActionPending } = useAuth();
  const [rootError, setRootError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      handle: "",
      displayName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async ({ confirmPassword: _ignore, displayName, ...values }) => {
    setRootError(null);
    try {
      const payload = {
        ...values,
        displayName: displayName?.trim() ? displayName.trim() : undefined,
      };
      await registerAccount(payload);
      router.replace(appConfig.defaultRedirect);
      router.refresh();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to create your account.");
      setRootError(message);
      setError("email", { message: "Check if the email is already registered." });
    }
  });

  const pending = isSubmitting || isActionPending;

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-300">
          Email
        </Label>
        <Input id="email" type="email" autoComplete="email" className={inputClasses} {...register("email")} />
        <FormMessage message={errors.email?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="handle" className="text-slate-300">
          Handle
        </Label>
        <Input id="handle" autoComplete="username" className={inputClasses} {...register("handle")} />
        <FormMessage message={errors.handle?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName" className="text-slate-300">
          Display name (optional)
        </Label>
        <Input id="displayName" autoComplete="name" className={inputClasses} {...register("displayName")} />
        <FormMessage message={errors.displayName?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-300">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className={`${inputClasses} pr-11`}
            {...register("password")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute inset-y-0 right-1 my-1 size-8 rounded-lg bg-slate-900/60 text-slate-300 hover:bg-slate-900/80 hover:text-white"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        </div>
        <FormMessage message={errors.password?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-slate-300">
          Re-enter password
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            className={`${inputClasses} pr-11`}
            {...register("confirmPassword")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute inset-y-0 right-1 my-1 size-8 rounded-lg bg-slate-900/60 text-slate-300 hover:bg-slate-900/80 hover:text-white"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        </div>
        <FormMessage message={errors.confirmPassword?.message} />
      </div>

      <FormMessage message={rootError ?? errors.root?.message} />

      <Button
        type="submit"
        className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-lg shadow-sky-500/30 hover:from-indigo-400 hover:to-sky-500"
        isLoading={pending}
      >
        Create account
      </Button>
    </form>
  );
}

