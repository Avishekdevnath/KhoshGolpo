export const DEFAULT_QUEUE_NAMES = {
  aiModeration: 'ai-moderation',
  aiSummary: 'ai-summary',
  notifications: 'notifications',
} as const;

export const QUEUE_CONFIG_KEYS = {
  aiModeration: 'AI_MODERATION_QUEUE',
  aiSummary: 'AI_SUMMARY_QUEUE',
  notifications: 'NOTIFICATION_QUEUE',
} as const;

export type QueueIdentifier = keyof typeof DEFAULT_QUEUE_NAMES;
