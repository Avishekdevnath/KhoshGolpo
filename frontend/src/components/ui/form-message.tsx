"use client";

import { cn } from '@/lib/utils/style';

interface FormMessageProps {
  message?: string;
  className?: string;
}

export function FormMessage({ message, className }: FormMessageProps) {
  if (!message) {
    return null;
  }

  return <p className={cn('text-sm text-red-600 dark:text-red-400', className)}>{message}</p>;
}

