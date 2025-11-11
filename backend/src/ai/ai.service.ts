import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueueService } from '../queue/queue.service';
import type { AiModerationJob, AiSummaryJob } from '../queue/queue.types';
import { AI_CONFIG_KEYS, AI_DEFAULTS } from './ai.constants';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly configService: ConfigService,
  ) {}

  async queuePostModeration(
    data: Omit<AiModerationJob, 'language'> & { language?: string },
  ): Promise<void> {
    if (!this.isEnabled()) {
      this.logger.debug('Skipping AI moderation queueing; OpenAI is disabled.');
      return;
    }

    const job: AiModerationJob = {
      ...data,
      language: data.language,
    };

    await this.queueService.enqueueModerationJob({
      ...job,
      timeoutMs: this.getRequestTimeoutMs(),
    });
  }

  async queueThreadSummary(data: AiSummaryJob): Promise<void> {
    if (!this.isEnabled()) {
      this.logger.debug('Skipping AI summary queueing; OpenAI is disabled.');
      return;
    }

    await this.queueService.enqueueSummaryJob({
      ...data,
      timeoutMs: this.getRequestTimeoutMs(),
    });
  }

  getModerationModel(): string {
    return (
      this.configService.get<string>(AI_CONFIG_KEYS.moderationModel) ??
      AI_DEFAULTS.moderationModel
    );
  }

  getSummaryModel(): string {
    return (
      this.configService.get<string>(AI_CONFIG_KEYS.summaryModel) ??
      AI_DEFAULTS.summaryModel
    );
  }

  getRequestTimeoutMs(): number {
    const configured = this.configService.get<string>(
      AI_CONFIG_KEYS.requestTimeout,
    );
    const parsed = configured ? Number.parseInt(configured, 10) : undefined;
    return Number.isFinite(parsed) && parsed && parsed > 0
      ? parsed
      : AI_DEFAULTS.requestTimeoutMs;
  }

  private isEnabled(): boolean {
    const key = this.configService.get<string>('OPENAI_API_KEY');
    return Boolean(key && key.trim().length > 0);
  }
}
