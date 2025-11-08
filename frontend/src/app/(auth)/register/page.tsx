import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your workspace</CardTitle>
        <CardDescription>Choose a handle and introduce yourself to the community.</CardDescription>
      </CardHeader>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-medium text-black hover:underline dark:text-zinc-100">
          Sign in
        </Link>
      </p>
    </Card>
  );
}

