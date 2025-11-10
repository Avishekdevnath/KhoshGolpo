import type { RedisOptions } from 'ioredis';
import { ConfigService } from '@nestjs/config';

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'y']);
const FALSE_VALUES = new Set(['0', 'false', 'no', 'n']);

const REDIS_SCHEME = /^redis:\/\//i;
const REDISS_SCHEME = /^rediss:\/\//i;

const DEFAULT_TLS_REJECT_UNAUTHORIZED = true;

function maybeParseBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (TRUE_VALUES.has(normalized)) {
      return true;
    }
    if (FALSE_VALUES.has(normalized)) {
      return false;
    }
  }

  return undefined;
}

function cloneRedisOptions(options?: RedisOptions): RedisOptions {
  if (!options) {
    return {};
  }

  const cloned: RedisOptions = { ...options };
  if (options.tls) {
    cloned.tls = { ...options.tls };
  }

  return cloned;
}

function normalizeRedisScheme(url: string, scheme: 'redis' | 'rediss'): string {
  if (scheme === 'rediss') {
    if (REDIS_SCHEME.test(url)) {
      return url.replace(REDIS_SCHEME, 'rediss://');
    }
    if (!REDISS_SCHEME.test(url)) {
      return `rediss://${url}`;
    }
  } else if (scheme === 'redis' && REDISS_SCHEME.test(url)) {
    return url.replace(REDISS_SCHEME, 'redis://');
  }
  return url;
}

export function resolveRedisConnection(
  configService: ConfigService,
  url: string,
  baseOptions?: RedisOptions,
): { url: string; options: RedisOptions } {
  const requestedTls = maybeParseBoolean(
    configService.get<boolean | string | undefined>('REDIS_TLS_ENABLED'),
  );
  const rejectUnauthorized = maybeParseBoolean(
    configService.get<boolean | string | undefined>(
      'REDIS_TLS_REJECT_UNAUTHORIZED',
    ),
  );

  const options = cloneRedisOptions(baseOptions);
  const originalProtocol = (() => {
    try {
      return new URL(url).protocol.replace(':', '');
    } catch {
      return undefined;
    }
  })();

  const shouldUseTls =
    requestedTls !== undefined
      ? requestedTls
      : originalProtocol?.toLowerCase() === 'rediss';

  if (shouldUseTls) {
    const tlsOptions = options.tls ?? {};
    if (!('rejectUnauthorized' in tlsOptions)) {
      tlsOptions.rejectUnauthorized =
        rejectUnauthorized ?? DEFAULT_TLS_REJECT_UNAUTHORIZED;
    }
    options.tls = tlsOptions;
    url = normalizeRedisScheme(url, 'rediss');
  } else {
    options.tls = undefined;
    url = normalizeRedisScheme(url, 'redis');
  }

  return { url, options };
}


