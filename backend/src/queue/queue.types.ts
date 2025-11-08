import type { JobsOptions } from 'bullmq';

export interface AiModerationJob {
  postId: string;
  threadId: string;
  authorId: string;
  content: string;
  language?: string;
  timeoutMs?: number;
}

export interface AiSummaryJob {
  threadId: string;
  requesterId: string;
  prompt: string;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface NotificationJob {
  event: string;
  payload: Record<string, unknown>;
  webhookUrl: string;
  retryLimit?: number;
  recipientIds?: string[];
}

export type QueueJobPayload =
  | { type: 'aiModeration'; data: AiModerationJob; options?: JobsOptions }
  | { type: 'aiSummary'; data: AiSummaryJob; options?: JobsOptions }
  | { type: 'notifications'; data: NotificationJob; options?: JobsOptions };

