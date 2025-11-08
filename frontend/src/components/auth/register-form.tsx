"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormMessage } from '@/components/ui/form-message';
import { getErrorMessage } from '@/lib/utils/error';
import { appConfig } from '@/lib/config/env';

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
  handle: z
    .string()
    .min(3, 'Handle must be at least 3 characters.')
    .max(20, 'Handle must be at most 20 characters.')
    .regex(/^[a-z0-9_.-]+$/i, 'Handle can contain letters, numbers, underscores, dots or dashes.'),
  displayName: z
    .string()
    .max(80, 'Display name must be at most 80 characters.')
    .optional()
    .transform((value) => value?.trim() || undefined),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

type RegisterFormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const { register: registerAccount, isActionPending } = useAuth();
  const [rootError, setRootError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      handle: '',
      displayName: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setRootError(null);
    try {
      await registerAccount(values);
      router.replace(appConfig.defaultRedirect);
      router.refresh();
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to create your account.');
      setRootError(message);
      setError('email', { message: 'Check if the email is already registered.' });
    }
  });

  const pending = isSubmitting || isActionPending;

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        <FormMessage message={errors.email?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="handle">Handle</Label>
        <Input id="handle" autoComplete="username" {...register('handle')} />
        <FormMessage message={errors.handle?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Display name (optional)</Label>
        <Input id="displayName" autoComplete="name" {...register('displayName')} />
        <FormMessage message={errors.displayName?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
        <FormMessage message={errors.password?.message} />
      </div>

      <FormMessage message={rootError ?? errors.root?.message} />

      <Button type="submit" className="w-full" isLoading={pending}>
        Create account
      </Button>
    </form>
  );
}

