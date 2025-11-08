export const NOTIFICATION_CONFIG_KEYS = {
  webhookUrl: 'NOTIFICATION_WEBHOOK_URL',
  retryLimit: 'NOTIFICATION_RETRY_LIMIT',
} as const;

export const NOTIFICATION_DEFAULTS = {
  retryLimit: 5,
  requestTimeoutMs: 8000,
};

