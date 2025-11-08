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
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

type LoginFormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const { login, isActionPending } = useAuth();
  const [rootError, setRootError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setRootError(null);
    try {
      await login(values);
      router.replace(appConfig.defaultRedirect);
      router.refresh();
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to sign in.');
      setRootError(message);
      setError('password', { message: 'Check your credentials and try again.' });
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
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
        <FormMessage message={errors.password?.message} />
      </div>

      <FormMessage message={rootError ?? errors.root?.message} />

      <Button type="submit" className="w-full" isLoading={pending}>
        Sign in
      </Button>
    </form>
  );
}

