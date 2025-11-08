"use client";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span>{message}</span>
      </div>
    </div>
  );
}

