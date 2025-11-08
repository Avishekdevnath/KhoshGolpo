import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Password reset coming soon</CardTitle>
        <CardDescription>
          We&apos;re finishing the secure recovery flow. Reach out to support if you need help in the
          meantime.
        </CardDescription>
      </CardHeader>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Head back to the{' '}
        <Link href="/auth/login" className="font-medium text-black hover:underline dark:text-zinc-100">
          sign-in page
        </Link>{' '}
        whenever you&apos;re ready.
      </p>
    </Card>
  );
}

