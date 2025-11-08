import { ApiError } from '@/lib/api/client';

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (!error) {
    return fallback;
  }

  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return fallback;
  }
}

