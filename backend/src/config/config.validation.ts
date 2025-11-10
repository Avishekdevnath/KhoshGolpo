import * as Joi from 'joi';

const originListValidator = Joi.string().custom((value, helpers) => {
  const origins = value
    .split(',')
    .map((origin: string) => origin.trim())
    .filter(Boolean);
  if (origins.length === 0) {
    return helpers.error('string.empty');
  }
  for (const origin of origins) {
    try {
      // eslint-disable-next-line no-new
      new URL(origin);
    } catch {
      return helpers.error('string.uri', { value: origin });
    }
  }
  return value;
}, 'comma separated origin list');

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(4000),
  FRONTEND_URL: originListValidator.optional(),

  MONGO_URI: Joi.string().uri().required(),
  REDIS_URL: Joi.string().uri().optional(),
  REDIS_QUEUE_URL: Joi.string().uri().optional(),
  REDIS_CACHE_URL: Joi.string().uri().optional(),
  REDIS_TLS_ENABLED: Joi.boolean().optional(),
  REDIS_TLS_REJECT_UNAUTHORIZED: Joi.boolean().optional(),

  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  REFRESH_TOKEN_SECRET: Joi.string().min(16).required(),
  REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('7d'),

  OPENAI_API_KEY: Joi.string().optional(),
  AI_MODERATION_MODEL: Joi.string().default('text-moderation-latest'),
  AI_SUMMARY_MODEL: Joi.string().default('gpt-4o-mini'),
  AI_REQUEST_TIMEOUT_MS: Joi.number().default(10_000),

  NOTIFICATION_WEBHOOK_URL: Joi.string().uri().optional(),
  NOTIFICATION_RETRY_LIMIT: Joi.number().default(5),

  EMAIL_HOST: Joi.string().hostname().required(),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_SECURE: Joi.boolean().default(false),
  GMAIL_USER: Joi.string().email().required(),
  GMAIL_APP_PASSWORD: Joi.string().min(16).required(),
  EMAIL_FROM_NAME: Joi.string().default('KhoshGolpo'),
  DOMAIN: Joi.string().hostname().required(),
  EMAIL_VERIFICATION_TOKEN_TTL: Joi.string().default('24h'),

  RATE_LIMIT_WINDOW_MS: Joi.number().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(120),

  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent')
    .default('debug'),

  SENTRY_DSN: Joi.string().uri().optional(),
  METRICS_PORT: Joi.number().default(9100),
  SWAGGER_TITLE: Joi.string().optional(),
  SWAGGER_DESCRIPTION: Joi.string().optional(),
  SWAGGER_VERSION: Joi.string().optional(),
  SWAGGER_PATH: Joi.string()
    .pattern(/^[a-z0-9\-\/]+$/i)
    .optional(),
});

