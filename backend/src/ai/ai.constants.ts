export const AI_CONFIG_KEYS = {
  moderationModel: 'AI_MODERATION_MODEL',
  summaryModel: 'AI_SUMMARY_MODEL',
  requestTimeout: 'AI_REQUEST_TIMEOUT_MS',
} as const;

export const AI_DEFAULTS = {
  moderationModel: 'text-moderation-latest',
  summaryModel: 'gpt-4o-mini',
  requestTimeoutMs: 10_000,
};
