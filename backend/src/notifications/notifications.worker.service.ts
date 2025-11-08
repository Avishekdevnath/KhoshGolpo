import {
  HttpStatus,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import {
  DEFAULT_QUEUE_NAMES,
  QUEUE_CONFIG_KEYS,
  QueueIdentifier,
} from '../queue/queue.constants';
import type { NotificationJob } from '../queue/queue.types';
import { NOTIFICATION_DEFAULTS } from './notifications.constants';

@Injectable()
export class NotificationsWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsWorkerService.name);
  private worker?: Worker<NotificationJob>;
  private connection?: IORedis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const webhookUrl = this.getWebhookUrl();
    if (!webhookUrl) {
      this.logger.warn(
        'NOTIFICATION_WEBHOOK_URL not configured; notification worker is disabled.',
      );
      return;
    }

    const redisUrl = this.getRedisUrl();
    if (!redisUrl) {
      this.logger.warn(
        'REDIS_QUEUE_URL/REDIS_URL not configured; notification worker is disabled.',
      );
      return;
    }

    this.connection = this.createRedisConnection(redisUrl);

    this.worker = new Worker<NotificationJob>(
      this.resolveQueueName('notifications'),
      async (job) => this.handleNotificationJob(job),
      {
        connection: this.connection,
        concurrency: 3,
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.debug(`Notification job ${job.id} delivered successfully.`);
    });

    this.worker.on('failed', (job, error) => {
      this.logger.error(
        `Notification job ${job?.id ?? 'unknown'} failed: ${error.message}`,
        error.stack,
      );
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
    await this.connection?.quit();
  }

  private async handleNotificationJob(job: Job<NotificationJob>): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), NOTIFICATION_DEFAULTS.requestTimeoutMs);

    try {
      const response = await fetch(job.data.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: job.data.event,
          payload: job.data.payload,
          attempts: job.attemptsMade + 1,
          queuedAt: job.timestamp,
          processedAt: Date.now(),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `Webhook responded with status ${response.status} ${HttpStatus[response.status] ?? ''} body=${body}`,
        );
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Webhook request timed out.');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private getWebhookUrl(): string | undefined {
    const url = this.configService.get<string>('NOTIFICATION_WEBHOOK_URL');
    const trimmed = url?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : undefined;
  }

  private getRedisUrl(): string | undefined {
    return (
      this.configService.get<string>('REDIS_QUEUE_URL') ||
      this.configService.get<string>('REDIS_URL') ||
      undefined
    );
  }

  private createRedisConnection(url: string): IORedis {
    const connection = new IORedis(url, { maxRetriesPerRequest: null });
    connection.on('error', (error) => {
      this.logger.error('Notification worker Redis connection error', error);
    });
    return connection;
  }

  private resolveQueueName(identifier: QueueIdentifier): string {
    const key = QUEUE_CONFIG_KEYS[identifier];
    const configured = this.configService.get<string>(key);
    return configured && configured.trim().length > 0
      ? configured.trim()
      : DEFAULT_QUEUE_NAMES[identifier];
  }
}

