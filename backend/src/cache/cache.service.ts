import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly client: IORedis;

  constructor(private readonly configService: ConfigService) {
    const redisUrl =
      this.configService.get<string>('REDIS_CACHE_URL') ||
      this.configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      throw new Error(
        'Redis cache URL not configured. Set REDIS_CACHE_URL or REDIS_URL.',
      );
    }
    this.client = new IORedis(redisUrl, { maxRetriesPerRequest: null });
    this.client.on('error', (error) => {
      this.logger.error('Cache Redis connection error', error);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) {
      return null;
    }
    return JSON.parse(value) as T;
  }

  async set<T = unknown>(
    key: string,
    value: T,
    ttlSeconds: number,
  ): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    const stream = this.client.scanStream({
      match: pattern,
      count: 100,
    });

    const pipeline = this.client.pipeline();
    let hasKeys = false;

    await new Promise<void>((resolve, reject) => {
      stream.on('data', (keys: string[]) => {
        if (keys.length) {
          hasKeys = true;
          keys.forEach((key) => pipeline.del(key));
        }
      });
      stream.on('end', () => resolve());
      stream.on('error', (error) => reject(error));
    });

    if (hasKeys) {
      await pipeline.exec();
    }
  }
}

