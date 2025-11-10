/**
 * API Client - HTTP Request Wrapper
 * 
 * Provides type-safe HTTP client for communicating with the backend API.
 * Handles authentication, error parsing, and request/response serialization.
 */

import { env } from '@/lib/config/env';

/**
 * Custom error class for API failures
 * Includes HTTP status code and response details for error handling
 */
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
  accessToken?: string | null; // JWT token for authenticated requests
  cache?: RequestCache;
  signal?: AbortSignal; // For request cancellation
}

/**
 * Type-safe API fetch wrapper
 * @param path - API endpoint path (e.g., '/auth/register')
 * @param options - Request configuration
 * @returns Parsed response data
 * @throws ApiError on request failure
 */
export async function apiFetch<TResponse, TBody = unknown>(
  path: string,
  { method = 'GET', body, headers, accessToken, cache, signal }: RequestOptions<TBody> = {},
): Promise<TResponse> {
  // Construct full API URL from environment configuration
  const url = `${env.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const finalHeaders = new Headers(headers);

  // Auto-set Content-Type for JSON payloads
  if (body && !(body instanceof FormData) && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  // Add JWT bearer token for authenticated requests
  if (accessToken) {
    finalHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  // Execute HTTP request with credentials for cookie-based auth
  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    credentials: 'include', // Include cookies (refresh token)
    body:
      body && !(body instanceof FormData)
        ? JSON.stringify(body) // Serialize objects to JSON
        : (body as BodyInit | undefined),
    cache,
    signal,
  });

  // Parse response body
  const text = await response.text();
  const data = text ? (safeJsonParse(text) as TResponse & { message?: string }) : undefined;

  // Handle error responses
  if (!response.ok) {
    const message = data && typeof data === 'object' && 'message' in data && data.message
      ? String(data.message)
      : response.statusText || 'Request failed';

    throw new ApiError(message, response.status, data);
  }

  return data as TResponse;
}

/**
 * Safely parse JSON without throwing errors
 * @returns Parsed object or undefined if parsing fails
 */
function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

