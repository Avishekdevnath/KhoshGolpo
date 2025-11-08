import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to continue the conversation.</CardDescription>
      </CardHeader>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="font-medium text-black hover:underline dark:text-zinc-100">
          Create one
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-500">
        <Link href="/auth/forgot-password" className="hover:underline">
          Forgot password?
        </Link>
      </p>
    </Card>
  );
}

