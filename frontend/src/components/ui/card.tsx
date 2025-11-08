"use client";

import { cn } from '@/lib/utils/style';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('w-full rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-900', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn('mb-6 space-y-2 text-center', className)}>{children}</div>;
}

export function CardTitle({ children, className }: CardProps) {
  return <h1 className={cn('text-2xl font-semibold tracking-tight', className)}>{children}</h1>;
}

export function CardDescription({ children, className }: CardProps) {
  return <p className={cn('text-sm text-zinc-600 dark:text-zinc-400', className)}>{children}</p>;
}

