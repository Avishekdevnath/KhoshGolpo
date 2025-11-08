import { env } from '@/lib/config/env';

export class ApiError<T = unknown> extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: T,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions<TBody> {
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  accessToken?: string | null;
  cache?: RequestCache;
  signal?: AbortSignal;
}

export async function apiFetch<TResponse, TBody = unknown>(
  path: string,
  { method = 'GET', body, headers, accessToken, cache, signal }: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const url = `${env.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const finalHeaders = new Headers(headers);

  if (body && !(body instanceof FormData) && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    finalHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    credentials: 'include',
    body:
      body && !(body instanceof FormData)
        ? JSON.stringify(body)
        : (body as BodyInit | undefined),
    cache,
    signal,
  });

  const text = await response.text();
  const data = text ? (safeJsonParse(text) as TResponse & { message?: string }) : undefined;

  if (!response.ok) {
    const message = data && typeof data === 'object' && 'message' in data && data.message
      ? String(data.message)
      : response.statusText || 'Request failed';

    throw new ApiError(message, response.status, data);
  }

  return data as TResponse;
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

