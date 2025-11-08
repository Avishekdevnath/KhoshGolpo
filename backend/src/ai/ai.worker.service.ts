import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_QUEUE_NAMES,
  QUEUE_CONFIG_KEYS,
  QueueIdentifier,
} from '../queue/queue.constants';
import type {
  AiModerationJob,
  AiSummaryJob,
} from '../queue/queue.types';
import { AiService } from './ai.service';

@Injectable()
export class AiWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AiWorkerService.name);
  private moderationWorker?: Worker;
  private summaryWorker?: Worker;
  private moderationConnection?: IORedis;
  private summaryConnection?: IORedis;
  private openAiClient?: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.isOpenAiEnabled()) {
      this.logger.warn(
        'OPENAI_API_KEY not set. AI workers will not process jobs.',
      );
      return;
    }

    const redisUrl = this.getRedisUrl();
    if (!redisUrl) {
      this.logger.warn(
        'REDIS_QUEUE_URL/REDIS_URL not configured. AI workers disabled.',
      );
      return;
    }

    this.openAiClient = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    this.moderationConnection = this.createRedisConnection(redisUrl);
    this.summaryConnection = this.createRedisConnection(redisUrl);

    this.moderationWorker = new Worker<AiModerationJob>(
      this.resolveQueueName('aiModeration'),
      async (job) => this.handleModerationJob(job),
      {
        connection: this.moderationConnection,
        concurrency: 5,
      },
    );

    this.summaryWorker = new Worker<AiSummaryJob>(
      this.resolveQueueName('aiSummary'),
      async (job) => this.handleSummaryJob(job),
      {
        connection: this.summaryConnection,
        concurrency: 2,
      },
    );

    this.registerWorkerEvents(this.moderationWorker, 'moderation');
    this.registerWorkerEvents(this.summaryWorker, 'summary');
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([
      this.moderationWorker?.close(),
      this.summaryWorker?.close(),
    ]);
    await Promise.all([
      this.moderationConnection?.quit(),
      this.summaryConnection?.quit(),
    ]);
  }

  private async handleModerationJob(job: Job<AiModerationJob>): Promise<void> {
    if (!this.openAiClient) {
      throw new Error('OpenAI client not initialized.');
    }

    const timeoutMs = job.data.timeoutMs ?? this.aiService.getRequestTimeoutMs();
    const response = await this.openAiClient.moderations.create(
      {
        model: this.aiService.getModerationModel(),
        input: job.data.content,
      },
      timeoutMs
        ? {
            timeout: timeoutMs,
          }
        : undefined,
    );

    const result = response.results?.[0];
    const flagged = Boolean(result?.flagged);
    const feedback = result
      ? JSON.stringify(result.categories ?? {}, null, 2)
      : undefined;

    await this.prisma.post.updateMany({
      where: { id: job.data.postId },
      data: {
        moderationState: flagged ? 'flagged' : 'approved',
        moderationFeedback: flagged ? feedback ?? null : null,
      },
    });

    if (flagged) {
      await this.prisma.thread.updateMany({
        where: { id: job.data.threadId },
        data: { status: 'locked', lastActivityAt: new Date() },
      });
    }
  }

  private async handleSummaryJob(job: Job<AiSummaryJob>): Promise<void> {
    if (!this.openAiClient) {
      throw new Error('OpenAI client not initialized.');
    }

    const timeoutMs = job.data.timeoutMs ?? this.aiService.getRequestTimeoutMs();

    const response = await this.openAiClient.responses.create(
      {
        model: this.aiService.getSummaryModel(),
        input: [
          {
            role: 'user',
            content: job.data.prompt,
          },
        ],
      },
      timeoutMs
        ? {
            timeout: timeoutMs,
          }
        : undefined,
    );

    const outputItems = response.output as Array<Record<string, any>> | undefined;

    const derivedSummary = outputItems
      ?.map((item) => {
        if (Array.isArray(item?.content)) {
          const contentText = item.content
            .map((contentItem: any) => {
              if (typeof contentItem?.text === 'string') {
                return contentItem.text;
              }

              if (
                contentItem?.text &&
                typeof contentItem.text === 'object' &&
                'value' in contentItem.text &&
                contentItem.text.value
              ) {
                return String(contentItem.text.value);
              }

              if (Array.isArray(contentItem?.output_text)) {
                return contentItem.output_text.join('\n');
              }

              return undefined;
            })
            .filter((text): text is string => Boolean(text?.trim()))
            .join('\n');

          if (contentText) {
            return contentText;
          }
        }

        if (Array.isArray(item?.output_text)) {
          return item.output_text.join('\n');
        }

        if (typeof item?.text === 'string') {
          return item.text;
        }

        return undefined;
      })
      .filter((text): text is string => Boolean(text?.trim()))
      .join('\n');

    const summary =
      response.output_text ?? (derivedSummary ? derivedSummary : undefined);

    if (!summary) {
      this.logger.warn(
        `Summary job ${job.id} produced no output. Skipping update.`,
      );
      return;
    }

    await this.prisma.thread.updateMany({
      where: { id: job.data.threadId },
      data: {
        summary,
        summaryGeneratedAt: new Date(),
      } as any,
    });
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
    connection.on('error', (err) => {
      this.logger.error('Redis worker connection error', err);
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

  private registerWorkerEvents(worker: Worker | undefined, label: string) {
    if (!worker) {
      return;
    }
    worker.on('completed', (job) => {
      this.logger.debug(
        `AI ${label} job ${job.id} completed in ${job.processedOn && job.finishedOn ? job.finishedOn - job.processedOn : 'unknown'}ms`,
      );
    });
    worker.on('failed', (job, error) => {
      this.logger.error(
        `AI ${label} job ${job?.id ?? 'unknown'} failed: ${error.message}`,
        error.stack,
      );
    });
  }

  private isOpenAiEnabled(): boolean {
    const key = this.configService.get<string>('OPENAI_API_KEY');
    return Boolean(key && key.trim().length > 0);
  }
}

