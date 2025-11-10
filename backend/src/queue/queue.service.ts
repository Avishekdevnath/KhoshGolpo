import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, JobsOptions } from 'bullmq';
import type { RedisOptions } from 'ioredis';
import IORedis from 'ioredis';
import {
  DEFAULT_QUEUE_NAMES,
  QUEUE_CONFIG_KEYS,
  QueueIdentifier,
} from './queue.constants';
import type {
  AiModerationJob,
  AiSummaryJob,
  NotificationJob,
} from './queue.types';
import { resolveRedisConnection } from '../common/utils/redis.util';

const DEFAULT_JOB_OPTIONS: JobsOptions = {
  removeOnComplete: true,
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
};

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private readonly connection: IORedis;
  private readonly queues = new Map<string, Queue>();

  constructor(
    private readonly configService: ConfigService,
    @Optional() @Inject('QUEUE_REDIS_OPTIONS') options?: RedisOptions,
  ) {
    const connectionString =
      this.configService.get<string>('REDIS_QUEUE_URL') ||
      this.configService.get<string>('REDIS_URL');

    if (!connectionString) {
      throw new Error(
        'Redis queue connection string missing. Set REDIS_QUEUE_URL or REDIS_URL.',
      );
    }

    const { url: normalizedUrl, options: connectionOptions } =
      resolveRedisConnection(this.configService, connectionString, {
        maxRetriesPerRequest: null,
        ...options,
      });

    this.connection = new IORedis(normalizedUrl, connectionOptions);

    this.connection.on('error', (error) => {
      this.logger.error('Redis queue connection error', error.stack);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all(
      Array.from(this.queues.values()).map(async (queue) => queue.close()),
    );
    await this.connection.quit();
  }

  async enqueueModerationJob(
    payload: AiModerationJob,
    options?: JobsOptions,
  ): Promise<void> {
    const queue = this.getQueue('aiModeration');
    await queue.add('aiModeration', payload, this.mergeJobOptions(options));
  }

  async enqueueSummaryJob(
    payload: AiSummaryJob,
    options?: JobsOptions,
  ): Promise<void> {
    const queue = this.getQueue('aiSummary');
    await queue.add('aiSummary', payload, this.mergeJobOptions(options));
  }

  async enqueueNotificationJob(
    payload: NotificationJob,
    options?: JobsOptions,
  ): Promise<void> {
    const queue = this.getQueue('notifications');
    await queue.add('notifications', payload, this.mergeJobOptions(options));
  }

  private mergeJobOptions(options?: JobsOptions): JobsOptions {
    return {
      ...DEFAULT_JOB_OPTIONS,
      ...(options ?? {}),
    };
  }

  private getQueue(identifier: QueueIdentifier): Queue {
    const queueName = this.resolveQueueName(identifier);

    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, {
        connection: this.connection,
        defaultJobOptions: DEFAULT_JOB_OPTIONS,
      });
      this.queues.set(queueName, queue);
      this.logger.log(`Queue initialized: ${queueName}`);
    }

    return this.queues.get(queueName)!;
  }

  private resolveQueueName(identifier: QueueIdentifier): string {
    const key = QUEUE_CONFIG_KEYS[identifier];
    const configured = this.configService.get<string>(key);
    return configured && configured.trim().length > 0
      ? configured.trim()
      : DEFAULT_QUEUE_NAMES[identifier];
  }
}

